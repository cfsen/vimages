use log::{debug, error, info};
use std::{
    io::ErrorKind, path::PathBuf, sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    }
};
use tokio::{
    fs,
    sync::mpsc,
    task,
};

use crate::{img_cache::{cache, img}, ipc::send};
use crate::get_db;

#[derive(Debug, Clone)]
pub struct QueueItem {
    pub full_path: PathBuf,
    pub path_hash: String,
    pub file_hash: String,
}

#[derive(Debug, Clone)]
pub enum QueueMsg {
    ImageAdded,
    WorkerComplete,
}

#[derive(Debug)]
pub struct Queue {
    sender: mpsc::UnboundedSender<QueueItem>,
    size: Arc<AtomicUsize>,
    event_sender: mpsc::UnboundedSender<QueueMsg>,
}

impl Queue {
    pub fn new() -> (Self, mpsc::UnboundedReceiver<QueueItem>, mpsc::UnboundedReceiver<QueueMsg>) {
        let (sender, receiver) = mpsc::unbounded_channel();
        let (event_sender, event_receiver) = mpsc::unbounded_channel();
        let size = Arc::new(AtomicUsize::new(0));

        let queue = Queue { sender, size, event_sender };

        (queue, receiver, event_receiver)
    }

    // TODO: FUTURE: enqueue allows duplicates to be added to queue,
    // causing thumbnails to be generated twice.
    // this should now be mostly resolved by directory locking in frontend.
    // revisit with REFACTOR_IMAGE_PIPELINE
    pub async fn enqueue(&self, item: QueueItem) -> Result<(), String> {
        match self.sender.send(item) {
            Ok(_) => {
                self.size.fetch_add(1, Ordering::SeqCst);
                let _ = self.event_sender.send(QueueMsg::ImageAdded);
                Ok(())
            }
            Err(_) => Err("Failed to enqueue item".to_string()),
        }
    }

    pub async fn size(&self) -> usize {
        self.size.load(Ordering::SeqCst)
    }
}

// Worker that processes the queue
pub struct QueueWorker;

impl QueueWorker {
    pub async fn start(
        mut receiver: mpsc::UnboundedReceiver<QueueItem>,
        size: Arc<AtomicUsize>,
    ) {
        // check base cache directory
        let cache_path = match cache::get_cache_path_async().await {
            Ok(path) => path,
            Err(e) => {
                error!("QueueWorker failed to get or create cache path: {e}");
                return;
            }
        };

        while let Some(item) = receiver.recv().await {
            debug!("Generate thumbnail: {}", item.full_path.to_string_lossy());

            let mut thumb_path = cache_path.clone();
            thumb_path.push(&item.path_hash);

            // ensure the specific item's hash directory exists
            match fs::create_dir_all(&thumb_path).await {
                Ok(_) => {},
                Err(e) if e.kind() == ErrorKind::AlreadyExists => {},
                Err(e) => {
                    // TODO: granular error handling
                    error!("Failed to create item-specific directory {thumb_path:?}: {e}");
                    size.fetch_sub(1, Ordering::SeqCst);
                    continue;
                }
            }

            thumb_path.push(&item.file_hash);
            thumb_path.set_extension("webp");

            let org_path = item.full_path.clone();
            let result = task::spawn_blocking(move || {
                img::create_thumbnail(org_path.as_path(), &thumb_path)
            })
            .await; // awaits JoinHandle from spawn_blocking

            match result {
                Ok(Ok(())) => {
                    debug!("Thumbnail generated successfully for {}", item.full_path.to_string_lossy());

                    if let Err(e) = get_db().insert_hash(
                        &item.path_hash,
                        &item.file_hash,
                        &item.full_path.to_string_lossy()
                    ) {
                        error!("Failed to insert hash for {}, {}", item.full_path.to_string_lossy(), e);
                    }
                }
                Ok(Err(e)) => {
                    let failed_img_path = item.full_path.to_string_lossy();
                    match e {
                        image::ImageError::Unsupported(unsupported_error) => {
                            error!("image failed to generate thumbnail for file: {failed_img_path}");
                            error!("image error: {unsupported_error}");
                            send::info_window_msg(&format!("Failed to create thumbnail for: {failed_img_path}"));
                            send::info_window_msg(&format!("Reason: {unsupported_error}"));
                        }
                        _ => {
                            error!("Error generating thumbnail for {failed_img_path}: {e}");
                        }
                    }
                }
                Err(join_error) => {
                    error!("Spawn blocking task for {} failed: {:?}", item.full_path.to_string_lossy(), join_error);

                    if join_error.is_panic() {
                        error!("try_into_panic(): true");
                    }
                    if join_error.is_cancelled() {
                        error!("is_cancelled(): true");
                    }
                }
            }

            let remaining = size.fetch_sub(1, Ordering::SeqCst).saturating_sub(1);
            if remaining % 10 == 0 || remaining < 10 {
                if remaining > 0 {
                    send::info_window_msg(&format!("{remaining:?} thumbnails in queue."));
                }
                else {
                    if let Some(parent) = item.full_path.parent() {
                        // TODO: readability TODO_QUEUE_STATUS_PARAMS
                        // update to use enum/type params
                        // sending: redraw=true, queue_empty=true
                        send::queue_status(parent, &true, &true);
                    }
                    send::info_window_msg("Thumbnails generated.");
                }
                info!("{remaining:?} images remaining in queue.");
            }
        }
        info!("Worker shutting down");
    }
}

// Constructor
pub async fn setup_queue() -> Queue {
    let (queue, mut main_receiver, mut main_event_receive) = Queue::new();
    let size_ref = queue.size.clone();

    let core_count = std::thread::available_parallelism()
        .map(|p| p.get())
        .unwrap_or(1);

    // TODO: tuned for dev env
    // needs tuning for a good middle ground of performance:UX
    //let worker_count = core_count * 4;
    let worker_count = 24;

    info!("Detected {core_count} CPU cores, spawning {worker_count} thumbnail workers");

    let mut worker_senders: Vec<mpsc::UnboundedSender<QueueItem>> =
    Vec::with_capacity(worker_count);
    for i in 0..worker_count {
        let (worker_sender, worker_receiver) = mpsc::unbounded_channel();
        worker_senders.push(worker_sender);

        let size_ref_clone = size_ref.clone();
        tokio::spawn(async move {
            debug!("Starting worker {i}");
            QueueWorker::start(worker_receiver, size_ref_clone).await;
        });
    }

    tokio::spawn(async move {
        info!("Starting queue dispatcher.");

        let mut next_worker_idx = 0;
        while let Some(item) = main_event_receive.recv().await {

            if let QueueMsg::ImageAdded = item {
                if let Some(img) = main_receiver.recv().await {
                    let worker_sender = &worker_senders[next_worker_idx];
                    worker_sender.send(img)
                        .unwrap_or_else(|e| error!("Failed to dispatch item to worker: {e}"));
                    next_worker_idx = (next_worker_idx + 1) % worker_senders.len();
                }
            }

        }
        info!("Queue dispatcher shutting down. Main receiver closed.");
    });

    queue
}

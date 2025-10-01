use log::{debug, error, info, warn};
use std::{
    collections::HashSet,
    path::PathBuf,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
};
use tokio::sync::mpsc;

use crate::{get_db, img_cache::queue_worker::QueueWorker, ipc::{send, types::IpcQueueOpCode}};

#[derive(Debug, Clone)]
pub struct QueueItem {
    pub full_path: PathBuf,
    pub path_hash: String,
    pub file_hash: String,
    pub queue_id: String,
}

impl QueueItem {
    pub fn new(full_path: PathBuf, path_hash: String, file_hash: String) -> Self {
        Self {
            queue_id: Self::id_from_hashes(&file_hash, &path_hash),
            full_path,
            path_hash,
            file_hash,
        }
    }
    fn id_from_hashes(file_hash: &String, path_hash: &String) -> String {
        format!("{}{}", &file_hash, &path_hash)
    }
}

#[derive(Debug, Clone)]
pub enum QueueMsg {
    ImageAdded {
        queue_id: String,
    },
    ImageCompleted {
        path_hash: String,
        filename_hash: String,
        path: String,
        queue_id: String,
    },
    ImageFailed {
        file_hash: String,
        path: String,
        error: String,
        queue_id: String,
    },
    WorkerErrorJoin {
        path: String,
        queue_id: String,
    },
    WorkerErrorCancelled {
        path: String,
        queue_id: String,
    },
    StatusQueue,
    StatusBlacklist,
}

#[derive(Debug)]
pub struct Queue {
    item_sender: mpsc::UnboundedSender<QueueItem>,
    size: Arc<AtomicUsize>,
    event_sender: mpsc::UnboundedSender<QueueMsg>,
}

impl Queue {
    pub fn new() -> (
        Self,
        mpsc::UnboundedReceiver<QueueItem>,
        mpsc::UnboundedReceiver<QueueMsg>,
    ) {
        let (item_sender, item_receiver) = mpsc::unbounded_channel();
        let (event_sender, event_receiver) = mpsc::unbounded_channel();
        let size = Arc::new(AtomicUsize::new(0));

        let queue = Queue {
            item_sender,
            size,
            event_sender,
        };

        (queue, item_receiver, event_receiver)
    }

    // enqueue an item and increment the queue size
    pub async fn enqueue(&self, item: QueueItem) -> Result<(), String> {
        let queue_id = item.queue_id.clone();
        match self.item_sender.send(item) {
            Ok(_) => {
                self.size.fetch_add(1, Ordering::SeqCst);
                let _ = self.event_sender.send(QueueMsg::ImageAdded {
                    queue_id
                });
                Ok(())
            }
            Err(_) => Err("Failed to enqueue item".to_string()),
        }
    }

    pub async fn status(&self, query: QueueMsg) -> Result<bool, bool> {
        match query {
            QueueMsg::StatusQueue => {},
            QueueMsg::StatusBlacklist => {},
            _ => return Err(false),
        }
        let _ = self.event_sender.send(query);
        Ok(true)
    }

    pub async fn size(&self) -> usize {
        self.size.load(Ordering::SeqCst)
    }
}

struct QueueSize {
    size: Arc<AtomicUsize>,
}
impl QueueSize {
    fn get(&self) -> usize {
        self.size.load(Ordering::SeqCst)
    }
    // fn inc(&self) -> usize {
    //     self.size.fetch_add(1, Ordering::SeqCst)
    // }
    fn dec(&self) -> usize {
        self.size.fetch_sub(1, Ordering::SeqCst).saturating_sub(1)
    }
}

// initializer
pub async fn setup_queue() -> Queue {
    let (queue, mut main_receiver, mut main_event_receiver) = Queue::new();
    let queue_size = QueueSize {
        size: queue.size.clone(),
    };

    let core_count = std::thread::available_parallelism()
        .map(|p| p.get())
        .unwrap_or(1);

    // TODO: tuned for dev env
    // needs tuning for a good middle ground of performance:UX
    // let worker_count = core_count * 4;
    let worker_count = 24;

    info!("Detected {core_count} CPU cores, spawning {worker_count} thumbnail workers");
    info!("Worker count set manually for dev env.");

    let mut worker_senders: Vec<mpsc::UnboundedSender<QueueItem>> =
        Vec::with_capacity(worker_count);
    for i in 0..worker_count {
        let main_event_sender = queue.event_sender.clone();
        let (worker_sender, worker_receiver) = mpsc::unbounded_channel();
        worker_senders.push(worker_sender);

        tokio::spawn(async move {
            debug!("Starting worker {i}");
            QueueWorker::start(worker_receiver, main_event_sender).await;
        });
    }

    tokio::spawn(async move {
        info!("Starting queue dispatcher.");

        let mut processing: HashSet<String> = HashSet::new();
        let mut blacklist: HashSet<String> = HashSet::new();

        let mut next_worker_idx = 0;
        while let Some(msg) = main_event_receiver.recv().await {

            match msg {

                QueueMsg::ImageAdded { queue_id: _ } => {
                    if let Some(img) = main_receiver.recv().await {
                        if blacklist.contains(&img.queue_id) {
                            send::info_window_msg(
                                &format!(
                                    "Found and skipped thumbnail for previously failed image: {}",
                                    &img.full_path.to_string_lossy()
                                ));

                            queue_size.dec();
                            continue;
                        }

                        if processing.contains(&img.queue_id) {
                            warn!(
                                "Ignoring enqueue, already in queue: {}",
                                &img.full_path.to_string_lossy()
                            );

                            queue_size.dec();
                            continue;
                        }

                        processing.insert(img.queue_id.clone());

                        let worker_sender = &worker_senders[next_worker_idx];
                        worker_sender.send(img)
                            .unwrap_or_else(|e| error!("Failed to dispatch item to worker: {e}"));
                        next_worker_idx = (next_worker_idx + 1) % worker_senders.len();
                    }
                    else {
                        queue_size.dec();
                        error!("QueueMsg -> ImageAdded: main_receiver.recv() found None, expected Some.");
                    }
                }

                QueueMsg::ImageCompleted {
                    path_hash,
                    filename_hash,
                    path,
                    queue_id,
                } => {
                    if processing.contains(&queue_id) {
                        processing.remove(&queue_id);
                        queue_size.dec();

                        if let Err(db_error) = get_db().insert_hash(&path_hash, &filename_hash, &path) {
                            let error_message = format!(
                                "Failed to record journal entry for {}, hash: {} / {}.\nError: {db_error}",
                                path, path_hash, filename_hash
                            );
                            send::info_window_msg(&error_message);
                            error!("{}", error_message);
                            blacklist.insert(queue_id);
                        }
                        else {
                            send::queue_status(
                                &IpcQueueOpCode::ImageComplete,
                                Some(&filename_hash),
                                Some(&path_hash)
                            );
                        }

                        frontend_queue_progress(queue_size.get());
                    }
                    else {
                        error!("QueueMsg -> ImageCompleted: No matching record in processing for id: {queue_id}");
                    }
                }

                QueueMsg::ImageFailed { file_hash, path, error, queue_id } => {
                    warn!("Failed to generate thumbnail for: {path}");
                    send::info_window_msg(&format!("Failed to generate thumbnail for {path}, error: {error}"));

                    if processing.remove(&queue_id) {
                        queue_size.dec();
                    }

                    if !blacklist.insert(queue_id) {
                        error!("Failed to add to blacklist: {}", &file_hash);
                    }

                    send::queue_status(&IpcQueueOpCode::ImageFailed, Some(&file_hash), None);
                }

                QueueMsg::WorkerErrorJoin { path, queue_id } => {
                    error!("Worker join error: {path}: {queue_id}");
                    send::queue_status(&IpcQueueOpCode::InternalError, None, None);
                }

                QueueMsg::WorkerErrorCancelled { path, queue_id } => {
                    error!("Worker cancelled: {path}: {queue_id}");
                    send::queue_status(&IpcQueueOpCode::InternalError, None, None);
                }
                QueueMsg::StatusBlacklist => {
                    send::queue_blacklist_status(blacklist.clone());
                }
                QueueMsg::StatusQueue => {
                    send::queue_processing_status(processing.clone());
                }

            }
        }

        info!("Queue dispatcher shutting down. Main receiver closed.");
    });

    queue
}

//
// helpers/utility
//

fn frontend_queue_progress(queue_size: usize) {
    if queue_size == 0 {
        send::info_window_msg("Thumbnails generated.");
    }
    else if queue_size % 10 == 0 || queue_size < 10 {
        send::info_window_msg(&format!("{queue_size:?} thumbnails in queue."));
    }
}

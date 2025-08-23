use log::{debug, error, info};
use std::{
    // io::ErrorKind,
    collections::{HashMap, HashSet}, path::PathBuf, sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    }
};
use tokio::{
    // fs,
    sync::mpsc,
    // task,
};

use crate::img_cache::queue_worker::QueueWorker;
// use crate::{img_cache::{cache, img, queue_worker::{handle_create_thumbnail_result, QueueWorker}}, ipc::send};
// use crate::get_db;

#[derive(Debug, Clone)]
pub struct QueueItem {
    pub full_path: PathBuf,
    pub path_hash: String,
    pub file_hash: String,
}

#[derive(Debug, Clone)]
pub enum QueueMsg {
    ImageAdded { file_hash: String },
    ImageFailed { file_hash: String },
    WorkerComplete { file_hash: String },
}

#[derive(Debug)]
pub struct Queue {
    item_sender: mpsc::UnboundedSender<QueueItem>,
    size: Arc<AtomicUsize>,
    event_sender: mpsc::UnboundedSender<QueueMsg>,
}

impl Queue {
    pub fn new() -> (Self, mpsc::UnboundedReceiver<QueueItem>, mpsc::UnboundedReceiver<QueueMsg>) {
        let (item_sender, item_receiver) = mpsc::unbounded_channel();
        let (event_sender, event_receiver) = mpsc::unbounded_channel();
        let size = Arc::new(AtomicUsize::new(0));

        let queue = Queue { item_sender, size, event_sender };

        (queue, item_receiver, event_receiver)
    }

    // enqueue an item and increment the queue size
    pub async fn enqueue(&self, item: QueueItem) -> Result<(), String> {
        let event_payload = item_hash(&item);
        match self.item_sender.send(item) {
            Ok(_) => {
                self.size.fetch_add(1, Ordering::SeqCst);
                let _ = self.event_sender.send(
                    QueueMsg::ImageAdded{ file_hash: event_payload }
                );
                Ok(())
            }
            Err(_) => Err("Failed to enqueue item".to_string()),
        }
    }

    pub async fn size(&self) -> usize {
        self.size.load(Ordering::SeqCst)
    }
}

struct QueueSize {
    size: Arc<AtomicUsize>
}
impl QueueSize {
    fn get(&self) -> usize { self.size.load(Ordering::SeqCst) }
    fn inc(&self) -> usize { self.size.fetch_add(1, Ordering::SeqCst) }
    fn dec(&self) -> usize { self.size.fetch_sub(1, Ordering::SeqCst).saturating_sub(1) }
}

// initializer
pub async fn setup_queue() -> Queue {
    let (queue, mut main_receiver, mut main_event_receiver) = Queue::new();
    let size_ref = queue.size.clone();
    let queue_size = QueueSize { size: queue.size.clone() };

    let core_count = std::thread::available_parallelism()
        .map(|p| p.get())
        .unwrap_or(1);

    // TODO: tuned for dev env
    // needs tuning for a good middle ground of performance:UX
    // let worker_count = core_count * 4;
    let worker_count = 24;

    info!("Detected {core_count} CPU cores, spawning {worker_count} thumbnail workers");

    let mut worker_senders: Vec<mpsc::UnboundedSender<QueueItem>> =
    Vec::with_capacity(worker_count);
    for i in 0..worker_count {
        let main_event_sender = queue.event_sender.clone();
        let (worker_sender, worker_receiver) = mpsc::unbounded_channel();
        worker_senders.push(worker_sender);

        let size_ref_clone = size_ref.clone();
        tokio::spawn(async move {
            debug!("Starting worker {i}");
            QueueWorker::start(worker_receiver, main_event_sender, size_ref_clone).await;
        });
    }

    tokio::spawn(async move {
        info!("Starting queue dispatcher.");

        let mut processing: HashMap<String,QueueItem> = HashMap::new();
        let mut blacklist: HashSet<String> = HashSet::new();

        let mut next_worker_idx = 0;
        while let Some(msg) = main_event_receiver.recv().await {

            match msg {
                QueueMsg::ImageAdded { file_hash: _ } => {
                    if let Some(img) = main_receiver.recv().await {
                        if blacklist.contains(&item_hash(&img)) {
                            // TODO: message frontend
                            continue;
                        }

                        if processing.contains_key(&item_hash(&img)) {
                            debug!("Ignoring enqueue, already in queue: {}", &img.full_path.to_string_lossy());

                            debug!("Decrementing queue from: {:?}", &size_ref);
                            queue_size.dec();
                            debug!("New queue size: {:?}", &size_ref);
                            continue;
                        }

                        let worker_sender = &worker_senders[next_worker_idx];
                        worker_sender.send(img)
                            .unwrap_or_else(|e| error!("Failed to dispatch item to worker: {e}"));
                        next_worker_idx = (next_worker_idx + 1) % worker_senders.len();
                    }
                }

                QueueMsg::WorkerComplete { file_hash } => {
                    // TODO: message frontend
                    processing.remove(&file_hash);
                    queue_size.dec();
                }

                QueueMsg::ImageFailed { file_hash } => {
                    if !blacklist.contains(&file_hash) {
                        blacklist.insert(file_hash);
                    }
                }
            }
        }

        info!("Queue dispatcher shutting down. Main receiver closed.");
    });

    queue
}

fn item_hash(item: &QueueItem) -> String {
    format!("{}{}", &item.file_hash, &item.path_hash)
}

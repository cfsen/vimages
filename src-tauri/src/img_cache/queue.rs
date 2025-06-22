use std::{path::{ Path, PathBuf }, sync::Arc};
use tokio::{fs, sync::{mpsc, Mutex}};

use crate::img_cache::{ cache, img };

#[derive(Debug, Clone)]
pub struct QueueItem {
    pub full_path: PathBuf,
    pub path_hash: String,
    pub file_hash: String,
}

#[derive(Debug)]
pub struct Queue {
    sender: mpsc::UnboundedSender<QueueItem>,
    size: Arc<Mutex<usize>>,
}

impl Queue {
    pub fn new() -> (Self, mpsc::UnboundedReceiver<QueueItem>) {
        let (sender, receiver) = mpsc::unbounded_channel();
        let size = Arc::new(Mutex::new(0));

        let queue = Queue {
            sender,
            size,
        };

        (queue, receiver)
    }

    pub async fn enqueue(&self, item: QueueItem) -> Result<(), String> {
        match self.sender.send(item) {
            Ok(_) => {
                let mut size = self.size.lock().await;
                *size += 1;
                Ok(())
            }
            Err(_) => Err("Failed to enqueue item".to_string()),
        }
    }

    pub async fn size(&self) -> usize {
        *self.size.lock().await
    }
}

// Worker that processes the queue
pub struct QueueWorker;

impl QueueWorker {
    pub async fn start(mut receiver: mpsc::UnboundedReceiver<QueueItem>, size: Arc<Mutex<usize>>) {
        let cache_path = cache::get_cache_path().expect("Failed to get cache path");

        while let Some(item) = receiver.recv().await {
            let mut thumb_path = cache_path.clone();
            thumb_path.push(item.path_hash);

            if !Path::exists(&thumb_path) {
                let _ = fs::create_dir(&thumb_path).await;
            }

            thumb_path.push(item.file_hash);
            thumb_path.set_extension("webp");

            println!(">>> create_thumbnail path: {:?}", thumb_path);

            let _ = img::create_thumbnail(item.full_path.as_path(), &thumb_path);

            // Decrement size counter
            let mut size_guard = size.lock().await;
            if *size_guard > 0 {
                *size_guard -= 1;
            }
        }
    }
}

// Constructor
pub async fn setup_queue() -> Queue {
    let (queue, receiver) = Queue::new();
    let size_ref = queue.size.clone();

    // Spawn worker thread
    tokio::spawn(async move {
        QueueWorker::start(receiver, size_ref).await;
    });

    queue
}

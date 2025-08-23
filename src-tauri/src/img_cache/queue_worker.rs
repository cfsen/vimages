use log::{debug, error, info};
use std::{
    io::ErrorKind,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    }
};
use tokio::{
    fs,
    sync::mpsc,
    task::{self, JoinError},
};

use crate::img_cache::{cache, img, queue::{QueueItem, QueueMsg}};
use crate::ipc::send;
use crate::get_db;

pub struct QueueWorker;

impl QueueWorker {
    pub async fn start(
        mut receiver: mpsc::UnboundedReceiver<QueueItem>,
        event_sender: mpsc::UnboundedSender<QueueMsg>,
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

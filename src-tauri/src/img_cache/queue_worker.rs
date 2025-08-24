use log::{debug, error, info};
use std::io::ErrorKind;
use tokio::{
    fs,
    sync::mpsc,
    task::{self, JoinError},
};

use crate::img_cache::{cache, img, queue::{QueueItem, QueueMsg}};

#[derive(Debug)]
pub struct ThumbnailResult {
    pub status: ThumbnailResultStatus,
    pub ui_message: Option<String>,
}

#[derive(Debug)]
pub enum ThumbnailResultStatus {
    Started,
    Success,
    FailedImgUnspecified,
    FailedImgUnsupportedFormat,
    FailedJoinErrorPanic,
    FailedJoinErrorCancelled,
}

pub struct QueueWorker;

impl QueueWorker {
    pub async fn start(
        mut receiver: mpsc::UnboundedReceiver<QueueItem>,
        event_sender: mpsc::UnboundedSender<QueueMsg>,
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
                    let error = format!("Failed to create item-specific directory {thumb_path:?}: {e}");

                    error!("Failed to create item-specific directory {thumb_path:?}: {e}");

                    let _ = event_sender.send(QueueMsg::ImageFailed { 
                        file_hash: item.file_hash,
                        path: item.full_path.to_string_lossy().to_string(),
                        error,
                        queue_id: item.queue_id,
                    });
                    continue;
                }
            }

            thumb_path.push(&item.file_hash);
            thumb_path.set_extension("webp");

            let org_path = item.full_path.clone();
            let result = task::spawn_blocking(move || {
                img::create_thumbnail(org_path.as_path(), &thumb_path)
            })
            .await;

            let handled = handle_create_thumbnail_result(&item, &result);

            match handled.status {
                ThumbnailResultStatus::Success => {
                    let _ = event_sender.send(QueueMsg::ImageCompleted { 
                        path_hash: item.path_hash, 
                        filename_hash: item.file_hash,
                        path: item.full_path.to_string_lossy().to_string(),
                        queue_id: item.queue_id, 
                    });
                }
                ThumbnailResultStatus::FailedJoinErrorPanic => {
                    let _ = event_sender.send(QueueMsg::WorkerErrorJoin {
                        path: item.full_path.to_string_lossy().to_string(),
                        queue_id: item.queue_id,
                    });
                }
                ThumbnailResultStatus::FailedJoinErrorCancelled => {
                    let _ = event_sender.send(QueueMsg::WorkerErrorCancelled {
                        path: item.full_path.to_string_lossy().to_string(),
                        queue_id: item.queue_id,
                    });
                }
                _ => {
                    let error = handled.ui_message.unwrap_or_else(|| format!("error = null"));
                    let _ = event_sender.send(QueueMsg::ImageFailed { 
                        file_hash: item.file_hash,
                        path: item.full_path.to_string_lossy().to_string(),
                        error,
                        queue_id: item.queue_id,
                    });
                }
            }
        }
        info!("Worker shutting down");
    }
}

pub fn handle_create_thumbnail_result(
    item: &QueueItem,
    res: &Result<Result<(), image::ImageError>, JoinError>
) -> ThumbnailResult {
    let mut status = ThumbnailResultStatus::Started;
    let mut ui_message = None;

    match res {
        Ok(Ok(())) => {
            debug!("Thumbnail generated successfully for {}", item.full_path.to_string_lossy());

            status = ThumbnailResultStatus::Success;
        }
        Ok(Err(e)) => {
            let failed_img_path = item.full_path.to_string_lossy();
            match e {
                image::ImageError::Unsupported(unsupported_error) => {
                    error!("image failed to generate thumbnail for file: {failed_img_path}");
                    error!("image error: {unsupported_error}");

                    status = ThumbnailResultStatus::FailedImgUnsupportedFormat;
                    ui_message = Some(format!("Failed to create thumbnail for: {failed_img_path}. Error: {unsupported_error}"));
                }
                _ => {
                    status = ThumbnailResultStatus::FailedImgUnspecified;
                    ui_message = Some(format!("Error generating thumbnail for {failed_img_path}: {e}"));
                }
            }
            error!("{:?}", ui_message);
        }
        Err(join_error) => {
            error!("Spawn blocking task for {} failed: {:?}", item.full_path.to_string_lossy(), join_error);

            if join_error.is_panic() {
                error!("try_into_panic(): true");

                ui_message = Some(format!("Critical error: thumbnail worker thread panicked."));
                status = ThumbnailResultStatus::FailedJoinErrorPanic;
            }
            if join_error.is_cancelled() {
                error!("is_cancelled(): true");

                ui_message = Some(format!("Critical error: thumbnail worker thread was cancelled."));
                status = ThumbnailResultStatus::FailedJoinErrorCancelled;
            }
        }
    }

    ThumbnailResult { status, ui_message }
}

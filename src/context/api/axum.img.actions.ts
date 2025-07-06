import { useAppState } from "@app/app.context.store";
import { EntityImage } from "@context/context.types";

export function getImgFromCache(img: EntityImage, path_hash: string | null) {
	let axum_port = useAppState.getState().axum_port;

	if(axum_port === null) {
		// TODO: error handling, show to user
		console.error("internal error, axum port unavailable");
	}

	if(!img.has_thumbnail || path_hash === null) {
		return `http://127.0.0.1:${axum_port}/image?file=${img.filename}`;
	}
	return `http://127.0.0.1:${axum_port}/cache/${path_hash}/${img.img_hash}`;
}

import { useAppState } from "@app/app.context.store";
import { EntityImage } from "@context/context.types";
import { raiseError } from "@app/app.context.actions";
import { raiseCriticalAppError } from "@app/app.context";

export function getImgFromCache(img: EntityImage, path_hash: string | null) {
	let axum_port = useAppState.getState().axum_port;

	if(axum_port === null) {
		raiseError(useAppState, "Critical error: Axum port unavailable.");
		raiseCriticalAppError("getImgFromCache", "Axum port was null.");
	}

	if(!img.has_thumbnail || path_hash === null) {
		return `http://127.0.0.1:${axum_port}/image?file=${encodeURIComponent(img.filename)}`;
	}
	return `http://127.0.0.1:${axum_port}/cache/${path_hash}/${img.img_hash}`;
}

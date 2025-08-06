import { useAppState } from "@app/app.context.store";
import { EntityImage } from "@context/context.types";
import { raiseError } from "../app/app.context.actions";

export function getImgFromCache(img: EntityImage, path_hash: string | null) {
	let axum_port = useAppState.getState().axum_port;

	if(axum_port === null) {
		console.error("axum port unavailable");
		// TODO: 
		// critical errors should lock the UI
		// this should be handled on launch in app.context
		raiseError(useAppState, "axum port unavailable");
	}

	if(!img.has_thumbnail || path_hash === null) {
		return `http://127.0.0.1:${axum_port}/image?file=${encodeURIComponent(img.filename)}`;
	}
	return `http://127.0.0.1:${axum_port}/cache/${path_hash}/${img.img_hash}`;
}

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export type RustApiCall = {
	action: RustApiAction,
	path: string
}

export enum RustApiAction {
	GetCurrentPath = "fs_get_current_path",
	GetParentPath = "fs_get_parent_path",
	GetDirectories = "fs_list_directory",
	GetImages = "fs_get_images",
	GetImage = "fs_get_image_async"
}

export function useRustApi({ action, path }: RustApiCall) {
	const [response, setResponse] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// TODO: this is getting spammed
	console.log("rustapicall:action: " + action);
	console.log("rustapicall:path: " + path);
	//console.trace();

	if(action === RustApiAction.GetParentPath){
		console.log("getting parent path for: " + path);
	}

	useEffect(() => {
		async function callRustApi() {
			try {
				setLoading(true);
				const res = await invoke(action, { path });
				setResponse(res as string[]);
				setError(null);
			} 
			catch (err) {
				setError((err as Error).message);
			} 
			finally {
				setLoading(false);
			}
		}

		callRustApi();
	}, [action, path]);

	return { response, loading, error };
}

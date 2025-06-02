import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useDirectoryContent(path: string) {
	const [fsPwdEntities, setFsPwdEntities] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchDirectoryContent() {
			try {
				setLoading(true);
				const res = await invoke("fs_list_directory", { path });
				setFsPwdEntities(res as string[]);
				setError(null);
			} 
			catch (err) {
				setError((err as Error).message);
			} 
			finally {
				setLoading(false);
			}
		}

		fetchDirectoryContent();
	}, [path]);

	return { fsPwdEntities, loading, error };
}

type RustApiCall = {
	action: RustApiAction,
	path: string
}

export enum RustApiAction {
	GetCurrentPath = "fs_get_current_path",
	GetParentPath = "fs_get_parent_path",
	GetDirectories = "fs_list_directory",
	GetImages = "fs_get_images",
	GetImage = "fs_get_image"
}

export function useRustApi({ action, path }: RustApiCall) {
	const [response, setResponse] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

export async function fetchRustApi(action: string, path: string): Promise<string[]> {
	try {
		const result = await invoke(action, { path });
		return Array.isArray(result) ? result : [String(result)];
	} catch (err) {
		throw new Error((err as Error).message);
	}
}

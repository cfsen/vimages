import { platform } from "@tauri-apps/plugin-os";

export function windowsUncStrip (path: string): string  {
	if(platform() === "windows"){
		return path.slice(4, path.length);
	}
	return path;
};

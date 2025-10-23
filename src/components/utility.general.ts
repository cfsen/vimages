import { platform } from "@tauri-apps/plugin-os";

export function windowsUncStrip (path: string): string  {
	if(platform() === "windows"){
		return path.slice(4, path.length);
	}
	return path;
};

export function timestamp(): string {
	return new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
}

export function BooleanToString(bool: boolean): string {
	return bool ? "True" : "False";
}

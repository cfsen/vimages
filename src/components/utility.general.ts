import { platform } from "@tauri-apps/plugin-os";
import { Command } from "@key/key.command";
import { Keybinds } from "@key/key.types";

//
// Output formatters
//

// strips "\\.\" prefix from paths on windows hosts
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

export function GetLeaderCommands(binds: Keybinds) {
	return Array.from(binds.keyMap)
		.filter(([command]) => command.startsWith(binds.commandMap.get(Command.Leader)!))
		.filter(([command]) => command !== binds.commandMap.get(Command.Leader));
}

export function GetLeaderKeyLabel(command: string, binds: Keybinds): string{
	return command
		.slice(binds.commandMap.get(Command.Leader)!.length)
		.replace(binds.commandMap.get(Command.Leader)!, "leader")
}

export function TrimPathStrLength(str: string){
	if(str.length > 45)
		return str.substring(0, 31) + " (…)";
	return str;
}

export async function SendToClipboard(buf: string) {
	try {
		await navigator.clipboard.writeText(buf);
	}
	catch(err) {
		console.error("Clipboard write failed:" + err);
	}
}

export function FilePathsExport(
	buf: Set<string> | null,
	prefix: string
): string | null {
	if(buf === null) return null;

	// TODO: windows path support
	let str_buf = [...buf].map(x => `${prefix}/${x}\n`).join('');
	return str_buf;
}
export function FilePathsExportAsPythonList(
	buf: Set<string> | null,
	prefix: string
): string | null {
	if(buf === null) return null;

	let str_buf = "images = [\n";
	// TODO: windows path support
	str_buf += [...buf].map(x => `\t\"${prefix}/${x}\",\n`).join('');
	str_buf += "]";
	return str_buf;
}

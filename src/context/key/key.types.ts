import { Command, CommandSequence } from "./key.command";
import { resultModeCommand } from "./key.module.handler.cmd";
import { resultModeNormal } from "./key.module.handler.normal";

// Modal state key
export enum Modal {
	Normal,
	Visual,
	Insert,
	Command,
	Leader,
}

// Callbacks for handling captured and parsed key events.
export interface modeNormal {
	callback: (resultNormal: resultModeNormal) => void;
}
export interface modeVisual {
	callback: (resultVisual: resultModeNormal) => void;
}
export interface modeInsert {
	callback: (resultCommand: resultModeCommand) => void;
}
export interface modeCommand {
	callback: (resultCommand: resultModeCommand) => void;
}
export interface modeState {
	callback: (mode: Modal) => void;
	Mode: Modal;
}

export type Keybinds = {
	commandMap: Map<Command, string>,
	keyMap: Map<string, Command>,
};

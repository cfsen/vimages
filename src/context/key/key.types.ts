import { CommandSequence } from "./key.command";
import { resultModeCommand } from "./key.module.handler.cmd";
import { resultModeNormal } from "./key.module.handler.normal";

export enum Modal {
	Normal,
	Visual,
	Insert,
	Command,
	Leader,
}
export interface modeNormal {
	callback: (resultNormal: resultModeNormal) => void;
}
export interface modeVisual {
	callback: (selection: string[], sequence: CommandSequence) => void;
}
export interface modeInsert {
	callback: (input: string, sequence: CommandSequence) => void;
}
export interface modeCommand {
	callback: (resultCommand: resultModeCommand) => void;
}
export interface modeState {
	callback: (mode: Modal) => void;
	Mode: Modal;
}


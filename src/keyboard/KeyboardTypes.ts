import { CommandSequence } from "./Command";
export enum Modal {
	Normal,
	Visual,
	Insert,
	Command,
}
export interface modeNormal {
	callback: (sequence: CommandSequence) => void;
}
export interface modeVisual {
	callback: (selection: string[], sequence: CommandSequence) => void;
}
export interface modeInsert {
	callback: (input: string, sequence: CommandSequence) => void;
}
export interface modeCommand {
	callback: (input: string, sequence: CommandSequence) => void;
}
export interface modeState {
	callback: (mode: Modal) => void;
	Mode: Modal;
}

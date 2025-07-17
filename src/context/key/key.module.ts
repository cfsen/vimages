import { staticCommands, possibleCommands, assembleCommand, ctrlCommands, possibleLeaderCommands } from './key.input.parsers';
import { Command, CommandSequence, populateCommandMap } from './key.command';
import { Modal, modeNormal, modeState, modeInsert, modeVisual, modeCommand } from "./key.types";

const commandMap = populateCommandMap();
const statics = [Command.Escape, Command.Return, Command.Console, Command.Leader, Command.Tab];
let normalSequence = "";
let visualSequence = "";
let insertSequence = "";
let commandSequence = ":";

export function modalKeyboard(
	event: KeyboardEvent,
	normalHandler: modeNormal,
	visualHandler: modeVisual,
	insertHandler: modeInsert,
	cmdHandler: modeCommand,
	{callback: setModeState, Mode: mode}: modeState
){
	let checkStaticCmds = staticCommands(event);
	if(checkStaticCmds === Command.Ignore) return;
	if(checkStaticCmds === Command.Escape && mode !== Modal.Normal) {
		console.log("Returning to normal mode");
		setModeState(Modal.Normal);	

		// clear buffers
		normalSequence = "";
		visualSequence = "";
		insertSequence = "";
		commandSequence = ":";
		return;
	}

	// NOTE: side effects in '...Sequence' globals
	switch(mode){
		case Modal.Visual:
			handleModeVisual(visualHandler, event, visualSequence);
			break;
		case Modal.Insert:
			handleModeInsert(insertHandler, event, insertSequence);
			break;
		case Modal.Command:
			handleModeCommand(cmdHandler, event, commandSequence);
			break;
		default:
			normalSequence = handleModeNormal(normalHandler, event, normalSequence, mode, setModeState);
			break;
	};
}

function handleModeNormal(
	handler: modeNormal,
	event: KeyboardEvent,
	sequence: string,
	mode: Modal,
	setModeState: (mode: Modal) => void,
): string {
	// Check for control commands (Escape, Return) or ignored keys (Ignore)
	let checkStaticCmds = staticCommands(event);
	if(statics.includes(checkStaticCmds)) {
		handler.callback?.({ cmd: checkStaticCmds });
		return "";
	}

	// Handle ctrl+key events
	if(event.ctrlKey){
		handler.callback?.({ cmd: ctrlCommands(event) });
		return "";
	}

	// Assemble new input into sequence
	let newSeq = sequence + event.key;

	// Check if there are any more possible commands
	let possibleCmds;
	if(mode === Modal.Leader) possibleCmds = possibleLeaderCommands(newSeq, commandMap);
	else possibleCmds = possibleCommands(newSeq, commandMap);

	// Buffer matches multiple commands, return early
	if(possibleCmds > 1) return newSeq;
	else if(possibleCmds === 0){
		// No commands are possible, reset sequence, send error
		const tmp: CommandSequence = { cmd: Command.Error };
		handler.callback?.(tmp);

		// escape leader mode if command is invalid
		if(mode === Modal.Leader) {
			setModeState(Modal.Normal);
			console.error("No valid leader command for combination");
		}
		return "";
	}

	// Must be one matching command
	const tmp = assembleCommand(newSeq, commandMap);

	// return without clearing and change mode if command was leader
	if(tmp.cmd === Command.Leader){
		setModeState(Modal.Leader);
		return newSeq;
	}
	
	// Avoid sending partial commands ('g', 'z' -> finalized next run with 'gg', 'zz')
	if(tmp.cmd === Command.PartialInput) return newSeq;

	// Success: complete command return
	handler.callback?.(tmp);

	// Post-success cleanup
	// Exit leader if leader command was sent
	if(mode === Modal.Leader) setModeState(Modal.Normal);
	return "";
}
function handleModeVisual(
	handler: modeVisual,
	event: KeyboardEvent,
	sequence: string,
) {
	console.log("handleModeVisual", handler, event, sequence);
}

function handleModeInsert(
	handler: modeInsert,
	event: KeyboardEvent,
	sequence: string,
) {
	console.log("handleModeInsert", handler, event, sequence);
}

function handleModeCommand(
	handler: modeCommand,
	event: KeyboardEvent,
	sequence: string,
) {
	let seq = sequence;

	// filter F1->F..., Shift, Alt, ArrowLeft, etc.
	let allowed = ['Enter', 'Backspace'];
	if(event.key.length > 1 && !allowed.includes(event.key)){
		handler.callback?.(seq, { cmd: Command.Ignore });
		return;
	}

	// return buffer and indicate command is ready for parsing and execution
	if(event.key === 'Enter') {
		handler.callback?.(seq, { cmd: Command.Return });
		commandSequence = ":";
		return;
	}
	
	// remove last character from the buffer
	if(event.key === 'Backspace') {
		seq = sequence.substring(0, sequence.length-1);
		commandSequence = seq;
	}
	else {
		seq += event.key;
		commandSequence = seq;
	}

	// callback
	handler.callback?.(seq, { cmd: Command.None });
	//console.log("Command mode handler: " + seq);
}


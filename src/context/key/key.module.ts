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
			handleModeNormal(normalHandler, event, normalSequence, mode, setModeState);
			break;
	};
}

function handleModeNormal(
	handler: modeNormal,
	event: KeyboardEvent,
	sequence: string,
	mode: Modal,
	setModeState: (mode: Modal) => void,
) {
	let checkStaticCmds = staticCommands(event);
	if(statics.includes(checkStaticCmds)) {
		// Revert the input sequence 
		if(sequence != ""){ 
			normalSequence = "";
			return;
		}

		const tmp: CommandSequence = {
			modInt: 0,
			cmd: checkStaticCmds,
		};
		handler.callback?.(tmp);
		normalSequence = "";

		return;
	}

	// Handle ctrl+key events
	if(event.ctrlKey){
		let cmd = ctrlCommands(event);
		const tmp: CommandSequence = {
			modInt: 0,
			cmd: cmd,
		};
		handler.callback?.(tmp);
		normalSequence = "";
		return;
	}

	// Assemble new input into sequence
	const newSeq = sequence + event.key;
	normalSequence = newSeq;

	// Check if there are any more possible commands
	let possibleCmds;
	if(mode === Modal.Leader) {
		possibleCmds = possibleLeaderCommands(newSeq, commandMap);
	}
	else {
		possibleCmds = possibleCommands(newSeq, commandMap);
	}

	if(possibleCmds > 1){
		return;
	}
	else if(possibleCmds === 0){
		// No commands are possible, reset sequence, send error
		const tmp: CommandSequence = {
			modInt: 0,
			cmd: Command.Error,
		};
		handler.callback?.(tmp);
		normalSequence = "";

		// escape leader mode if command is invalid
		if(mode === Modal.Leader) {
			setModeState(Modal.Normal);
			console.error("No valid leader command for combination");
		}
		return;
	}

	// possibleCmds must be 1
	const tmp = assembleCommand(newSeq, commandMap);

	// return without clearing and change mode if command was leader
	if(tmp.cmd === Command.Leader){
		setModeState(Modal.Leader);
		return;
	}
	
	// Avoid sending partial commands ('g', 'z' -> finalized next run with 'gg', 'zz')
	if(tmp.cmd === Command.PartialInput) {
		console.log("no callback");
		return;
	}

	handler.callback?.(tmp);
	normalSequence = "";

	// Exit leader if leader command was sent
	if(mode === Modal.Leader) {
		setModeState(Modal.Normal);
	}
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
		handler.callback?.(seq, { modInt: 0, cmd: Command.Ignore });
		return;
	}

	// return buffer and indicate command is ready for parsing and execution
	if(event.key === 'Enter') {
		handler.callback?.(seq, { modInt: 0, cmd: Command.Return });
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
	handler.callback?.(seq, { modInt: 0, cmd: Command.None });
	//console.log("Command mode handler: " + seq);
}


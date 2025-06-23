import { useEffect, useState } from 'react';
import { staticCommands, possibleCommands, assembleCommand, ctrlCommands } from './InputParsers';
import { Command, CommandSequence, populateCommandMap } from './Command';
import { Modal, modeNormal, modeState, modeInsert, modeVisual, modeCommand } from "./KeyboardTypes";

const commandMap = populateCommandMap();
const statics = [Command.Escape, Command.Return, Command.Console, Command.Leader, Command.Tab];

export function modalKeyboard(
	normalHandler: modeNormal,
	visualHandler: modeVisual,
	insertHandler: modeInsert,
	cmdHandler: modeCommand,
	{callback: setModeState, Mode: mode}: modeState
){
	// NOTE: WIP
	// buffers for modes
	const [normalSequence, setNormalSequence] = useState<string>("");
	const [visualSequence, setVisualSequence] = useState<string>("");
	const [insertSequence, setInsertSequence] = useState<string>("");
	const [commandSequence, setCommandSequence] = useState<string>("");

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			event.preventDefault();

			let checkStaticCmds = staticCommands(event);
			if(checkStaticCmds === Command.Ignore) return;
			if(checkStaticCmds === Command.Escape && mode !== Modal.Normal) {
				console.log("Returning to normal mode");
				setModeState(Modal.Normal);	

				// clear sequences
				setNormalSequence("");
				setVisualSequence("");
				setInsertSequence("");
				setCommandSequence("");
				return;
			}

			switch(mode){
				case Modal.Visual:
					handleModeVisual(visualHandler, event, visualSequence, setVisualSequence);
					break;
				case Modal.Insert:
					handleModeInsert(insertHandler, event, insertSequence, setInsertSequence);
					break;
				case Modal.Command:
					handleModeCommand(cmdHandler, event, commandSequence, setCommandSequence);
					break;
				default:
					handleModeNormal(normalHandler, event, normalSequence, setNormalSequence);
					break;
			};
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [normalHandler, visualHandler, insertHandler, cmdHandler, mode, 
			normalSequence, visualSequence, insertSequence, commandSequence]);
}

function handleModeNormal(
	handler: modeNormal,
	event: KeyboardEvent,
	sequence: string,
	setSequence: (seq: string) => void
) {
	let checkStaticCmds = staticCommands(event);
	if(statics.includes(checkStaticCmds)) {
		// Revert the input sequence 
		if(sequence != ""){ 
			setSequence("");
			return;
		}

		const tmp: CommandSequence = {
			modInt: 0,
			cmd: checkStaticCmds,
		};
		handler.callback?.(tmp);
		setSequence("");

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
		setSequence("");
		return;
	}

	// Assemble new input into sequence
	const newSeq = sequence + event.key;
	setSequence(newSeq);

	// Check if there are any more possible commands
	let possibleCmds = possibleCommands(newSeq, commandMap);
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
		setSequence("");
		return;
	}

	// possibleCmds must be 1
	const tmp = assembleCommand(newSeq, commandMap);

	// Avoid sending partial commands ('g', 'z' -> finalized next run with 'gg', 'zz')
	if(tmp.cmd === Command.PartialInput) {
		return;
	}

	handler.callback?.(tmp);
	setSequence("");
}
function handleModeVisual(
	handler: modeVisual,
	event: KeyboardEvent,
	sequence: string,
	setSequence: (seq: string) => void
) {
	//handler.callback?.
	console.log("Visual mode handler!");
}

function handleModeInsert(
	handler: modeInsert,
	event: KeyboardEvent,
	sequence: string,
	setSequence: (seq: string) => void
) {
	console.log("Insert mode handler!");
}

function handleModeCommand(
	handler: modeCommand,
	event: KeyboardEvent,
	sequence: string,
	setSequence: (seq: string) => void
) {
	let _ = sequence;
	if(event.key === 'Backspace') {
		_ = sequence.substring(0, sequence.length-1);
		setSequence(_);
	}
	else {
		_ += event.key;
		setSequence(_);
	}
	handler.callback?.(_, { modInt: 0, cmd: Command.None });
	console.log("Command mode handler: " + _);
}

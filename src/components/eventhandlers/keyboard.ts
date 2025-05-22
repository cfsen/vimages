import { useEffect, useState } from 'react';

const numeric = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const commandMap = new Map<string,Command>();
populateCommandMap();

export type KeySequence = string;
interface UseModalKeyOptions {
	onSequenceComplete?: (sequence: CommandSequence) => void;
	isActive?: boolean; // Toggle input listening
	mode?: Modal;
}

export type CommandSequence = {
	modInt: number,
	cmd: Command,
}

enum Modal {
	Normal,
	Visual,
	Insert
}

export function useModalKey({ onSequenceComplete, isActive = true, mode = 0 }: UseModalKeyOptions = {}) {
	const [sequence, setSequence] = useState<string>("");
	const [ctrlActive, setCtrlActive] = useState<boolean>();

	useEffect(() => {
		if (!isActive) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			event.preventDefault();
			const key = event.key;

			console.log("---");
			console.log("input");
			console.log("sequence=" + sequence);

			// Check static commands - Esc, leader, etc.
			let checkStaticCmds = staticCommands(key);
			if(checkStaticCmds === Command.Escape || checkStaticCmds === Command.Leader || checkStaticCmds === Command.Console) {
				if(sequence != ""){ // cancel sequence
					setSequence("");
					return;
				}
				// todo if no ongoing sequence, send event to gui handler
				return;
			}
			else if(checkStaticCmds === Command.Ignore) return;

			console.log("static check complete");

			// Assemble new input into sequence
			const newSeq = sequence + key;
			setSequence(newSeq);

			// Check if there are any more possible commands
			let possibleCmds = possibleCommands(newSeq);
			if(possibleCmds > 1){
				return;
			}
			else if(possibleCmds === 0){
				// todo UX feedback that input has been rejected
				setSequence("");
				return;
			}

			console.log("possible check complete");

			// possibleCmds must be 1
			const cmd = assembleCommand(newSeq);
			onSequenceComplete?.(cmd);
			return "";
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [onSequenceComplete, isActive, mode]);

	return sequence; 
}
enum Command {
	None,
	Cancel,
	Escape,
	Console,
	Error,

	Ignore,
	Input,
	Numeric,
	Leader,

	CursorLeft,
	CursorUp,
	CursorDown,
	CursorRight
}

function staticCommands(input: string): Command {
	switch(input) {
		case 'Escape':	return Command.Escape;
		case 'Alt':		return Command.Ignore;
		case ':':		return Command.Console;
		case ' ':		return Command.Leader;
		default:		return Command.None;
	}
}

function populateCommandMap(){
	commandMap.set('h', Command.CursorLeft);
	commandMap.set('j', Command.CursorDown);
	commandMap.set('k', Command.CursorUp);
	commandMap.set('l', Command.CursorRight);
}

function possibleCommands(input: string): number {
	// Check for numerics
	let lastNumberIdx = getNumberEndsIdx(input);

	// If input is purely numeric, multiple valid commands are possible, skip further checks
	if(input.length === lastNumberIdx+1) return 2;

	console.log("possibleCommands not purely numeric");

	let cmd = commandMap.get(input.substring(lastNumberIdx+1, input.length));
	if(cmd === undefined) return 0;

	console.log("possibleCommands success");

	return 1;
}

function getNumberEndsIdx(input: string): number {
	let lastNumberIdx = 0;
	for(let i = 0; i < input.length; i++){
		if(numeric.includes(input[i])) lastNumberIdx = i;	
		else break;
	}

	console.log("last number at " + lastNumberIdx);

	return lastNumberIdx;
}

function assembleCommand(input: string): CommandSequence {

	// todo
	let lastNumberIdx = getNumberEndsIdx(input);
	console.log(input);

	let modInt = 0;
	if(lastNumberIdx != 0){
		modInt = parseInt(input.substring(0, lastNumberIdx+1)) || 0;
	}

	const tmp: CommandSequence = {
		modInt: modInt,
		cmd: commandMap.get(input.substring(lastNumberIdx+1, input.length)) ?? Command.Error,
	};
	return tmp;
}

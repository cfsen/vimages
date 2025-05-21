import { useEffect, useState } from 'react';

export type KeySequence = string;

interface UseModalKeyOptions {
	onSequenceComplete?: (sequence: CommandSequence) => void;
	isActive?: boolean; // Toggle input listening
	mode?: Modal;
}

export type CommandSequence = {
	modInt: number,
	cmd: Commands,
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

			console.log("input");

			// Check static commands - Esc, leader, etc.
			let checkStaticCmds = staticCommands(key);
			if(checkStaticCmds === Commands.Escape || checkStaticCmds === Commands.Leader || checkStaticCmds === Commands.Console) {
				if(sequence != ""){ // cancel sequence
					setSequence("");
					return;
				}
				// todo if no ongoing sequence, send event to gui handler
				return;
			}
			else if(checkStaticCmds === Commands.Ignore) return;

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
enum Commands {
	None,
	Cancel,
	Escape,
	Console,

	Ignore,
	Input,
	Numeric,
	Leader,

	CursorLeft,
	CursorUp,
	CursorDown,
	CursorRight
}

function staticCommands(input: string): Commands {
	switch(input) {
		case 'Escape':	return Commands.Escape;
		case 'Alt':		return Commands.Ignore;
		case ':':		return Commands.Console;
		case ' ':		return Commands.Leader;
		default:		return Commands.None;
	}
}

function possibleCommands(input: string): number {
	// Check for numerics
	let numeric = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	let lastNumberIdx = 0;
	for(let i = 0; i < input.length; i++){
		if(numeric.includes(input[i])) lastNumberIdx = i;	
		else break;
	}

	// If input is numeric, multiple valid commands are possible, skip further checks
	if(input.length === lastNumberIdx) return 2;

	// todo

	return 0;
}

function assembleCommand(input: string): CommandSequence {

	// todo

	const tmp: CommandSequence = {
		modInt: 0,
		cmd: Commands.None,
	};
	return tmp;
}

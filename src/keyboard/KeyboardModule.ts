import { useEffect, useState } from 'react';

import { staticCommands, possibleCommands, assembleCommand } from './InputParsers';
import { Command, CommandSequence, populateCommandMap } from './Command';

interface UseModalKeyOptions {
	onSequenceComplete?: (sequence: CommandSequence) => void;
	isActive?: boolean; // Toggle input listening
	mode?: Modal;
}

enum Modal {
	Normal,
	Visual,
	Insert
}

const commandMap = populateCommandMap();


export function useModalKey({ onSequenceComplete, isActive = true, mode = 0 }: UseModalKeyOptions = {}) {
	const [sequence, setSequence] = useState<string>("");
	//const [ctrlActive, setCtrlActive] = useState<boolean>();

	useEffect(() => {
		if (!isActive) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			event.preventDefault();
			const key = event.key;

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

			// Assemble new input into sequence
			const newSeq = sequence + key;
			setSequence(newSeq);

			// Check if there are any more possible commands
			let possibleCmds = possibleCommands(newSeq, commandMap);
			if(possibleCmds > 1){
				return;
			}
			else if(possibleCmds === 0){
				// todo UX feedback that input has been rejected
				setSequence("");
				return;
			}

			// possibleCmds must be 1
			const cmd = assembleCommand(newSeq, commandMap);

			console.log("useModalKey: SEND: " + newSeq);

			onSequenceComplete?.(cmd);
			setSequence("");
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [onSequenceComplete, isActive, mode]);
}

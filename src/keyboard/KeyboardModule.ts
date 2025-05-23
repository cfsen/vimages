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

	useEffect(() => {
		if (!isActive) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			event.preventDefault();

			// Check static commands - Esc, leader, etc.
			let checkStaticCmds = staticCommands(event);
			if(checkStaticCmds === Command.Ignore) return;
			if(checkStaticCmds === Command.Escape || checkStaticCmds === Command.Leader || checkStaticCmds === Command.Console) {
				if(sequence != ""){ // Esc should revert the input sequence 
					setSequence("");
					return;
				}

				const tmp: CommandSequence = {
					modInt: 0,
					cmd: checkStaticCmds,
				};
				onSequenceComplete?.(tmp);
				setSequence("");

				return;
			}

			// Handle ctrl+key events
			if(event.ctrlKey){
				console.log("useModalKey:event.ctrl");
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
				onSequenceComplete?.(tmp);
				setSequence("");
				return;
			}

			// possibleCmds must be 1
			const tmp = assembleCommand(newSeq, commandMap);

			// Avoid sending partial commands ('g', 'z' -> finalized next run with 'gg', 'zz')
			if(tmp.cmd === Command.PartialInput) {
				console.log("useModalKey:PartialInput!");
				return;
			}

			console.log("useModalKey: SEND: " + newSeq);

			onSequenceComplete?.(tmp);
			setSequence("");
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [onSequenceComplete, isActive, mode]);
}

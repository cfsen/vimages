import { Command, } from './key.command';

export type resultModeCommand = {
	sequence: string,
	cursor: number,
	cmd: Command,
};

export function defaultResultModeCommand(): resultModeCommand {
	return {
		sequence: ":",
		cursor: 0,
		cmd: Command.None,
	}
}

export function handleModeCommand(
	event: KeyboardEvent,
	sequenceState: resultModeCommand,
): resultModeCommand {
	let sequence = sequenceState.sequence;
	let cursor = sequenceState.cursor;

	// filter F1->F..., Shift, Alt, etc.
	let cursor_keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
	let allowed = ['Enter', 'Backspace', ...cursor_keys];
	if(event.key.length > 1 && !allowed.includes(event.key)) {
		return { ...defaultResultModeCommand(), sequence, cursor, cmd: Command.Ignore };
	}

	if(cursor_keys.includes(event.key)) {
		switch(event.key){
			case 'ArrowLeft':
				if(cursor > 0) cursor -= 1;
				break;
			case 'ArrowRight':
				if(cursor <= sequence.length) cursor += 1;
				break;
			case 'Home':
				cursor = 0;
				break;
			case 'End':
				cursor = sequence.length + 1;
				break;
		};
		return { ...defaultResultModeCommand(), sequence, cursor, cmd: Command.Ignore };
	}

	// return buffer and indicate command is ready for parsing and execution
	if(event.key === 'Enter') {
		return { ...defaultResultModeCommand(), sequence, cursor, cmd: Command.Return };
	}
	
	// remove last character from the buffer
	if(event.key === 'Backspace') {
		sequence = sequence.substring(0, sequence.length-1);
	}
	// Append input to command
	else {
		sequence += event.key;
		cursor = sequence.length + 1;
	}

	return { ...defaultResultModeCommand(), sequence, cursor, cmd: Command.None };
}

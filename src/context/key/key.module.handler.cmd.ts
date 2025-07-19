import { Command, } from './key.command';
import { isSpecialKey, SpecialKey } from './key.input.enum';

export type resultModeCommand = {
	sequence: string,
	cursor: number,
	cmd: Command,
};

export function defaultResultModeCommand(): resultModeCommand {
	return {
		sequence: ":",
		cursor: 1,
		cmd: Command.None,
	}
}

export function handleModeCommand(event: KeyboardEvent, sequenceState: resultModeCommand): resultModeCommand {
	if(event.ctrlKey && isSpecialKey(event.key))
		return handleModeCommandSpecialCtrl(event.key as SpecialKey, sequenceState);
	if(isSpecialKey(event.key))
		return handleModeCommandSpecial(event.key as SpecialKey, sequenceState);

	// normal input
	let sequence = sequenceState.sequence;
	let cursor = sequenceState.cursor;

	// mid sequence insert 
	if(cursor !== sequence.length){
		let preserveBefore = sequence.slice(0, cursor);
		preserveBefore += event.key;
		cursor += 1;

		let preserveAfter = sequence.slice(cursor-1, sequence.length);
		sequence = preserveBefore + preserveAfter;

		return { ...defaultResultModeCommand(), sequence, cursor, cmd: Command.None };
	}

	// cursor is at EOS, append input
	sequence += event.key;
	cursor = sequence.length;

	return { ...defaultResultModeCommand(), sequence, cursor, cmd: Command.None };
}

//
// special key handlers
//

function handleModeCommandSpecial(key: SpecialKey, sequenceState: resultModeCommand): resultModeCommand{
	let sequence = sequenceState.sequence;
	let cursor = sequenceState.cursor;
	let cmd = Command.Ignore;

	switch(key){
		case SpecialKey.Enter:
			cmd = Command.Return;
			break;
		case SpecialKey.ArrowLeft:
			if(cursor > 0) cursor -= 1;
			break;
		case SpecialKey.ArrowRight:
			if(cursor < sequence.length) cursor += 1;
			break;
		case SpecialKey.Home:
			cursor = 0;
			break;
		case SpecialKey.End:
			cursor = sequence.length;
			break;
		case SpecialKey.Backspace:
			// mid sequence backspace
			if(cursor !== sequence.length) {
				sequence = cutOut(sequence, cursor-1, cursor);
				cursor -= 1;
				cmd = Command.None;
			}
			// remove last character from the buffer
			else {
				sequence = sequence.substring(0, sequence.length-1);
				cursor -= 1;
				cmd = Command.None;
			}
			break;
		case SpecialKey.Delete:
			// mid sequence delete
			if(cursor < sequence.length) {
				sequence = cutOut(sequence, cursor, cursor+1);
			}
			break;
		default:
			console.error("Unhandled key:" + key);
			cmd = Command.Error;
			break;
	};
	return { ...defaultResultModeCommand(), sequence, cursor, cmd };
}

function handleModeCommandSpecialCtrl(key: SpecialKey, sequenceState: resultModeCommand): resultModeCommand{
	let sequence = sequenceState.sequence;
	let cursor = sequenceState.cursor;
	let cmd = Command.Ignore;
	switch(key){
		case SpecialKey.ArrowLeft:
			cursor = whitespacePosition(sequence, cursor, wsDirection.Left);
			break;
		case SpecialKey.ArrowRight:
			cursor = whitespacePosition(sequence, cursor, wsDirection.Right);
			break;
		case SpecialKey.Backspace:
			let deleteTo = whitespacePosition(sequence, cursor, wsDirection.Left);

			// include whitespace in delettion
			if(deleteTo > 0) deleteTo -= 1;
			// clear the buffer if no whitespace
			if(deleteTo === 0) {
				sequence = "";
				cursor = 1;
			}

			sequence = cutOut(sequence, deleteTo, cursor);
			cursor = deleteTo;
			break;
		default:
			console.error("Unhandled key:" + key);
			cmd = Command.Error;
			break;
	};
	return { ...defaultResultModeCommand(), sequence, cursor, cmd };
}


//
//	helpers
//

enum wsDirection {
	Left,
	Right
}

function whitespacePosition(str: string, cur: number, dir: wsDirection): number {
	let matches = str.matchAll(/\s+/g);
	let pos = Array.from(matches, match => match.index!);

	if(pos.length === 0) return cur;

	if(dir == wsDirection.Left) pos.reverse();

	for(let i = 0; i < pos.length; i++){
		if((dir === wsDirection.Left && pos[i] < cur-1) || (dir === wsDirection.Right && pos[i] > cur))
			return pos[i]+1;
	}

	return dir === wsDirection.Left ? 0 : str.length;
}

function cutOut(str: string, from: number, to: number){
	return str.slice(0, from) + str.slice(to, str.length);
}

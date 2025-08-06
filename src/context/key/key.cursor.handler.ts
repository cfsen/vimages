import { Command, CommandSequence } from "./key.command";

export function KeyboardCursorHandle(
	seq: CommandSequence,
	items_length: number,
	cursor_position: number,
	itemsPerRow: number,
	halfPageRows: number,
): number | null {

	let cur = cursor_position;
	let len = items_length;
	let n = seq.modInt ?? 0;

	if(cur >= len || cur < 0) return null;

	switch(seq.cmd){
		case Command.CursorRight:
			// no repeat count, allow movement if inside bounds of column/array
			if(n <= 0 && !((cur + 1) % itemsPerRow === 0) && ((cur + 1) < len))
				cur++;
			// repeat count inside column bounds
			else if(n > 0 && ((cur % itemsPerRow) + n) < (itemsPerRow))
				cur += n;
			// repeat count exceeds column bounds
			else if(n > 0)
				cur = Math.min(cur - (cur % itemsPerRow) + itemsPerRow - 1, len-1);
			break;
		case Command.CursorLeft:
			// no repeat count, allow movement if inside bounds of column/array
			if(n <= 0 && !(cur % itemsPerRow === 0) && ((cur - 1) >= 0))
				cur = (cur - 1) % len;
			// repeat count inside column bounds
			else if(n > 0 && ((cur % itemsPerRow) - n) >= 0)
				cur -= n;
			// repeat count exceeds column bounds
			else if(n > 0)
				cur = cur - (cur % itemsPerRow);
			break;
		case Command.CursorUp:
			cur -= moveCursorUpByRows(cur, n === 0 ? 1 : n, itemsPerRow);
			break;
		case Command.CursorDown:
			cur += moveCursorDownByRows(cur, n === 0 ? 1 : n, itemsPerRow, len);
			break;
		case Command.CursorBOL:
			cur = cur - (cur % itemsPerRow);
			break;
		case Command.CursorEOL:
			cur = cur + itemsPerRow - 1 - (cur % itemsPerRow);
			break;
		case Command.CursorNext:
			cur = Math.min(cur+Math.max(1, n), len-1);
			break;
		case Command.CursorBack:
			cur = Math.max(cur-Math.max(1, n), 0);
			break;
		case Command.JumpFirst:
			cur = 0;
			break;
		case Command.JumpLast:
			cur = len-1;
			break;
		case Command.PageUp:
			cur -= moveCursorUpByRows(cur, halfPageRows, itemsPerRow);
			break;
		case Command.PageDown:
			cur += moveCursorDownByRows(cur, halfPageRows, itemsPerRow, len);
			break;
		default:
			break;
	}
	return cur;
}

function moveCursorDownByRows(cur: number, targetRows: number, itemsPerRow: number, len: number) {
	for(let i = targetRows; i > 0; i--)
		if(cur + i * itemsPerRow <= len-1)
			return i * itemsPerRow;
	return 0;
}

function moveCursorUpByRows(cur: number, targetRows: number, itemsPerRow: number) {
	for(let i = targetRows; i > 0; i--)
		if(cur - i * itemsPerRow >= 0)
			return i * itemsPerRow;
	return 0;
}

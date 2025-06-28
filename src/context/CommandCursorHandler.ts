import { Command, CommandSequence } from "@keyboard/Command";

import { NavigationItem } from "./NavigationContextTypes";

export function KeyboardCursorHandle(
	seq: CommandSequence,
	navItems: NavigationItem[],
	itemsPerRow: number,
	navActiveId: string | null
): number | null {

	if(navItems === undefined || navItems === null) return null;

	let cur = navItems.findIndex((i) => i.id === navActiveId);
	let len = navItems.length;
	let n = seq.modInt;

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
			// no repeat count, allow movement if inside bounds of rows/array
			if(n <= 0 && (cur - itemsPerRow) >= 0)
				cur -= itemsPerRow;
			// repeat count inside row bounds
			else if(n > 0 && (cur-(n*itemsPerRow) >= 0))
				cur -= n*itemsPerRow;
			break;
		case Command.CursorDown:
			// no repeat count, allow movement if inside bounds of rows/array
			if(n <= 0 && (cur + itemsPerRow) < len)
				cur += itemsPerRow;
			// repeat count inside row bounds
			else if(n > 0 && (cur+(n*itemsPerRow) < len))
				cur += n*itemsPerRow;
			break;
		case Command.CursorBOL:
			cur = cur - (cur % itemsPerRow);
			break;
		case Command.CursorEOL:
			cur = cur + itemsPerRow - 1 - (cur % itemsPerRow);
			break;
		case Command.JumpFirst:
			cur = 0;
			break;
		case Command.JumpLast:
			cur = len-1;
			break;
		/*
		 * TODO: ctrl+u, ctrl+d half page scrolling
		 * needs amount of visible elements/rows
		 * scroll should equal half the visible elements
		 **/
		case Command.PageUp:
			console.log("ctx.handleCmd:pageup");
			break;
		case Command.PageDown:
			console.log("ctx.handleCmd:pagedown");
			break;
		default:
			break;
	}
	return cur;
}

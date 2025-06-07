import { Command, CommandSequence } from "@keyboard/Command";

import { NavigationItem } from "./NavigationContext";

export function KeyboardCursorHandle(
	seq: CommandSequence,
	navItems: NavigationItem[],
	itemsPerRow: number,
	navActiveId: string | null
): number | null {

	if(navItems === undefined || navItems === null) return null;

	let cur = navItems.findIndex((i) => i.id === navActiveId);
	let len = navItems.length;

	if(cur >= len || cur < 0) return null;

	switch(seq.cmd){
		case Command.CursorRight:
			if(!((cur + 1) % itemsPerRow === 0) && ((cur + 1) < len))
				cur++;
			break;
		case Command.CursorLeft:
			if(!(cur % itemsPerRow === 0) && ((cur - 1) >= 0))
				cur = (cur - 1) % len;
			break;
		case Command.CursorUp:
			if((cur - itemsPerRow) >= 0)
				cur = cur - itemsPerRow;
			break;
		case Command.CursorDown:
			if((cur + itemsPerRow) < len)
				cur = cur + itemsPerRow;
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

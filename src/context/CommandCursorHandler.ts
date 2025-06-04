import { MutableRefObject } from "react";

import { Command, CommandSequence } from "./../keyboard/Command";

import { NavigationItem } from "./NavigationContext";

export function KeyboardCursorHandle(
	seq: CommandSequence, 
	navItemsRef: MutableRefObject<NavigationItem[]>, 
	imagesPerRow: MutableRefObject<number>,
	navActiveId: MutableRefObject<string | null>
): number | null {
	
	if(navItemsRef.current === undefined || navItemsRef.current === null) return null;

	let nav = navItemsRef.current;
	let cur = nav.findIndex((i) => i.id === navActiveId.current);
	let len = nav.length;

	if(cur >= len || cur < 0) return null;

	switch(seq.cmd){
		case Command.CursorRight:
			if(!((cur + 1) % imagesPerRow.current === 0) && ((cur + 1) < len))
				cur++;
			break;
		case Command.CursorLeft:
			if(!(cur % imagesPerRow.current === 0) && ((cur - 1) >= 0))
				cur = (cur - 1) % len;
			break;
		case Command.CursorUp:
			if((cur - imagesPerRow.current) >= 0)
				cur = cur - imagesPerRow.current;
			break;
		case Command.CursorDown:
			if((cur + imagesPerRow.current) < len)
				cur = cur + imagesPerRow.current;
			break;
		case Command.CursorBOL:
			cur = cur - (cur % imagesPerRow.current);
			break;
		case Command.CursorEOL:
			cur = cur + imagesPerRow.current - 1 - (cur % imagesPerRow.current);
			break;
		case Command.JumpFirst:
			cur = 0;
			break;
		case Command.JumpLast:
			cur = len-1;
			break;
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

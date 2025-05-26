import { MutableRefObject } from "react";
import { Command, CommandSequence } from '../keyboard/Command';
import { NavigationItem } from './vimagesCtx';

export function KeyboardCursorHandle(
	seq: CommandSequence, 
	navItemsRef: MutableRefObject<NavigationItem[]>, 
	imagesPerRow: number,
	navActiveId: string | null
): number | null {
	
	if(navItemsRef.current === undefined || navItemsRef.current === null) return null;

	let nav = navItemsRef.current;
	let cur = nav.findIndex((i) => i.id === navActiveId);
	let len = nav.length;

	if(cur >= len || cur < 0) return null;

	switch(seq.cmd){
		case Command.CursorRight:
			if(!((cur + 1) % imagesPerRow === 0) && ((cur + 1) < len))
				cur++;
			break;
		case Command.CursorLeft:
			if(!(cur % imagesPerRow === 0) && ((cur - 1) >= 0))
				cur = (cur - 1) % len;
			break;
		case Command.CursorUp:
			if((cur - imagesPerRow) >= 0)
				cur = (cur - imagesPerRow) % len;
			break;
		case Command.CursorDown:
			if((cur + imagesPerRow) < len)
				cur = (cur + imagesPerRow) % len;
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

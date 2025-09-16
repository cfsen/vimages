import { useAppState } from "@app/app.context.store";
import { getActiveNavigationProvider } from "@app/app.context.actions";
import { EntityDirectory, EntityImage, UIComponent } from "@context/context.types";

import { resultModeCommand } from "@key/key.module.handler.cmd";
import { Command } from "@key/key.command";
import { Modal } from "@key/key.types";
import { resultModeNormal } from "@key/key.module.handler.normal";

enum SearchTypeField {
	Directory = "name",
	Image = "filename",
}

type SearchResult = {
	itemName: string,
	cursorJumpID: number,
};

// TODO: add search results to store and highlight matching elements at component level
export function SearchOpenDirectoryHandler(resultCommand: resultModeCommand){
	const { setSearchHitIndexes, setSearchHitIds, setSearchHitLastJump,
		modeCmdAddHistory, setMode, setInputBufferCommand } = useAppState.getState();

	let term = resultCommand.sequence.slice(1, resultCommand.sequence.length);
	if(term.length === 0) return;

	let navProvider = getActiveNavigationProvider(useAppState);
	if(navProvider === null) return;

	let matches: SearchResult[] = [];
	let indexOffset = 1; // +1 to account for (repeat)G command offset
	switch(navProvider.component){
		case UIComponent.imgGrid:
			matches = searchTypeArray(term, useAppState.getState().images, SearchTypeField.Image);
			break;
		case UIComponent.dirBrowserMain:
			matches = searchTypeArray(term, useAppState.getState().directories, SearchTypeField.Directory);
			indexOffset += 1; // additional offset to account for ".." element in browser
			break;
		default:
			console.warn("Attempted to search, but no nav supported provider is active.");
			return;
	};

	if(matches.length > 0){
		// emulate (repeat)G command for cursor movement during live searching
		let jumpCmd: resultModeNormal = {
			sequence: matches[0].cursorJumpID + indexOffset + "G",
			cmd: Command.JumpLast,
			cmdSequence: {
				cmd: Command.JumpLast,
				modInt: matches[0].cursorJumpID + indexOffset,
			},
			mode: Modal.Normal,
		};
		navProvider.handleNavCmd(jumpCmd);
	}

	if(resultCommand.cmd === Command.Return) {
		setSearchHitIndexes(decomposeSearchResultHits(matches));
		setSearchHitIds(decomposeSearchResultIDs(matches));
		setSearchHitLastJump(0);
		modeCmdAddHistory(resultCommand.sequence);
		setMode(Modal.Normal);
		setInputBufferCommand(":");
	}
}

function decomposeSearchResultHits(res: SearchResult[]): number[] {
	let hits: number[] = [];
	res.forEach(x => hits.push(x.cursorJumpID));
	return hits;
}
function decomposeSearchResultIDs(res: SearchResult[]): Set<string> {
	let ids: Set<string> = new Set<string>();
	res.forEach(x => ids.add(x.itemName));
	return ids;
}

function searchTypeArray<T extends EntityImage | EntityDirectory>(
	term: string,
	items: T[],
	key: keyof T
): SearchResult[] {

	let matched_items: SearchResult[] = [];

	// TODO: match scoring.
	let tmp_perfect_match: SearchResult | null = null;

	for(let i = 0; i < items.length; i++){
		if(items[i][key] === term){
			tmp_perfect_match = { cursorJumpID: i, itemName: items[i][key] as string };
			continue;
		}

		if((items[i][key] as string).length < term.length){
			continue;
		}

		if(regexMatch(term, items[i][key] as string)){
			matched_items.push({ cursorJumpID: i, itemName: items[i][key] as string });
		}
	}

	// push perfect matches to front of queue
	if(tmp_perfect_match !== null) {
		matched_items.unshift(tmp_perfect_match);
	}

	return matched_items;
}

function regexMatch(needle: string, haystack: string): number[] | null {
	// prevent incomplete escapes from parsing
	if(needle.endsWith("\\")){
		let escapes: number = 0;
		for(let i = needle.length-1; i >= 0; i--){
			if(needle[i] !== "\\") {
				break;
			}
			escapes += 1;
		}
		if(escapes % 2 !== 0)
			needle = needle.slice(0, needle.length-1);
	}

	try {
		const regex = new RegExp(needle, "gi");
		const matches = Array.from(haystack.matchAll(regex));
		return matches.length > 0 ? matches.map(match => match.index! + match[0].length) : null;
	}
	catch (error) {
		console.error("An error occurred while running regex:", error);
		return null;
	}
}

export default SearchOpenDirectoryHandler;

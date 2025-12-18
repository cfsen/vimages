import { IAppState } from "@app/app.context.store";

import { UIComponent } from "@context/context.types";
import { Command } from "@key/key.command";
import { resultModeNormal } from "@key/key.module.handler.normal";
import { INavigationState } from "@nav/nav.provider.store";
import { updateSelectionBuffer } from "@nav/nav.provider.actions";
import { StoreApi } from "zustand";
import { update_cursor_position } from "./mode.normal";

export function handleSelectionCommand(
	appStore: StoreApi<IAppState>,
	navStore: StoreApi<INavigationState>,
	seq: resultModeNormal,
	component: UIComponent
): boolean {
	let provider = navStore.getState();

	switch(seq.cmd) {
		case Command.ModeVisualExit:
			return exitModeVisual(appStore, navStore);
		case Command.Return:
			return handleCmdReturn(appStore, navStore);
	};

	if(provider.selectionStart === null) {
		startSelection(navStore);
	}

	let cursorHandler = update_cursor_position(navStore, seq, component);

	// set end of selection
	if(cursorHandler !== null) {
		provider.setSelectionEnd(cursorHandler);
	}

	updateSelectionBuffer(appStore, navStore);
	return (cursorHandler !== null);
}

export function selectCursorItem(
	appStore: StoreApi<IAppState>,
	navStore: StoreApi<INavigationState>,
): string | null {
	let id = navStore.getState().navItemActive;
	if(id === null) return null;

	let item = navStore.getState().navItems.find(x => x.id === id);
	if(item === undefined) return null;

	// TODO: windows path support
	return `${appStore.getState().currentDir}/${item.data}`
}

export function selectCursorRow(
	appStore: StoreApi<IAppState>,
	navStore: StoreApi<INavigationState>,
): string | null {
	let id = navStore.getState().navItemActive;
	if(id === null) return null;

	let all_items = navStore.getState().navItems;

	let item = all_items.find(x => x.id === id);
	if(item === undefined) return null;

	let item_pos = all_items.indexOf(item);
	let per_row = navStore.getState().navItemsPerRow;

	let select_from = Math.floor(item_pos / per_row) * per_row;
	let select_to = select_from + per_row;

	let selection = "";
	let current_dir = appStore.getState().currentDir;

	for(let i = select_from; i < select_to; i++) {
		// TODO: windows path support
		selection += `${current_dir}/${all_items[i].data}\n`;
	}

	return selection;
}

function startSelection(
	navStore: StoreApi<INavigationState>,
) {
	let provider = navStore.getState();
	let curpos = provider.navItems
	.findIndex((i) => i.id === provider.navItemActive);

	provider.setSelectionStart(curpos);
}

function exitModeVisual(
	appStore: StoreApi<IAppState>,
	navStore: StoreApi<INavigationState>,
): boolean {
	if(navStore.getState().selectionStart !== null) {
		console.info("Visual->ModeVisualExit: Selection cleanup.");
		navStore.getState().setSelectionStart(null);
		navStore.getState().setSelectionEnd(null);
	}
	updateSelectionBuffer(appStore, navStore);
	return true;
}

function handleCmdReturn(
	appStore: StoreApi<IAppState>,
	navStore: StoreApi<INavigationState>,
): boolean {
	// TODO: call UI for selection actions
	return true;
}

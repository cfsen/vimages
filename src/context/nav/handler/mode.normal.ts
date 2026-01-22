import { IAppState, useAppState } from "@app/app.context.store";
import { getDirectory, switchToPreviousWorkspace } from "@app/app.context.actions";

import { InsertModeCompAction, UIComponent } from "@context/context.types";
import { Command } from "@key/key.command";
import { KeyboardCursorHandle } from "@key/key.cursor.handler";
import { resultModeNormal } from "@key/key.module.handler.normal";
import { INavigationState } from "@nav/nav.provider.store";
import { StoreApi } from "zustand";
import { NavigationItem } from "@nav/nav.types";
import { FilePathsExport, FilePathsExportAsPythonList, SendToClipboard } from "@/components/utility.general";
import { selectCursorItem, selectCursorRow } from "./mode.visual";
import { Modal } from "@/context/key/key.types";

export function handleNavigationCommand(
	appStore: StoreApi<IAppState>,
	navStore: StoreApi<INavigationState>,
	seq: resultModeNormal,
	component: UIComponent
): boolean {
	let context = appStore.getState();
	let provider = navStore.getState();
	let length = provider.navItems.length;

	if (seq.cmd === Command.Debug) {
		console.info("=== DEBUG DUMP ===");
		console.info("context:");
		console.info(context);
		console.info("provider:");
		console.info(provider);
		console.info("selection");
		console.info(appStore.getState().entitySelectionBuffer);
		console.info("=== END ===");
	}

	// no items to navigate
	if(length === 0) return false;

	// no active item, set first in array as active
	if(provider.navItemActive === null) {
		provider.navItemActive = provider.navItems[0].id;
		provider.setNavItemActive(provider.navItemActive);
	}

	let active_item = provider.navItems.find((i) => i.id === provider.navItemActive);
	if(active_item === undefined) return false;

	// handle input for directory browser
	if(component === UIComponent.dirBrowserMain) {
		let interject_input_dirbrowser = input_interject_dir_browser(seq, active_item);
		if (interject_input_dirbrowser !== null) return interject_input_dirbrowser;
	}
	// handle input for image grid
	if(component === UIComponent.imgGrid) {
		let interject_input_img_grid = input_interject_img_grid(appStore, navStore, seq, active_item);
		if(interject_input_img_grid !== null) return interject_input_img_grid;
	}
	// handle input for selection actions
	if(component == UIComponent.selectAction) {
		let interject_input_select_actions = input_interject_select_actions(appStore, seq, active_item);
		if(interject_input_select_actions !== null) return interject_input_select_actions;
	}

	// update cursor position
	let cur = update_cursor_position(navStore, seq, component);
	if(cur === null) return false;

	// Swap images in fullscreen
	if(useAppState.getState().fullscreenImage) {
		context.setFullscreenImagePath(provider.navItems[cur].data);
	}

	return true;
};

function input_interject_select_actions(
	appStore: StoreApi<IAppState>,
	seq: resultModeNormal,
	active_item: NavigationItem
): boolean | null {
	switch(seq.cmd) {
		case Command.Return:
			return handle_selection_action_menu(appStore, active_item);
		case Command.Escape:
			// clean up selection buffer
			appStore.getState().setEntitySelectionBuffer(null);
			switchToPreviousWorkspace(appStore);
			return true;
		default:
			return null;
	}
}

function handle_selection_action_menu(
	appStore: StoreApi<IAppState>,
	active_item: NavigationItem
): boolean | null {
	if(active_item.data === "m_selact_rename"){
		appStore.getState().setMode(Modal.Insert);
		appStore.getState().setInsertCompAction(InsertModeCompAction.EntityBatchRename);
		return true;
	}
	else if(is_clipboard_action(active_item.data)){
		let buffer = appStore.getState().entitySelectionBuffer;
		if(buffer === null) return null;

		let prefix = appStore.getState().currentDir;
		let clipboard_buffer = active_item.data === "m_selact_c2c"
			? FilePathsExport(buffer,prefix)
			: FilePathsExportAsPythonList(buffer, prefix);
		if(clipboard_buffer === null) return null;

		SendToClipboard(clipboard_buffer);
		return true;
	}

	return false; // not handled

	// local
	function is_clipboard_action(active_item_data: string) {
		return (active_item_data === "m_selact_c2c" || active_item_data === "m_selact_c2c_py")
	}
}

function input_interject_dir_browser(
	seq: resultModeNormal,
	active_item: NavigationItem
): boolean | null {
	switch(seq.cmd){
		case Command.CursorLeft:
			getDirectory(useAppState, "..");
			return true;

		case Command.CursorRight:
			// ensure CursorRight will not ascend in the directory tree even when ".." is selected
			if(active_item.data === "..")
				return false;

			getDirectory(useAppState, active_item.data);
			return true;

		case Command.Return:
			getDirectory(useAppState, active_item.data);
			return true;
		default:
			return null;
	};

}

function input_interject_img_grid(
	appStore: StoreApi<IAppState>,
	navStore: StoreApi<INavigationState>,
	seq: resultModeNormal,
	active_item: NavigationItem
): boolean | null {
	switch(seq.cmd){
		case Command.Yank:
			let item = selectCursorItem(appStore, navStore);
			if(item === null) {
				console.error("Failed to yank!");
				return false;
			}
			SendToClipboard(item);
			return true;
		case Command.YankLine: // yy
			let items_row = selectCursorRow(appStore, navStore);
			if(items_row === null) {
				console.error("Failed to yank!");
				return false;
			}
			SendToClipboard(items_row);
			return true;
		case Command.Return:
			appStore.getState().setFullscreenImage(true);
			appStore.getState().setFullscreenImagePath(active_item.data);
			return true;
		default:
			return null;
	};
}

export function update_cursor_position(
	provider: StoreApi<INavigationState>,
	seq: resultModeNormal,
	component: UIComponent,
): number | null {
	let curpos = provider.getState().navItems.findIndex(
		(i) => i.id === provider.getState().navItemActive
	);
	let perRow = provider.getState().navItemsPerRow;
	let items_len = provider.getState().navItems.length

	// TODO: FEAT: FEAT_DYNAMIC_HALFPAGE
	// should be determined dynamically based on shown elements.
	// placeholder: directory browser jumps 10 rows, thumbnail grid 3 rows
	let halfPage = component === UIComponent.dirBrowserMain ? 10 : 3;

	if(curpos === -1 || items_len === 0 || perRow === 0) {
		// TODO: FEAT: FEAT_FRONTEND_LOGGING
		console.error(`nav.provider.getState(): invalid cursor state: length=${length}, curpos=${curpos}, perRow=${perRow}`);
		return null;
	}

	// calculate new cursor position
	let cur = KeyboardCursorHandle(seq.cmdSequence, items_len, curpos, perRow, halfPage);
	if(cur === null) return null;

	// update cursor position
	provider.getState().setNavItemActive(
		provider.getState().navItems[cur].id
	);
	return cur;
}

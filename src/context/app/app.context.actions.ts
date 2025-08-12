import { invoke } from '@tauri-apps/api/core';
import { StoreApi } from 'zustand';

import { EntityDirectory, Keybind, RustApiAction, UIComponent, VimagesConfig, Workspace } from "@context/context.types";
import { IAppState } from "./app.context.store";

import { getCurrentKeybinds } from '@key/key.module';
import { Keybinds } from '@key/key.types';
import { Command } from '@key/key.command';

import { timestamp } from '@context/helpers';

//
// State
//

export const IPC_PendingRemoves = new Set<string>();

export function getDirectory(store: StoreApi<IAppState>, relPath: string){
	console.log("getDirectory: " + relPath);
	invoke(RustApiAction.ResolveRelPath, {
		path: store.getState().currentDir,
		relPath
	})
		.then(responseRelPath => {
			const abspath = responseRelPath as string;
			if(IPC_PendingRemoves.has(abspath)){
				raiseError(store, "Directory is being processed, please wait for thumbnail generation queue to complete.");
				return;
			}

			IPC_PendingRemoves.add(abspath);

			getDirectorySkipLock(store, relPath);
		});
}

/**
 * Bypasses lock for React strict mode compatibility.
 * Do not use outside of app init or IPC callbacks where duplication is less of a concern.
 * Use `getDirectory()` instead.
 * */
export function getDirectorySkipLock(store: StoreApi<IAppState>, relPath: string){
	invoke(RustApiAction.GetDir, { 
		path: store.getState().currentDir, 
		relPath 
	})
		.then(response => {
			// TODO: obsolete, was used in parent pane
			if(relPath !== "..")
				store.getState().setDirHistory(relPath);

			const res = response as EntityDirectory;
			store.getState().setCurrentDir(res.path);
			store.getState().setCurrentDirHash(res.path_hash);
			store.getState().setImages(res.images);
			store.getState().setDirectories(res.sub_dirs);
			store.getState().setSiblingDirs(res.sibling_dirs);
		})
		.catch((e) => {
			console.error(e);
			raiseError(store, e);
		});
}

export function getDirectoryHistory(store: StoreApi<IAppState>): string | undefined {
	const dir = store.getState().currentDir;
	return store.getState().dirHistory.get(dir);
}

export function saveConfig(store: StoreApi<IAppState>){
	let keybinds = getCurrentKeybinds();
	const bfr: VimagesConfig = {
		vimages_version: store.getState().vimages_version,
		last_path: store.getState().currentDir,
		window_width: 1280,
		window_height: 720,
		keybinds: packageKeybinds(keybinds),
	};

	invoke(RustApiAction.SaveConfig, {
		config: bfr
	})
		.then(res => {
			console.log(res);
		})
		.catch((e) => {
			console.error(e);
		});
}

function packageKeybinds(keybinds: Keybinds): Keybind[] {
	const result: Keybind[] = [];
	for (const [keybind, cmd] of keybinds.keyMap.entries()) {
		result.push({
			command: Command[cmd],
			keybind: keybind
		});
	}
	return result;
}

//
// UI: info/error
//

export function raiseError(store: StoreApi<IAppState>, error: string){
	store.getState().setShowError(true);
	store.getState().setErrorMsg(error);
}

export function addInfoMessage(store: StoreApi<IAppState>, msg: string){
	store.getState().setShowInfo(true);
	store.getState().addInfoMessage("[" + timestamp() + "] " + msg);
}

export function addInfoMessageArray(store: StoreApi<IAppState>, msg: string[]){
	let ts = timestamp();
	store.getState().setShowInfo(true);
	msg.forEach((x) => {
		store.getState().addInfoMessage(`[${ts}] ${x}`);
	});
}

//
// Navigation provider handling
//

// enable/disable navigation context
export function setNavProviderInteractable(store: StoreApi<IAppState>, component: UIComponent, state: boolean) {
	store.getState().navigationHandlersByComp.get(component)?.setActive(state);
}

export function setNavProvidersInteractable(store: StoreApi<IAppState>, components: UIComponent[], state: boolean) {
	components.forEach((comp) => {
		store.getState().navigationHandlersByComp.get(comp)?.setActive(state);
	});
}

// Cycle registered navigation contexts sequentially
export function nextNavProvider(store: StoreApi<IAppState>): boolean {
	const handlerIds = store.getState().navigationHandlersArray
	.filter((a) => a.active() === true)
	.filter((a) => a.getRegisteredElements() > 0)
	.sort((a,b) => a.tabOrder-b.tabOrder)
	.map((key) => key.id)

	// TODO: review TODO_NAVCTX_DS
	if (handlerIds.length >= 1) {
		const activeId = store.getState().activeNavigationContext;
		const currentIndex = activeId ? handlerIds.indexOf(activeId) : -1;
		const nextIndex = (currentIndex + 1) % handlerIds.length;
		store.getState().setActiveNavigationContext(handlerIds[nextIndex]);
		return true;
	}
	return false;
}

function canNavProviderBecomeInteractable(store: StoreApi<IAppState>, comp: UIComponent): boolean {
	const registeredElements = store.getState().navigationHandlersByComp.get(comp)?.getRegisteredElements();

	if(registeredElements === undefined)
		return false;

	return registeredElements >= 1;
}

function setCursorToNavProvider(store: StoreApi<IAppState>, comp: UIComponent): boolean {
	let id = store.getState().navigationHandlersByComp.get(comp)?.id;

	if(id === undefined)
		return false;

	// TODO: return success indicator
	store.getState().setActiveNavigationContext(id);

	return true;
}

//
// Workspace handling
//

export function nextWorkspace(store: StoreApi<IAppState>){
	const spaces = store.getState().workspace;
	
	if(spaces.ImgGrid) {
		setWorkspace(store, Workspace.DirectoryBrowser);

		nextNavProvider(store);
	}
	else {
		if(store.getState().images.length === 0) {
			raiseError(store, "Unable to open image grid: no images in directory.");
			return;
		}

		setWorkspace(store, Workspace.ImageGrid);

		nextNavProvider(store);
	}
}

export function setWorkspace(store: StoreApi<IAppState>, workspace: Workspace) {
	let compsDirBrowser = [
		UIComponent.dirBrowserMain,
		UIComponent.dirBrowserParent,
		UIComponent.dirBrowserPreview
	];

	let compsImageGrid = [
		UIComponent.imgGrid,
	];

	switch(workspace){
		case Workspace.DirectoryBrowser:
			store.getState().setWorkspace("DirBrowser", true);
			store.getState().setWorkspace("ImgGrid", false);

			setNavProvidersInteractable(store, compsDirBrowser, true);
			setNavProvidersInteractable(store, compsImageGrid, false);

			if(!setCursorToNavProvider(store, UIComponent.dirBrowserMain))
				raiseError(store, "Internal error when setting cursor to directory browser");

			break;

		case Workspace.ImageGrid:
			if(!canNavProviderBecomeInteractable(store, UIComponent.imgGrid)) {
				raiseError(store, "Unable to open image grid: no images in directory.");
				return;
			}

			store.getState().setWorkspace("DirBrowser", false);
			store.getState().setWorkspace("ImgGrid", true);

			setNavProvidersInteractable(store, compsDirBrowser, false);
			setNavProvidersInteractable(store, compsImageGrid, true);

			if(!setCursorToNavProvider(store, UIComponent.imgGrid))
				raiseError(store, "Internal error when setting cursor to image grid.");

			break;
	};
}

//
// Fullscreen helpers
//

export function resetFullscreen(store: StoreApi<IAppState>){
	store.getState().setFullscreenOffsetY(null);
	store.getState().setFullscreenOffsetX(null);
	store.getState().setFullscreenZoom(null);
	store.getState().setFullscreenRotate(0.0);
}

import { invoke } from '@tauri-apps/api/core';
import { StoreApi } from 'zustand';

import { EntityDirectory, Keybind, NavigationHandle, RustApiAction, UIComponent, VimagesConfig, Workspace } from "@context/context.types";
import { IAppState } from "./app.context.store";

import { getCurrentKeybinds } from '@key/key.module';
import { Keybinds } from '@key/key.types';
import { Command } from '@key/key.command';

import { timestamp } from '@context/helpers';

//
// State
//

// fetches the contents of directory `relPath`, updating global context `store` on success
export function getDirectory(store: StoreApi<IAppState>, relPath: string){
	if(relPath !== "." && store.getState().searchHitIndexes.length > 0)
		ClearSearch(store);

	invoke(RustApiAction.GetDir, { 
		path: store.getState().currentDir, 
		relPath 
	})
		.then(response => {
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

// deprecated
export function updateImageThumbnailState(store: StoreApi<IAppState>, imgHash: string, hasThumbnail: boolean) {
	let images = store.getState().images;
	let idx = images.findIndex((a) => a.img_hash === imgHash);
	if(idx >= 0 && idx < images.length) {
		let update = [... images];
		update[idx].has_thumbnail = hasThumbnail;
		store.getState().setImages(update);
	}
}

// updates global context image registry when thumbnails have been generated (see: app.event.listeners.ts:eventHandleQueueState())
export function updateImageThumbnailStateBatch(store: StoreApi<IAppState>, buffer: Set<string> | null) {
	if(buffer === null) return;

	let images = store.getState().images;
	let hits = 0;
	let size = buffer.size;
	let idxs = new Set<number>();

	for(let i = 0; i < images.length; i++){
		if(buffer.has(images[i].img_hash)){
			idxs.add(i);
			hits += 1;
			if(hits === size) break;
		}
	}

	if(hits > 0) {
		let update = [... images];
		idxs.forEach(x => update[x].has_thumbnail = true);
		store.getState().setImages(update);
	}
}

// retrieves the last sub-directory opened in current directory
export function getDirectoryHistory(store: StoreApi<IAppState>): string | undefined {
	const dir = store.getState().currentDir;
	return store.getState().dirHistory.get(dir);
}

// saves the current configuration
export function saveConfig(store: StoreApi<IAppState>){
	let keybinds = getCurrentKeybinds();
	const bfr: VimagesConfig = {
		vimages_version: store.getState().vimages_version,
		last_path: store.getState().currentDir,
		window_width: 1280,
		window_height: 720,
		titlebar: store.getState().titlebarRender,
		scroll_delay: store.getState().workaroundScrollToDelay,
		generic_errors: store.getState().errorDisplayGeneric,
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

// packages current keybinds for saving the current configuration
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
// UI: window
//

// event callback for scrolling to cursor on app window resize
export function resizeScrollToActive(store: StoreApi<IAppState>){
	let provider = getActiveNavigationProvider(store);
	if(provider === null)
		return;
	provider.eventScrollToActive();
}

//
// UI: info/error
//

// displays the error widget with the message in `error`
export function raiseError(store: StoreApi<IAppState>, error: string){
	store.getState().setShowError(true);
	store.getState().setErrorMsg(error);
}

// displays the info widget with the message in `msg`
export function addInfoMessage(store: StoreApi<IAppState>, msg: string){
	store.getState().setShowInfo(true);
	store.getState().addInfoMessage("[" + timestamp() + "] " + msg);
}

// displays the info widget with the messages in `msg`
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

// deprecated
export function setNavProviderInteractable(store: StoreApi<IAppState>, component: UIComponent, state: boolean) {
	store.getState().navigationHandlersByComp.get(component)?.setActive(state);
}

// enable/disable navigation context
export function setNavProvidersInteractable(store: StoreApi<IAppState>, components: UIComponent[], state: boolean) {
	components.forEach((comp) => {
		store.getState().navigationHandlersByComp.get(comp)?.setActive(state);
	});
}

// get current active navigation provider
export function getActiveNavigationProvider(store: StoreApi<IAppState>): NavigationHandle | null {
	let active = store.getState().activeNavigationContext;

	if(active === null)
		return null;
	
	let navProvider = store.getState().navigationHandlers.get(active);
	if(navProvider === undefined)
		return null;

	return navProvider;
}

// cycle registered navigation providers sequentially
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

// checks if navigation provider has registered elements and can become active
function canNavProviderBecomeInteractable(store: StoreApi<IAppState>, comp: UIComponent): boolean {
	const registeredElements = store.getState().navigationHandlersByComp.get(comp)?.getRegisteredElements();

	if(registeredElements === undefined)
		return false;

	return registeredElements >= 1;
}

// sets the active navigation provider by registered UIComponent `comp`
function setCursorToNavProvider(store: StoreApi<IAppState>, comp: UIComponent): boolean {
	let id = store.getState().navigationHandlersByComp.get(comp)?.id;

	if(id === undefined) return false;

	if(!canNavProviderBecomeInteractable(store, comp)) return false;

	store.getState().setActiveNavigationContext(id);

	return true;
}

//
// Workspace handling
//

// change active workspace sequentially
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

// TODO: workspaces and nav provider cycling refactoring
// set active workspace by Workspace `workspace`
export function setWorkspace(store: StoreApi<IAppState>, workspace: Workspace) {
	let compsDirBrowser = [
		UIComponent.dirBrowserMain,
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
// Search helpers
//

// clear temporary values used when searching
export function ClearSearch(store: StoreApi<IAppState>){
	store.getState().setSearchHitIds(new Set<string>);
	store.getState().setSearchHitIndexes([]);
	store.getState().setSearchHitLastJump(null);
}

//
// Fullscreen helpers
//

// clear temporary values used when viewing an image in full screen
export function resetFullscreen(store: StoreApi<IAppState>){
	store.getState().setFullscreenOffsetY(null);
	store.getState().setFullscreenOffsetX(null);
	store.getState().setFullscreenZoom(null);
	store.getState().setFullscreenRotate(0.0);
}

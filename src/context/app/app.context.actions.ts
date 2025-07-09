import { invoke } from '@tauri-apps/api/core';
import { StoreApi } from 'zustand';

import { EntityDirectory, RustApiAction, UIComponent } from "@context/context.types";
import { IAppState } from "./app.context.store";

// enable/disable navigation context
export function setNavProviderActive(store: StoreApi<IAppState>, component: UIComponent, state: boolean) {
	// TODO: this also needs to handle setting the active navctx if the current one gets hidden
	store.getState().navigationHandlersByComp.get(component)?.setActive(state);
}

// Cycle registered navigation contexts sequentially
export function nextNavProvider(store: StoreApi<IAppState>): boolean {
	// TODO: needs to check if a navctx has any selectable elements, and skip if it doesnt
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

export function getDirectory(store: StoreApi<IAppState>, relPath: string){
	invoke(RustApiAction.GetDir, { 
		path: store.getState().currentDir, 
		relPath 
	})
		.then(response => {
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

export function raiseError(store: StoreApi<IAppState>, error: string){
	store.getState().setShowError(true);
	store.getState().setErrorMsg(error);
}

// TODO: improve logic when more workspaces are added TODO_WORKSPACE_SELECTION
export function nextWorkspace(store: StoreApi<IAppState>){
	const spaces = store.getState().workspace;
	if(spaces.ImgGrid) {
		store.getState().setWorkspace("DirBrowser", true);
		store.getState().setWorkspace("ImgGrid", false);
		setNavProviderActive(store, UIComponent.imgGrid, false);
		setNavProviderActive(store, UIComponent.fsBrowser, false);
		setNavProviderActive(store, UIComponent.dirBrowserParent, true);
		setNavProviderActive(store, UIComponent.dirBrowserMain, true);
		setNavProviderActive(store, UIComponent.dirBrowserPreview, true);

		// TODO: quick fix to select dir.browsers.main navprovider
		nextNavProvider(store);
		nextNavProvider(store);
	}
	else {
		store.getState().setWorkspace("DirBrowser", false);
		store.getState().setWorkspace("ImgGrid", true);
		setNavProviderActive(store, UIComponent.imgGrid, true);
		setNavProviderActive(store, UIComponent.fsBrowser, false);
		setNavProviderActive(store, UIComponent.dirBrowserParent, false);
		setNavProviderActive(store, UIComponent.dirBrowserMain, false);
		setNavProviderActive(store, UIComponent.dirBrowserPreview, false);
		nextNavProvider(store);
	}
}

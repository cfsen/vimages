import { invoke } from '@tauri-apps/api/core';
import { StoreApi } from 'zustand';

import { EntityDirectory, RustApiAction, UIComponent } from "@context/ContextTypes";
import { IAppState } from "@context/AppContextStore";

// enable/disable navigation context
export function setNavProviderActive(store: StoreApi<IAppState>, component: UIComponent, state: boolean) {
	// TODO: this also needs to handle setting the active navctx if the current one gets hidden
	store.getState().navigationHandlersByComp.get(component)?.setActive(state);
}

// Cycle registered navigation contexts sequentially
export function nextNavProvider(store: StoreApi<IAppState>): boolean {
	const handlerIds = store.getState().navigationHandlersArray
	.filter((a) => a.active())
	.map((key) => key.id);

	// TODO: review TODO_NAVCTX_DS
	if (handlerIds.length > 1) {
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
			console.log(res);
		})
		.catch(console.error);
}

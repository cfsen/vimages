import { StoreApi } from "zustand";
import { IAppState } from "./app.context.store";
import { VimagesConfig } from "@context/context.types";

export function VimagesConfigFromZustandState(store: StoreApi<IAppState>): VimagesConfig {
	let conf: VimagesConfig = {
		vimages_version: store.getState().vimages_version,
		last_path: store.getState().currentDir,
		window_height: -1,
		window_width: -1,
		titlebar: store.getState().titlebarRender,
		scroll_delay: store.getState().workaroundScrollToDelay,
		generic_errors: store.getState().errorDisplayGeneric,
		keybinds: [],
	};
	return conf;
}

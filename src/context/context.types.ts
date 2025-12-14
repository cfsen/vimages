import { resultModeNormal } from "@key/key.module.handler.normal";

// Functions made available by Rust, see: (src-tauri/src/lib.rs)
export enum RustApiAction {
	GetCurrentPath = "fs_get_current_path",
	GetDir = "fsx_get_dir",
	ResolveRelPath = "fsx_resolve_rel_path",
	GetAxumPort = "rt_get_axum_port",
	GetQueueSize = "rt_get_queue_size",
	GetConfig = "get_or_create_config",
	SaveConfig = "save_config",
	GetCacheInfo = "cache_get_info",
	GetCachePath = "cache_get_path",
	RunCacheCleanup = "cache_cleanup",
	QueueBlacklist = "rt_get_queue_blacklist",
	QueueStatus = "rt_get_queue_processing",
}

//
// Typescript pairs for Rust types.
//

// see: ConfigFile (src-tauri/src/user_config/types.rs)
export type VimagesConfig = {
	vimages_version: string;
	last_path: string;
	window_width: number;
	window_height: number;
	titlebar: boolean;
	scroll_delay: number;
	generic_errors: boolean;
	keybinds: Keybind[];
}
// see: Keybind (src-tauri/src/user_config/types.rs)
export type Keybind = {
	command: string;
	keybind: string;
}
// see: EntityImage (src-tauri/src/endpoints/types.rs)
export type EntityImage = {
	full_path: string;
	filename: string;
	has_thumbnail: boolean;
	img_hash: string;
}
// see: EntityDirectory (src-tauri/src/endpoints/types.rs)
export type EntityDirectory = {
	name: string;
	path: string;
	parent_path: string | null;
	path_hash: string;
	images: EntityImage[];
	sub_dirs: EntityDirectory[];
	sibling_dirs: EntityDirectory[];
}
// see: JournalInfo (src-tauri/src/journal/types.rs)
export type JournalInfo = {
	entries_hashes: number;
	entries_metadata: number;
}

//
// Frontend exclusive types
//

// NavigationProvider: used in self-registration for external calls to the provider 
export type NavigationHandle = {
	id: string;
	component: UIComponent;
	workspace: Workspace;
	active: () => boolean;
	tabOrder: number;
	setActive: (state: boolean) => boolean;
	handleNavCmd: (resultNormal: resultModeNormal) => boolean;
	handleSelectionCmd: (resultNormal: resultModeNormal) => boolean;
	getRegisteredElements: () => number;
	eventScrollToActive: () => void;
}

// Unique identifiers for NavigationProvider
export enum UIComponent {
	fsBrowser,
	imgGrid,
	dirBrowserMain,
	dirBrowserPreview,
}

// Logical groups for NavigationProvider
export enum Workspace {
	DirectoryBrowser,
	ImageGrid,
}

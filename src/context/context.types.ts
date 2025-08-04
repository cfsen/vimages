import { resultModeNormal } from "@key/key.module.handler.normal";

export enum RustApiAction {
	GetCurrentPath = "fs_get_current_path",
	GetDir = "fsx_get_dir",
	GetAxumPort = "rt_get_axum_port",
	GetQueueSize = "rt_get_queue_size",
	GetConfig = "get_or_create_config",
	SaveConfig = "save_config",
	GetCacheInfo = "cache_get_info",
	RunCacheCleanup = "cache_cleanup"
}

export type VimagesConfig = {
	vimages_version: string;
	last_path: string;
	window_width: number;
	window_height: number;
	keybinds: Keybind[];
}
export type Keybind = {
	command: string;
	keybind: string;
}

export type EntityImage = {
	full_path: string;
	filename: string;
	has_thumbnail: boolean;
	img_hash: string;
}

export type EntityDirectory = {
	name: string;
	path: string;
	parent_path: string | null;
	path_hash: string;
	images: EntityImage[];
	sub_dirs: EntityDirectory[];
	sibling_dirs: EntityDirectory[];
}

export type JournalInfo = {
	entries_hashes: number;
	entries_metadata: number;
}

export type NavigationHandle = {
	id: string;
	component: UIComponent;
	active: () => boolean;
	tabOrder: number;
	setActive: (state: boolean) => boolean;
	handleNavCmd: (resultNormal: resultModeNormal) => boolean;
	getRegisteredElements: () => number;
}

export enum UIComponent {
	fsParentView,
	fsBrowser,
	imgGrid,
	dirBrowserParent,
	dirBrowserMain,
	dirBrowserPreview,
}

export type Workspaces = {
	DirBrowser: boolean;
	ImgGrid: boolean;
}

export enum Workspace {
	DirectoryBrowser,
	ImageGrid,
}

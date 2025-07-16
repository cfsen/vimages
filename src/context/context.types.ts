import { CommandSequence } from "@key/key.command";

export enum RustApiAction {
	GetCurrentPath = "fs_get_current_path",
	GetDir = "fsx_get_dir",
	GetAxumPort = "rt_get_axum_port",
	GetQueueSize = "rt_get_queue_size",
	GetConfig = "get_or_create_config",
	SaveConfig = "save_config",
}

export type VimagesConfig = {
	vimages_version: string;
	last_path: string;
	window_width: number;
	window_height: number;
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

export type NavigationHandle = {
	id: string;
	component: UIComponent;
	active: () => boolean;
	tabOrder: number;
	setActive: (state: boolean) => boolean;
	handleNavCmd: (cmd: CommandSequence) => boolean;
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

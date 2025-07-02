import { CommandSequence } from "@/keyboard/Command";

export enum RustApiAction {
	GetCurrentPath = "fs_get_current_path",
	GetDir = "fsx_get_dir",
	GetAxumPort = "rt_get_axum_port",
	GetQueueSize = "rt_get_queue_size",
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
}

export type NavigationHandle = {
	id: string;
	component: UIComponent;
	active: boolean;
	handleNavCmd: (cmd: CommandSequence) => boolean;
}

export enum UIComponent {
	fsParentView,
	fsBrowser,
	imgGrid,
}

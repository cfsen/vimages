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

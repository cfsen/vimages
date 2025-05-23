export type fsEntity = {
	path: string;
	type: fsEntityType;
}

export enum fsEntityType {
	Dir,
	Img
}

export type EntityImage = {
   full_path: string;
   filename: string;
   has_thumbnail: boolean;
   thumbnail_hash: string;
}

export type EntityDirectory = {
   path: string;
   parent_path: string | null;
   path_hash: string;
   images: EntityImage[];
}

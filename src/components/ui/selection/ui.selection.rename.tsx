import { useAppState } from "@app/app.context.store";

import { IPC_FsIoBatchEntity } from "@app/app.event.types";
import { CssPreset, CssSelect } from "@components/utility.styling";
import { Modal } from "@key/key.types";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";

function BulkRenameUi() {
	const {
		insertBuffer,
		entitySelectionBuffer,
		batchOperationPreview,
		mode,
	} = useAppState();

	useEffect(() => {
		ApiPreviewRename(entitySelectionBuffer, insertBuffer);
	}, [insertBuffer]);

	if(entitySelectionBuffer == null){
		return(<>Error: entity buffer was null.</>);
	}


	let content = ListItems(entitySelectionBuffer, batchOperationPreview);
	let show_input = mode == Modal.Insert
		? InputField(insertBuffer, mode)
		: "";

	return (<>
		{show_input}
		{content}
	</>);
}

function ListItems(items: Set<String>, entities: Array<IPC_FsIoBatchEntity> | null) {
	if(entities === null) {
		return [...items].map((ent, index) => 
			<div className={CssSelect(CssPreset.Row)} key={"ui_sr_listitems_" + index}>
				<div className={CssSelect(CssPreset.Column)}>
					{ent}
				</div>
			</div>);
	}
	else {
		return [...entities].map((ent, index) => 
			<div className={CssSelect(CssPreset.Row)} key={"ui_sr_prepareItems_" + index}>
				<div className={CssSelect(CssPreset.Column)}>
					{ent.Original}
				</div>
				<div className={CssSelect(CssPreset.Column)}>
					{ent.Target}
				</div>
			</div>);
	}
}

function InputField(insertBuffer: string, mode: Modal){
	let highlight_insert = mode == Modal.Insert
		? CssSelect(CssPreset.InputFieldActive)
		: CssSelect(CssPreset.InputFieldInactive);

	let inputPreview = insertBuffer != ""
		? insertBuffer
		: "…";

	// TODO: display caret

	return(
		<div className={CssSelect(CssPreset.Row)}>
			<div className={CssSelect(CssPreset.Column)}>
				<div className={highlight_insert}>
					{inputPreview}
				</div>
			</div>
		</div>
	);
}

function ApiPreviewRename(entitySelectionBuffer: Set<string> | null, insertBuffer: string){
	if(entitySelectionBuffer === null) return;

	let arr = Array.from(entitySelectionBuffer);
	invoke("preview_batch_rename", { items: arr, pattern: insertBuffer })
		.then(res => {
			let cast = res as Array<IPC_FsIoBatchEntity>;
			useAppState.getState().setBatchOperationPreview(cast);
		})
		.catch(err => {
			// TODO: better error handling for user
			useAppState.getState().setBatchOperationPreview(null);
		});
}

export default BulkRenameUi;

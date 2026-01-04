import { useAppState } from "@app/app.context.store";

import { CssPreset, CssSelect } from "@/components/utility.styling";
import { Modal } from "@/context/key/key.types";

function BulkRenameUi() {
	const {
		insertBuffer,
		entitySelectionBuffer,
		mode,
	} = useAppState();

	if(entitySelectionBuffer == null){
		return(<>Error: entity buffer was null.</>);
	}

	let content = mode == Modal.Insert
		? PrepareItems(ApiPreview(entitySelectionBuffer, insertBuffer))
		: ListItems(entitySelectionBuffer);

	let show_input = mode == Modal.Insert
		? InputField(insertBuffer, mode)
		: "";

	return (<>
		{show_input}
		{content}
	</>);
}

function ListItems(entities: Set<String>) {
	return [...entities].map((ent, index) => 
		<div className={CssSelect(CssPreset.Row)} key={"ui_sr_listitems_" + index}>
			<div className={CssSelect(CssPreset.Column)}>
				{ent}
			</div>
		</div>);
}

function PrepareItems(entities: Array<ApiRenameResponse>) {
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

function InputField(insertBuffer: string, mode: Modal){
	let highlight_insert = mode == Modal.Insert
		? CssSelect(CssPreset.InputFieldActive)
		: CssSelect(CssPreset.InputFieldInactive);

	let inputPreview = insertBuffer != ""
		? insertBuffer
		: "…";

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

function ApiPreview(entitySelectionBuffer: Set<string>, insertBuffer: string): Array<ApiRenameResponse> {
	// TODO: API call
	return [...entitySelectionBuffer].map(x => ({
		Original: x,
		Target: x // TODO: placeholder
	}));
}

type ApiRenameResponse = {
	Original: string,
	Target: string;
}

export default BulkRenameUi;

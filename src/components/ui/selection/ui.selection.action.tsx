import { useAppState } from "@app/app.context.store";
import { UIComponent, Workspace } from "@context/context.types";
import { NavigationProvider } from "@nav/nav.provider";
import { NavWrapper } from "@nav/nav.element.wrapper";
import { NavWrapperItemType } from "@nav/nav.types";
import { useEffect, useState } from "react";

import modStyles from "./ui.selection.module.css"
import compStyles from "@components/common.module.css"
import BulkRenameUi from "./ui.selection.rename";
import { CssPreset, CssSelect } from "@/components/utility.styling";

function SelectionAction() {
	const {
		workspaceActive,
		entitySelectionBuffer,
		currentDir,
	} = useAppState();

	const [render, setRender] = useState<boolean>();

	let css_display = render ? 'flex' : 'none';
	let css_workingPath = [compStyles.FlexRow, compStyles.ContainerMargin];

	// hide or show image grid workspace
	useEffect(() => {
		setRender(workspaceActive === Workspace.SelectionAction);
	}, [workspaceActive]);

	return(
		<div
			style={{ display: css_display }}
			className={CssSelect(CssPreset.Container)}
		>
			<div className={css_workingPath.join(" ")}>
				{currentDir}
			</div>

			<div className={CssSelect(CssPreset.Row)}>
				<div className={CssSelect(CssPreset.Column)}>
				</div>
				<div className={CssSelect(CssPreset.Column)}>
					<NavigationProvider
						tabOrder={12}
						component={UIComponent.selectAction}
						workspace={Workspace.SelectionAction}
						initActive={false}
					>
						<NavWrapper
							id="m_selact_rename"
							itemType={NavWrapperItemType.Menu}
							data="m_selact_rename"
						>
							Rename
						</NavWrapper>
						<NavWrapper
							id="m_selact_c2c"
							itemType={NavWrapperItemType.Menu}
							data="m_selact_c2c"
						>
							Paths to clipboard
						</NavWrapper>
						<NavWrapper
							id="m_selact_c2c_py"
							itemType={NavWrapperItemType.Menu}
							data="m_selact_c2c_py"
						>
							Paths to clipboard (Python list)
						</NavWrapper>
					</NavigationProvider>
				</div>
			</div>
		</div>
	);

}

export default SelectionAction;

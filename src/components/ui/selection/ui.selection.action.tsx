import { useAppState } from "@app/app.context.store";
import { UIComponent, Workspace } from "@context/context.types";
import { NavigationProvider } from "@nav/nav.provider";
import { NavWrapper } from "@nav/nav.element.wrapper";
import { NavWrapperItemType } from "@nav/nav.types";
import { useEffect, useState } from "react";

import modStyles from "./ui.selection.module.css"
import compStyles from "@components/common.module.css"

function SelectionAction() {
	const {
		workspaceActive,
		entitySelectionBuffer,
		currentDir,
	} = useAppState();

	const [render, setRender] = useState<boolean>();

	// hide or show image grid workspace
	useEffect(() => {
		setRender(workspaceActive === Workspace.SelectionAction);
	}, [workspaceActive]);

	return(
		<div
			style={{
				display: render ? 'flex' : 'none',
			}}
			className={`${compStyles.Container} ${compStyles.Bg900}`}
		>
			<div className={`${compStyles.FlexRow} ${compStyles.ContainerMargin}`}>
				{currentDir}
			</div>

			<div className={`${compStyles.FlexRow} ${compStyles.Gap} ${compStyles.ContainerMargin}`}>
				<div className={`${compStyles.Bg700} ${compStyles.FlexColumn}`}>
					{entitySelectionBuffer ? (
						[...entitySelectionBuffer].map((ent, index) => (
							<li key={index}>{ent}</li>
						))
					) : (
							<p>No items selected</p>
						)}
				</div>
				<div className={`${compStyles.Bg700} ${compStyles.FlexColumn}`}>
					<NavigationProvider
						tabOrder={12}
						component={UIComponent.selectAction}
						workspace={Workspace.SelectionAction}
						initActive={false}
					>
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

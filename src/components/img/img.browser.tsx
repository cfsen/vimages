import { NavigationProvider } from "@context/nav/nav.provider";
import { UIComponent } from "@context/context.types";

import VimageGrid from "./img.grid";
import styles from "./img.module.css";

function VimageBrowser() {
	return (
			<div className={styles.colContainer}>
				<div className={styles.col}>
					<div className={styles.row}>
						<NavigationProvider 
							key="np_imgGrid" 
							component={UIComponent.imgGrid} 
							initActive={false} 
							tabOrder={1}
						>
							<VimageGrid />
						</NavigationProvider>
					</div>
				</div>
			</div>
	);
}

export default VimageBrowser;

import { useEffect, useState } from "react"; 
import { useGlobalCtx } from "./../context/vimagesCtx";

function Navbar() {
	const { currentDir } = useGlobalCtx();

	const [navPath, setNavPath] = useState<string>();

	useEffect(() => {
		if(navPath !== currentDir.current) {
			setNavPath(currentDir.current);
			console.log("update nav path");
		}
	});

	return(
		<div>
			{ navPath }
		</div>
	);
}

export default Navbar;

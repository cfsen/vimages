import { useAppState } from "@context/AppContextStore";

function Navbar() {
	const { currentDir } = useAppState();

	return(
		<div>
			{ currentDir }
		</div>
	);
}

export default Navbar;

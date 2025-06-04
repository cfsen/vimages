import { useGlobalStore } from "../context/store";

function Navbar() {
	const { currentDir } = useGlobalStore();

	return(
		<div>
			{ currentDir }
		</div>
	);
}

export default Navbar;

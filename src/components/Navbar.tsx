import { useCommand } from "./../context/vimagesCtx";

function Navbar() {
	const { pwd } = useCommand();

	return(
		<div>
			{pwd}
		</div>
	);
}

export default Navbar;

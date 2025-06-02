type NavBarProps = {
	pwd: string;
};

function Navbar(props: NavBarProps) {
	return(
		<div>
			{props.pwd}
		</div>
	);
}

export default Navbar;

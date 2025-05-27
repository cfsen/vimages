import { NavigableItem } from "./../context/NavigableItem";
import { useRustApi, RustApiAction } from "./RustApiBridge";

function FileSystemBrowser(){
	const { response, loading, error } = useRustApi({ action: RustApiAction.GetDirectories, path: "." });

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<ul>
			{response.map((entry, index) => (
				<NavigableItem id={"fileBrowserItem" + index}>
				<li key={index}>{entry}</li>
				</NavigableItem>
			))}
		</ul>
	);
}

export default FileSystemBrowser;

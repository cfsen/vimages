import { NavigableItem, NavigableItemType } from "./../context/NavigableItem";
import { useRustApi, RustApiAction } from "./RustApiBridge";

type FileSystemBrowserProps = {
	pwd: string
};

function FileSystemBrowser(props: FileSystemBrowserProps){
	const { response, loading, error } = useRustApi({ action: RustApiAction.GetDirectories, path: props.pwd });

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<ul>
			{response.map((entry, index) => (
				<NavigableItem 
					key={"fileBrowserItem" + index} 
					id={"fileBrowserItem" + index} 
					itemType={NavigableItemType.FileBrowser}
					data={entry}
				>
					<li key={"fbrowseridx" + index}>{entry}</li>
				</NavigableItem>
			))}
		</ul>
	);
}

export default FileSystemBrowser;

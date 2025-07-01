import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from "@tauri-apps/api/core";
import { RustApiAction } from "@filesystem/RustApiBridge";
import { EntityDirectory } from "@context/ContextTypes";

import { Command, CommandSequence } from "@/keyboard/Command";
import { useAppState } from "@context/AppContextStore";
import { Modal } from "@/keyboard/KeyboardTypes";

const paramCommands = [":set", ":e"];

export function CommandModeHandler(input: string, sequence: CommandSequence){
	const {
		imageGridScale,
		setImageGridScale,

		setMode,
		setShowHelp,
		setInputBufferCommand,
		setCurrentDir,
		setCurrentDirHash,
		setImages,
		setDirectories,
		setFullscreenImage,
	} = useAppState.getState();

	// update buffer
	setInputBufferCommand(input);

	if(sequence.cmd !== Command.Return) return;

	// check for parameterless commands
	switch(input){
		case ":q":
			// TODO: save any pending thumbnail tasks
			// TODO: confirm close on unsaved changes
			getCurrentWindow().close();
			break;
		case ":help":
			setShowHelp(true);
			break;
	};

	let split = SplitCommandParam(input);
	if(split !== null) {
		console.log("issplitCommand: " + split.cmd, split.param);
		switch(split.cmd){
			case ":e":
				// TODO: path hints while typing
				// TODO: maintain a hashmap of which directory was traversed to maintain cursor selection
				
				// exit fullscreen on directory traversal
				setFullscreenImage(false);

				// TODO: windows: parse d: -> D:\ (handle in rust)
				// TODO: reused code, see: TODO_REUSE_PATH
				invoke(RustApiAction.GetDir, {
					path: useAppState.getState().currentDir,
					relPath: split.param.join(" ") 
				})
					.then(response => {
						const res = response as EntityDirectory;
						setCurrentDir(res.path);
						setCurrentDirHash(res.path_hash);
						setImages(res.images);
						setDirectories(res.sub_dirs);
					})
					// TODO: error handling on invalid paths
					.catch(console.error);
				break;
			case ":set":
				// TODO: further implementation blocked by config file/unified command type TODO_CONFIG_FILE
				console.log(split);
				if(split.param.length === 0) {
					console.log("no keyword");
					break;
				}
				
				if(split.param[0] !== "imgscale") {
					console.log("incorrect keyword");
					break;
				}

				// output value 
				if(split.param.length === 1) {
					console.log("No value for param, output current value: " + imageGridScale);
					break;
				}

				// set value
				console.log(`Setting value: ${input}`);
				setImageGridScale(Number(split.param[1]));
				break;
		};
	}

	// reset to normal, clear buffer
	setMode(Modal.Normal);
	setInputBufferCommand(":");
}

function SplitCommandParam(input: string): {cmd: string, param: string[]} | null {
	for(let i = 0; i < paramCommands.length; i++){
		if(input.length <= paramCommands[i].length) {
			continue
		}

		if(input.slice(0, paramCommands[i].length) === paramCommands[i]) {
			let split = {
				cmd: input.slice(0, paramCommands[i].length),
				param: input.slice(paramCommands[i].length+1, input.length).split(" "),
			};
			return split
		}
	}
	return null
}

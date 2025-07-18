import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from "@tauri-apps/api/core";

import { useAppState } from "@app/app.context.store";
import { getDirectory, raiseError, saveConfig } from "@app/app.context.actions"

import { RustApiAction } from "@context/context.types";

import { Command } from "@key/key.command";
import { Modal } from "@key/key.types";
import { resultModeCommand } from '@key/key.module.handler.cmd';

const paramCommands = [":set", ":e"];

export function CommandModeHandler(resultCommand: resultModeCommand){
	const {
		imageGridScale,
		setImageGridScale,

		setMode,
		setShowHelp,
		setInputBufferCommand,
		setInputBufferCursor,
		setFullscreenImage,
	} = useAppState.getState();

	// update buffer
	setInputBufferCommand(resultCommand.sequence);
	setInputBufferCursor(resultCommand.cursor);

	if(resultCommand.cmd !== Command.Return) return;

	// check for parameterless commands
	switch(resultCommand.sequence){
		case ":q":
			// TODO: save any pending thumbnail tasks
			// TODO: confirm close on unsaved changes
			getCurrentWindow().close();
			break;
		case ":wq":
			saveConfig(useAppState);
			getCurrentWindow().close();
			break;
		case ":help":
			setShowHelp(true);
			break;
		case ":sc":
			saveConfig(useAppState);
			break;
		case ":queue":
			invoke(RustApiAction.GetQueueSize, {})
				.then(res => {
					raiseError(useAppState, "Images in queue: " + res);
				});
			break;
	};

	let split = SplitCommandParam(resultCommand.sequence);
	if(split !== null) {
		console.log("issplitCommand: " + split.cmd, split.param);
		switch(split.cmd){
			case ":e":
				// TODO: windows: parse d: -> D:\ (handle in rust)
				// TODO: path hints while typing
				
				// exit fullscreen on directory traversal
				setFullscreenImage(false);
				getDirectory(useAppState, split.param.join(" "));
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
				console.log(`Setting value: ${resultCommand.sequence}`);
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

import { getCurrentWindow } from '@tauri-apps/api/window';

import { useAppState } from "@app/app.context.store";
import { addInfoMessage, getDirectory, raiseError, saveConfig } from "@app/app.context.actions"

import { Command } from "@key/key.command";
import { Modal } from "@key/key.types";
import { resultModeCommand } from '@key/key.module.handler.cmd';

import {
	ConsoleCmd, getParser, ParamCommand, ParamCommandBuilder, ParamType, parseInput
} from "@app/handler/mode.command.input.builder";
import { invoke } from '@tauri-apps/api/core';
import { JournalInfo, RustApiAction } from '@/context/context.types';

function b(call: string) { return new ParamCommandBuilder(call) };
const cmdParam: ParamCommand[] = [
	b(":q").param(ParamType.None, ConsoleCmd.Quit).build(),
	b(":wq").param(ParamType.None, ConsoleCmd.SaveQuit).build(),
	b(":sc").param(ParamType.None, ConsoleCmd.WriteConfig).build(),

	b(":help")
	.param(ParamType.None, ConsoleCmd.Help)
	.param(ParamType.Keyword, ConsoleCmd.KeywordHelp)
	.build(),

	b(":set")
	.param(ParamType.Number, ConsoleCmd.SetImgScale, "imgscale")
	.param(ParamType.Number, ConsoleCmd.SetErrorDisplayLv, "errorlv")
	.build(),

	b(":get")
	.param(ParamType.Keyword, ConsoleCmd.GetVerison, "version")
	.param(ParamType.Keyword, ConsoleCmd.GetQueueSize, "queue")
	.build(),

	b(":cache")
	.param(ParamType.Keyword, ConsoleCmd.GetCacheInfo, "info")
	.param(ParamType.Keyword, ConsoleCmd.RunCacheCleanup, "clean")
	.build(),

	b(":cd").param(ParamType.Action, ConsoleCmd.ChangeDir).build(),
];

const registeredCommands = new Map<string,ParamCommand>();
for(const cmd of cmdParam){
	registeredCommands.set(cmd.call, cmd);
}

export function CommandModeHandler(resultCommand: resultModeCommand){
	const {
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

	const parser = getParser(resultCommand.sequence, registeredCommands);
	if(parser === undefined) return;

	const results = parseInput(resultCommand.sequence, parser);

	for(const res of results) {
		switch(res.action) {
			case ConsoleCmd.Quit:
				// TODO: save any pending thumbnail tasks
				// TODO: confirm close on unsaved changes
				getCurrentWindow().close();
				break;
			case ConsoleCmd.SaveQuit:
				saveConfig(useAppState);
				getCurrentWindow().close();
				break;

			case ConsoleCmd.Help:
				// TODO: handle additional keyword for specific lookup
				setShowHelp(true);
				break;

			case ConsoleCmd.WriteConfig:
				saveConfig(useAppState);
				addInfoMessage(useAppState, "Config saved!");
				break;

			case ConsoleCmd.ChangeDir:
				// TODO: path hints while typing
				setFullscreenImage(false);
				getDirectory(useAppState, res.payload as string);
				break;
			case ConsoleCmd.SetImgScale:
				setImageGridScale(Number(res.payload));
				addInfoMessage(useAppState, "Thumbnail scale set: " + res.payload);
				break;
			case ConsoleCmd.SetErrorDisplayLv:
				console.warn("errorlv not implemented");
				break;

			case ConsoleCmd.GetVerison:
				addInfoMessage(useAppState, "vimages v"+useAppState.getState().vimages_version);
				break;
			case ConsoleCmd.GetQueueSize:
				invoke(RustApiAction.GetQueueSize)
					.then((api) => { addInfoMessage(useAppState, "Images in queue: " + api) });
				break;
			case ConsoleCmd.GetCacheInfo:
				invoke(RustApiAction.GetCacheInfo)
					.then((api) => { 
						// TODO: helper for setting multiple lines of output at once.
						const jinfo = api as JournalInfo;
						addInfoMessage(useAppState, "CACHE INFO:");
						addInfoMessage(useAppState, "entries_hashes: " + jinfo.entries_hashes);
						addInfoMessage(useAppState, "entries_metadata: " + jinfo.entries_metadata);
					});
				break;

			case ConsoleCmd.RunCacheCleanup:
				invoke(RustApiAction.RunCacheCleanup)
					.then((api) => {
						let processStarted = api as boolean;
						addInfoMessage(useAppState, api ? "Cache cleanup started." : "Failed to start cache cleanup.");
					});
				break;

			default:
				console.warn("Unhandled command in mode.command.ts:");
				console.warn(ConsoleCmd[res.action] + " -> " + res.word + " -> " + res.payload);
				break;
		};
	}

	// reset to normal, clear buffer
	setMode(Modal.Normal);
	setInputBufferCommand(":");
}

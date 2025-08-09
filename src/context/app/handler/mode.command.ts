import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';

import { useAppState } from "@app/app.context.store";
import { addInfoMessage, addInfoMessageArray, getDirectory, raiseError, saveConfig, setWorkspace } from "@app/app.context.actions"

import { Command } from "@key/key.command";
import { Modal } from "@key/key.types";
import { resultModeCommand } from '@key/key.module.handler.cmd';
import {
	ConsoleCmd, getParser, ParamCommand, ParamCommandBuilder, ParamType, parseInput
} from "@app/handler/mode.command.input.builder";

import { JournalInfo, RustApiAction, Workspace } from '@context/context.types';

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
	.param(ParamType.Keyword, ConsoleCmd.SetDirBrowserParentPane, "parentpane")
	.param(ParamType.Keyword, ConsoleCmd.SetTitlebarRender, "titlebar")
	.param(ParamType.Keyword, ConsoleCmd.SetInfoMsgWindowPersists, "infowindow")
	.build(),

	b(":get")
	.param(ParamType.Keyword, ConsoleCmd.GetVerison, "version")
	.param(ParamType.Keyword, ConsoleCmd.GetQueueSize, "queue")
	.build(),

	b(":fullscreen")
	.param(ParamType.Number, ConsoleCmd.FullscreenSetInvertCursor, "invertCursor")
	.param(ParamType.Number, ConsoleCmd.FullscreenSetMoveStep, "moveStep")
	.param(ParamType.Number, ConsoleCmd.FullscreenSetRotateStep, "rotateStep")
	.param(ParamType.Number, ConsoleCmd.FullscreenSetZoomStep, "zoomStep")
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
		setFullscreenInvertCursor, setFullscreenMoveStep, setFullscreenRotateStep, setFullscreenZoomStep,
	} = useAppState.getState();

	// update buffer
	setInputBufferCommand(resultCommand.sequence);
	setInputBufferCursor(resultCommand.cursor);

	if(resultCommand.cmd !== Command.Return) return;

	const parser = getParser(resultCommand.sequence, registeredCommands);
	if(parser === undefined) {
		raiseError(useAppState, `Command not found: '${resultCommand.sequence}'`);
		return
	};

	const results = parseInput(resultCommand.sequence, parser);

	if(results.length === 0) {
		raiseError(useAppState, `No handler found: '${resultCommand.sequence}'`);
	}

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
				setWorkspace(useAppState, Workspace.DirectoryBrowser);
				getDirectory(useAppState, res.payload as string);
				break;
			case ConsoleCmd.SetImgScale:
				setImageGridScale(Number(res.payload));
				addInfoMessage(useAppState, "Thumbnail scale set: " + res.payload);
				break;
			case ConsoleCmd.SetErrorDisplayLv:
				// TODO:
				console.warn("errorlv not implemented");
				break;
			case ConsoleCmd.SetTitlebarRender:
				let titlebarRender = useAppState.getState().titlebarRender;
				useAppState.getState().setTitlebarRender(!titlebarRender);
				addInfoMessage(useAppState, "App: " + (titlebarRender ? "hiding" : "showing") + " titlebar.");
				break;
			case ConsoleCmd.SetInfoMsgWindowPersists:
				let infoWindowPersists = useAppState.getState().keepOpenInfo;
				useAppState.getState().setKeepOpenInfo(!infoWindowPersists);
				addInfoMessage(useAppState,
					"App: " + (infoWindowPersists? "hiding this window on next input." : "keeping this window open"));
				break;
			case ConsoleCmd.SetDirBrowserParentPane:
				let val = !useAppState.getState().dirBrowserRenderParentDir;
				useAppState.getState().setDirBrowserRenderParentDir(val);
				addInfoMessage(useAppState, "Browser: " + (val ? "enabling" : "disabling") + " parent pane.");
				break;

			case ConsoleCmd.GetVerison:
				addInfoMessage(useAppState, "vimages v"+useAppState.getState().vimages_version);
				break;
			case ConsoleCmd.GetQueueSize:
				invoke(RustApiAction.GetQueueSize)
					.then((api) => { addInfoMessage(useAppState, "Images in queue: " + api) });
				break;

			//
			// Cache
			//
			case ConsoleCmd.GetCacheInfo:
				invoke(RustApiAction.GetCacheInfo)
					.then((api) => { 
						const jinfo = api as JournalInfo;
						addInfoMessageArray(useAppState, [
							"CACHE INFO:",
							"entries_hashes: " + jinfo.entries_hashes,
							"entries_metadata: " + jinfo.entries_metadata
						]);
					});
				break;
			case ConsoleCmd.RunCacheCleanup:
				invoke(RustApiAction.RunCacheCleanup)
					.then((api) => {
						let processStarted = api as boolean;
						addInfoMessage(useAppState, api ? "Cache cleanup started." : "Failed to start cache cleanup.");
					});
				break;

			//
			// Fullscreen
			//
			case ConsoleCmd.FullscreenSetInvertCursor:
				setFullscreenInvertCursor(res.payload as number);
				addInfoMessage(useAppState, `Setting full screen invert cursor to: ${res.payload} (default is -1).`);
				break;
			case ConsoleCmd.FullscreenSetMoveStep:
				setFullscreenMoveStep(res.payload as number);
				addInfoMessage(useAppState, `Setting full screen move step to: ${res.payload}`);
				break;
			case ConsoleCmd.FullscreenSetRotateStep:
				setFullscreenRotateStep(res.payload as number);
				addInfoMessage(useAppState, `Setting full screen rotate step to: ${res.payload}`);
				break;
			case ConsoleCmd.FullscreenSetZoomStep:
				setFullscreenZoomStep(res.payload as number);
				addInfoMessage(useAppState, `Setting full screen zoom step to: ${res.payload}`);
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

import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';

import { useAppState } from "@app/app.context.store";
import { addInfoMessage, addInfoMessageArray, getDirectory, raiseError, saveConfig, setWorkspace } from "@app/app.context.actions"

import { Command } from "@key/key.command";
import { Modal } from "@key/key.types";
import { resultModeCommand } from '@key/key.module.handler.cmd';
import { overwriteBufferCommandMode } from '@key/key.module';
import {
	ConsoleCmd, getParser, ParamCommand, ParamCommandBuilder, ParamType, parseInput
} from "@app/handler/mode.command.input.builder";

import { JournalInfo, RustApiAction, Workspace } from '@context/context.types';
import SearchOpenDirectoryHandler from './mode.search';

function b(call: string) { return new ParamCommandBuilder(call) };
const cmdParam: ParamCommand[] = [
	b(":q").param(ParamType.None, ConsoleCmd.Quit).build(),
	b(":wq").param(ParamType.None, ConsoleCmd.SaveQuit).build(),
	b(":sc").param(ParamType.None, ConsoleCmd.WriteConfig).build(),

	b(":help")
	.param(ParamType.Action, ConsoleCmd.Help)
	.build(),

	b(":set")
	.param(ParamType.Number, ConsoleCmd.SetImgScale, "imgscale")
	.param(ParamType.Number, ConsoleCmd.SetErrorDisplayLv, "errorlv")
	.param(ParamType.Keyword, ConsoleCmd.SetTitlebarRender, "titlebar")
	.param(ParamType.Keyword, ConsoleCmd.SetInfoMsgWindowPersists, "infowindow")
	.param(ParamType.Number, ConsoleCmd.SetScrollTimeout, "scrollDelay")
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
	.param(ParamType.Keyword, ConsoleCmd.FullscreenSetRemapCursor, "remapCursor")
	.build(),

	b(":cache")
	.param(ParamType.Keyword, ConsoleCmd.GetCacheInfo, "info")
	.param(ParamType.Keyword, ConsoleCmd.RunCacheCleanup, "clean")
	.build(),

	b(":cd").param(ParamType.Action, ConsoleCmd.ChangeDir).build(),

	b(":queue")
	.param(ParamType.Keyword, ConsoleCmd.QueueBlacklist, "blacklist")
	.param(ParamType.Keyword, ConsoleCmd.QueueBlacklist, "bl")
	.param(ParamType.Keyword, ConsoleCmd.QueueStatus, "status")
	.build(),
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
		modeCmdHistory, modeCmdAddHistory,
	} = useAppState.getState();

	if(isHistoryRequest(resultCommand)){
		let sequence = handleHistoryRequest(resultCommand, modeCmdHistory);
		if(sequence !== null) {
			let buffer: resultModeCommand = {
				sequence,
				cursor: sequence.length,
				cmd: Command.Ignore,
			};
			// update visual buffer
			setInputBufferCommand(sequence);
			setInputBufferCursor(sequence.length);

			// update command buffer
			overwriteBufferCommandMode(buffer);
		}
		return;
	}

	// update buffer
	setInputBufferCommand(resultCommand.sequence);
	setInputBufferCursor(resultCommand.cursor);

	// bypass if searching
	if(resultCommand.sequence.slice(0, 1) === "/"){
		SearchOpenDirectoryHandler(resultCommand);
		return;
	}

	if(resultCommand.cmd !== Command.Return) return;

	// capture command for history
	modeCmdAddHistory(resultCommand.sequence);

	const parser = getParser(resultCommand.sequence, registeredCommands);
	if(parser === undefined) {
		raiseError(useAppState, `Command not found: '${resultCommand.sequence}'`);
		return;
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
				// show top level help menu
				if(res.payload === undefined) {
					setShowHelp(true);
				}
				break;

			case ConsoleCmd.WriteConfig:
				saveConfig(useAppState);
				addInfoMessage(useAppState, "Config saved!");
				break;

			case ConsoleCmd.ChangeDir:
				if(res.payload === undefined) {
					raiseError(useAppState, "Enter a path to change directories to.");
					break;
				}

				// TODO: FEAT: FEAT_PATH_HINTS
				setFullscreenImage(false);
				setWorkspace(useAppState, Workspace.DirectoryBrowser);
				getDirectory(useAppState, res.payload as string);
				break;
			case ConsoleCmd.SetImgScale:
				setImageGridScale(Number(res.payload));
				addInfoMessage(useAppState, "Thumbnail scale set: " + res.payload);
				break;
			case ConsoleCmd.SetErrorDisplayLv:
				// TODO: FEAT: FEAT_ERROR_LEVELS error levels
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
			case ConsoleCmd.SetScrollTimeout:
				useAppState.getState().setWorkaroundScrollToDelay(res.payload as number);
				addInfoMessage(useAppState, `Setting scroll delay to: ${res.payload}ms`)
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
						addInfoMessage(useAppState, processStarted ? "Cache cleanup started." : "Failed to start cache cleanup.");
					});
				break;

			//
			// Queue
			//
			case ConsoleCmd.QueueStatus:
				invoke(RustApiAction.QueueStatus);
				break;
			case ConsoleCmd.QueueBlacklist:
				invoke(RustApiAction.QueueBlacklist);
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
			case ConsoleCmd.FullscreenSetRemapCursor:
				let fsRemapCursor = useAppState.getState().fullscreenRemapCursor;
				useAppState.getState().setFullscreenRemapCursor(!fsRemapCursor);
				addInfoMessage(useAppState, "App: " + (!fsRemapCursor ? "using" : "not using") + " back/next cursor behavior for fullscreen.");
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

function isHistoryRequest(result: resultModeCommand): boolean {
	return (result.cmd === Command.OptionUp || result.cmd === Command.OptionDown)
}

let historyIndex: number | null = null;
function handleHistoryRequest(result: resultModeCommand, history: string[]): string | null {
	if(history.length <= 0)
		return null;
	
	if(historyIndex === null)
		historyIndex = history.length-1;

	if(historyIndex > 0)
		historyIndex -= 1;
	else
		historyIndex = history.length-1;

	return history[historyIndex];
}

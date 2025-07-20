import { getCurrentWindow } from '@tauri-apps/api/window';

import { useAppState } from "@app/app.context.store";
import { getDirectory, saveConfig } from "@app/app.context.actions"

import { Command } from "@key/key.command";
import { Modal } from "@key/key.types";
import { resultModeCommand } from '@key/key.module.handler.cmd';

import {
	ConsoleCmd, getParser, ParamCommand, ParamCommandBuilder, ParamType, parseInput
} from "@app/handler/mode.command.input.builder";

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
	.param(ParamType.Keyword, ConsoleCmd.GetCacheInfo, "cache")
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
				break;
			case ConsoleCmd.ChangeDir:
				// TODO: windows: parse d: -> D:\ (handle in rust)
				// TODO: path hints while typing
				setFullscreenImage(false);
				getDirectory(useAppState, res.payload as string);
				break;
			case ConsoleCmd.SetImgScale:
				setImageGridScale(Number(res.payload));
				break;
			case ConsoleCmd.GetVerison:
				console.log("getversion");
				break;
			case ConsoleCmd.GetCacheInfo:
				console.log("getcacheinfo");
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

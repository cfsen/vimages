import { staticCommands } from './key.input.parsers';
import { Command, populateCommandMap } from './key.command';
import { Modal, modeNormal, modeState, modeInsert, modeVisual, modeCommand } from "./key.types";
import { handleModeNormal, resultModeNormal, defaultResultModeNormal } from "./key.module.handler.normal";
import { handleModeCommand, resultModeCommand, defaultResultModeCommand } from "./key.module.handler.cmd";

const commandMap = populateCommandMap();
const statics = [Command.Escape, Command.Return, Command.Console, Command.Leader, Command.Tab];

let commandBuffer: resultModeCommand = defaultResultModeCommand();
let normalBuffer: resultModeNormal = defaultResultModeNormal();
let visualSequence = "";
let insertSequence = "";

export function modalKeyboard(
	event: KeyboardEvent,
	normalHandler: modeNormal,
	visualHandler: modeVisual,
	insertHandler: modeInsert,
	cmdHandler: modeCommand,
	{callback: setModeState, Mode: mode}: modeState
){
	let checkStaticCmds = staticCommands(event);
	if(checkStaticCmds === Command.Ignore) return;
	if(checkStaticCmds === Command.Escape && mode !== Modal.Normal) {
		setModeState(Modal.Normal);	

		// clear buffers
		visualSequence = "";
		insertSequence = "";
		normalBuffer = defaultResultModeNormal();
		commandBuffer = defaultResultModeCommand();

		// reset external stores
		cmdHandler.callback?.(commandBuffer);
		return;
	}

	// TODO: visual, insert, as pure functions
	switch(mode){
		case Modal.Visual:
			handleModeVisual(visualHandler, event, visualSequence);
			break;
		case Modal.Insert:
			handleModeInsert(insertHandler, event, insertSequence);
			break;
		case Modal.Command:
			commandBuffer = handleModeCommand(event, commandBuffer);

			cmdHandler.callback?.(commandBuffer);

			if(commandBuffer.cmd === Command.Return) {
				commandBuffer = defaultResultModeCommand();
			}
			break;
		default:
			normalBuffer = handleModeNormal(event, normalBuffer, statics, commandMap);

			setModeState(normalBuffer.mode);

			if(normalBuffer.cmd !== Command.PartialInput) {
				// normalHandler.callback?.(normalBuffer.cmdSequence);
				normalHandler.callback?.(normalBuffer);
				normalBuffer = defaultResultModeNormal();
			}
			break;
	};
}

// TODO: 
function handleModeVisual(
	handler: modeVisual,
	event: KeyboardEvent,
	sequence: string,
) {
	console.log("handleModeVisual", handler, event, sequence);
}

// TODO: 
function handleModeInsert(
	handler: modeInsert,
	event: KeyboardEvent,
	sequence: string,
) {
	console.log("handleModeInsert", handler, event, sequence);
}

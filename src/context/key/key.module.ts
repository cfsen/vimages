import { isSpecialKey } from './key.input.enum';
import { Command, convertKeyToCommandMap, getDefaultKeyMap } from './key.command';
import { staticSpecialKeyBinds } from './key.input.parsers';
import { Modal, modeNormal, modeState, modeInsert, modeVisual, modeCommand, Keybinds } from "./key.types";

import { handleModeNormal, resultModeNormal, defaultResultModeNormal } from "./key.module.handler.normal";
import { handleModeCommand, resultModeCommand, defaultResultModeCommand, defaultResultModeInsert } from "./key.module.handler.cmd";

let KEYBINDS = getDefaultKeybinds();

let commandBuffer: resultModeCommand = defaultResultModeCommand();
let normalBuffer: resultModeNormal = defaultResultModeNormal();

let visualBuffer: resultModeNormal = defaultResultModeNormal();
let insertBuffer: resultModeCommand = defaultResultModeInsert();

export function modalKeyboard(
	event: KeyboardEvent,
	normalHandler: modeNormal,
	visualHandler: modeVisual,
	insertHandler: modeInsert,
	cmdHandler: modeCommand,
	{callback: setModeState, Mode: mode}: modeState
){
	if(isSpecialKey(event.key) && staticSpecialKeyBinds(event.key) === Command.Ignore)
		return;
	if(isSpecialKey(event.key) && staticSpecialKeyBinds(event.key) === Command.Escape && mode !== Modal.Normal) {
		setModeState(Modal.Normal);	

		// clear buffers
		visualBuffer = defaultResultModeNormal();
		insertBuffer = defaultResultModeInsert();
		normalBuffer = defaultResultModeNormal();
		commandBuffer = defaultResultModeCommand();

		// reset external stores
		cmdHandler.callback?.(commandBuffer);
		insertHandler.callback?.(insertBuffer);
		visualBuffer.cmd = Command.ModeVisualExit;
		visualHandler.callback?.(visualBuffer);
		return;
	}

	switch(mode){
		case Modal.Visual:
			visualBuffer = handleModeNormal(event, visualBuffer, KEYBINDS.keyMap);

			// TODO: hooks for specific behavior on visual->(leader, command) mode change
			// for triggering behavior when entering leader or command mode from visual mode
			if(visualBuffer.mode === Modal.Leader){
				console.log("Visual->Leader");
				console.warn("Leader not implemented for visual mode");
			}
			if(visualBuffer.mode === Modal.Command){
				console.log("Visual->Command");
				console.warn("Command mode change not implemented for visual mode");
			}

			visualBuffer.mode = Modal.Visual;
			
			if(visualBuffer.cmd !== Command.PartialInput) {
				visualHandler.callback?.(visualBuffer);
				visualBuffer = defaultResultModeNormal();
			}

			break;
		case Modal.Insert:
			insertBuffer = handleModeCommand(event, insertBuffer);

			insertHandler.callback?.(insertBuffer);

			if(insertBuffer.cmd === Command.Return) {
				insertBuffer = defaultResultModeInsert();
				insertBuffer.sequence = "";
			}
			break;
		case Modal.Command:
			commandBuffer = handleModeCommand(event, commandBuffer);

			cmdHandler.callback?.(commandBuffer);

			if(commandBuffer.cmd === Command.Return) {
				commandBuffer = defaultResultModeCommand();
			}
			break;
		default:
			normalBuffer = handleModeNormal(event, normalBuffer, KEYBINDS.keyMap);

			setModeState(normalBuffer.mode);

			if(normalBuffer.cmd !== Command.PartialInput) {
				normalHandler.callback?.(normalBuffer);
				normalBuffer = defaultResultModeNormal();
			}
			break;
	};
}

//
// Keybindings
//

export function getDefaultKeybinds(): Keybinds {
	const keyMap = getDefaultKeyMap();
	return {
		commandMap: convertKeyToCommandMap(keyMap),
		keyMap
	};
}

export function getCurrentKeybinds(): Keybinds {
	return KEYBINDS;
}

// consumer should getDefaultKeybinds if this fails
export function setKeybinds(keyMap: Map<string, Command>): boolean {
	// check for duplicate keybindings
	let seenKeys = new Set();
	for(let [key, _] of keyMap) {
		switch(seenKeys.has(key)){
			case true:
				return false;
			default:
				seenKeys.add(key);
		}
	}

	const commandMap = convertKeyToCommandMap(keyMap);
	KEYBINDS = {
		commandMap,
		keyMap,
	}

	return true;
}

export function parseCommand(cmdStr: string): Command | null {
	if(cmdStr in Command) return Command[cmdStr as keyof typeof Command];
	return null;
}

//
// Overrides
//

/**
 * Overwrites command buffer state.
 * */
export function overwriteBufferCommandMode(newValue: resultModeCommand){
	commandBuffer = newValue;
}


// TODO: FEAT: FEAT_MODE_INSERT
function handleModeInsert(
	handler: modeInsert,
	event: KeyboardEvent,
	sequence: string,
) {
	console.log("handleModeInsert", handler, event, sequence);
}

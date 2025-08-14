import { possibleCommands, assembleCommand, possibleLeaderCommands, staticSpecialKeyBinds } from './key.input.parsers';
import { Command, CommandSequence } from './key.command';
import { Modal } from "./key.types";
import { isSpecialKey, SpecialKey } from './key.input.enum';

export type resultModeNormal = {
	sequence: string,
	cmd: Command,
	cmdSequence: CommandSequence,
	mode: Modal,
};
export function defaultResultModeNormal(): resultModeNormal {
	return {
		sequence: "",
		cmd: Command.None,
		cmdSequence: { modInt: 0, cmd: Command.None},
		mode: Modal.Normal,
	}
};
export function handleModeNormal(
	event: KeyboardEvent,
	normalBuffer: resultModeNormal,
	commandMap: Map<string, Command>
): resultModeNormal {
	if(event.ctrlKey && isSpecialKey(event.key))
		return handleModeNormalSpecialCtrl(event.key as SpecialKey);
	if(isSpecialKey(event.key))
		return handleModeNormalSpecial(event.key as SpecialKey);
	if(event.ctrlKey)
		return handleModeNormalCtrl(event.key, normalBuffer);

	let sequence = normalBuffer.sequence;
	let mode = normalBuffer.mode;

	// Assemble new input into sequence
	let newSeq = sequence + event.key;

	// Check if there are any more possible commands
	let possibleCmds;
	if(mode === Modal.Leader) possibleCmds = possibleLeaderCommands(newSeq, commandMap);
	else possibleCmds = possibleCommands(newSeq, commandMap);

	if(possibleCmds > 1)
		return { ...defaultResultModeNormal(), sequence: newSeq, cmd: Command.PartialInput };
	if(possibleCmds === 0)
		return { ...defaultResultModeNormal(), cmd: Command.Error };

	// Must be one matching command
	const tmp = assembleCommand(newSeq, commandMap);

	// return without clearing and change mode if command was leader
	if(tmp.cmd === Command.Leader)
		return { ...defaultResultModeNormal(),
			sequence: newSeq, cmdSequence: tmp, cmd: Command.PartialInput, mode: Modal.Leader };
	
	if(tmp.cmd === Command.Console)
		return { ...defaultResultModeNormal(), mode: Modal.Command };
	
	// Avoid sending partial commands ('g', 'z' -> finalized next run with 'gg', 'zz')
	if(tmp.cmd === Command.PartialInput) 
		return { ...defaultResultModeNormal(), 
			sequence: newSeq, cmdSequence: tmp, cmd: Command.PartialInput };

	return { ...defaultResultModeNormal(), sequence: newSeq, cmd: tmp.cmd, cmdSequence: tmp };
}

function handleModeNormalSpecial(key: SpecialKey): resultModeNormal{
	let cmd = staticSpecialKeyBinds(key);
	return { ...defaultResultModeNormal(), cmd, cmdSequence: { cmd } };
}

function handleModeNormalSpecialCtrl(key: SpecialKey): resultModeNormal{
	let cmd = Command.None;
	switch(key){
		case SpecialKey.Enter:
			cmd = Command.TauriFullscreen;
			break;
	};
	return { ...defaultResultModeNormal(), cmd, cmdSequence: { cmd } };
}

function handleModeNormalCtrl(key: string, sequenceState: resultModeNormal): resultModeNormal{
	let cmd = Command.None;

	switch(key) {
		case 'u':
			cmd = Command.PageUp;
			break;
		case 'd':
			cmd = Command.PageDown;
			break;
	};
	
	return { ...defaultResultModeNormal(), cmd, cmdSequence: { cmd } };
}

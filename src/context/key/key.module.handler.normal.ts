import { staticCommands, possibleCommands, assembleCommand, ctrlCommands, possibleLeaderCommands } from './key.input.parsers';
import { Command, CommandSequence } from './key.command';
import { Modal } from "./key.types";

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
	statics: Command[],
	commandMap: Map<string, Command>
): resultModeNormal {
	let sequence = normalBuffer.sequence;
	let mode = normalBuffer.mode;

	// Check for control commands (Escape, Return) or ignored keys (Ignore)
	let checkStaticCmds = staticCommands(event);
	if(statics.includes(checkStaticCmds)) 
		return { ...defaultResultModeNormal(),
			cmd: checkStaticCmds, cmdSequence: { cmd: checkStaticCmds } };

	// Handle ctrl+key events
	if(event.ctrlKey)
		return { ...defaultResultModeNormal(), cmd: ctrlCommands(event) };

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

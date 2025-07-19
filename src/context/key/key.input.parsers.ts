import { isStrictInteger, getNumberEndsIdx } from './key.helpers';
import { Command, CommandSequence } from './key.command';
import { SpecialKey } from './key.input.enum';

export function staticSpecialKeyBinds(key: SpecialKey): Command {
	switch(key) {
		case SpecialKey.Enter:	return Command.Return;
		case SpecialKey.Tab: 	return Command.Tab;
		case SpecialKey.Escape:	return Command.Escape;
		case SpecialKey.Alt:	return Command.Ignore;
		case SpecialKey.Shift:	return Command.Ignore;
		case SpecialKey.Super: 	return Command.Ignore;
		default:				return Command.None;
	}
}

export function possibleCommands(input: string, commandMap: Map<string,Command>): number {
	// If input is an integer, multiple valid commands are possible, skip further checks
	let isInt = isStrictInteger(input);
	if(isInt) return 2;

	let lastNumberIdx = getNumberEndsIdx(input);

	// Look for complete command
	let cmd = commandMap.get(input.substring(lastNumberIdx+1, input.length));
	if(cmd === undefined) return 0;
	return 1;
}
export function possibleLeaderCommands(input: string, commandMap: Map<string,Command>): number {
	return Array.from(commandMap.keys())
	.filter((a) => a.slice(0,input.length) === input).length;
}

export function assembleCommand(input: string, commandMap: Map<string,Command>): CommandSequence {
	let lastNumberIdx = getNumberEndsIdx(input);
	let modInt = 0;
	if(lastNumberIdx != -1) modInt = parseInt(input.substring(0, lastNumberIdx+1)) || 0;

	const tmp: CommandSequence = {
		modInt: modInt,
		cmd: commandMap.get(input.substring(modInt == 0 ? 0 : lastNumberIdx+1, input.length)) ?? Command.Error,
	};
	return tmp;
}



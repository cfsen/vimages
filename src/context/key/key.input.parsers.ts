import { isStrictInteger, getNumberEndsIdx } from './key.helpers';
import { Command, CommandSequence } from './key.command';

export function staticCommands(input: KeyboardEvent): Command {
	switch(input.key) {
		case 'Enter':	return Command.Return;
		case 'Tab': 	return Command.Tab;
		case 'Escape':	return Command.Escape;
		case 'Alt':		return Command.Ignore;
		case 'Shift':	return Command.Ignore;
		case ':':		return Command.Console;
		default:		return Command.None;
	}
}

export function ctrlCommands(input: KeyboardEvent): Command {
	switch(input.key) {
		case 'u':		return Command.PageUp;
		case 'd':		return Command.PageDown;
		default:		return Command.None;
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



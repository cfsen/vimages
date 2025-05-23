import { isStrictInteger, getNumberEndsIdx } from './Helpers';
import { Command, CommandSequence } from './Command.ts';

export function staticCommands(input: KeyboardEvent): Command {
	switch(input.key) {
		case 'Escape':	return Command.Escape;
		case 'Alt':		return Command.Ignore;
		case ':':		return Command.Console;
		case ' ':		return Command.Leader;
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

export function assembleCommand(input: string, commandMap: Map<string,Command>): CommandSequence {
	let lastNumberIdx = getNumberEndsIdx(input);
	let modInt = 0;
	if(lastNumberIdx != 0){
		modInt = parseInt(input.substring(0, lastNumberIdx+1)) || 0;
	}

	const tmp: CommandSequence = {
		modInt: modInt,
		cmd: commandMap.get(input.substring(modInt == 0 ? 0 : lastNumberIdx+1, input.length)) ?? Command.Error,
	};
	return tmp;
}


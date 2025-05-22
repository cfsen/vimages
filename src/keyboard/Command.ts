export function populateCommandMap(): Map<string,Command>{
	const commandMap = new Map<string, Command>();

	commandMap.set('h', Command.CursorLeft);
	commandMap.set('j', Command.CursorDown);
	commandMap.set('k', Command.CursorUp);
	commandMap.set('l', Command.CursorRight);

	return commandMap;
}

export type CommandSequence = {
	modInt: number,
	cmd: Command,
}

export enum Command {
	None,
	Cancel,
	Escape,
	Console,
	Error,

	Ignore,
	Input,
	Numeric,
	Leader,

	CursorLeft,
	CursorUp,
	CursorDown,
	CursorRight
}

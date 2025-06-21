export function populateCommandMap(): Map<string,Command>{
	const commandMap = new Map<string, Command>();

	commandMap.set('h', Command.CursorLeft);
	commandMap.set('j', Command.CursorDown);
	commandMap.set('k', Command.CursorUp);
	commandMap.set('l', Command.CursorRight);
	commandMap.set('_', Command.CursorBOL);
	commandMap.set('$', Command.CursorEOL);
	commandMap.set('¤', Command.CursorEOL); // TODO: support for custom aliases

	commandMap.set('g', Command.PartialInput);
	commandMap.set('gg', Command.JumpFirst);
	commandMap.set('G', Command.JumpLast);

	commandMap.set('z', Command.PartialInput);
	commandMap.set('zz', Command.CenterView);

	commandMap.set('V', Command.ModeVisual);

	commandMap.set('i', Command.ModeInsert);
	commandMap.set('a', Command.ModeInsertAppend);
	commandMap.set('I', Command.ModeInsertPrefix);
	commandMap.set('A', Command.ModeInsertSuffix);

	commandMap.set('q', Command.Debug);

	return commandMap;
}

export type CommandSequence = {
	modInt: number,
	cmd: Command,
}

export enum Command {
	Debug,

	None,
	Cancel,
	Escape,
	Ignore,
	Return,
	Tab,

	Console,
	Leader,
	Error,

	ModeNormal,
	ModeInsert,
	ModeInsertPrefix,
	ModeInsertSuffix,
	ModeInsertAppend,
	ModeVisual,

	Input,
	PartialInput,
	Numeric,

	CursorLeft,
	CursorUp,
	CursorDown,
	CursorRight,
	CursorBOL,
	CursorEOL,

	JumpFirst,
	JumpLast,
	PageUp,
	PageDown,

	CenterView,
}

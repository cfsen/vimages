// NOTE: source of truth for default keybinds
export function getDefaultKeyMap(): Map<string, Command> {
	const keyMap = new Map<string, Command>();

	keyMap.set('h', Command.CursorLeft);
	keyMap.set('j', Command.CursorDown);
	keyMap.set('k', Command.CursorUp);
	keyMap.set('l', Command.CursorRight);
	keyMap.set('_', Command.CursorBOL);
	keyMap.set('$', Command.CursorEOL);
	keyMap.set('¤', Command.CursorEOL);

	keyMap.set('w', Command.CursorNext);
	keyMap.set('b', Command.CursorBack);

	keyMap.set('g', Command.PartialInput);
	keyMap.set('gg', Command.JumpFirst);
	keyMap.set('G', Command.JumpLast);

	keyMap.set('z', Command.PartialInput);
	keyMap.set('zz', Command.CenterView);

	keyMap.set('v', Command.ModeVisual);
	keyMap.set('V', Command.ModeVisualLine);

	keyMap.set('i', Command.ModeInsert);
	keyMap.set('a', Command.ModeInsertAppend);
	keyMap.set('I', Command.ModeInsertPrefix);
	keyMap.set('A', Command.ModeInsertSuffix);

	keyMap.set(' ', Command.Leader);
	keyMap.set('  ', Command.Return);
	keyMap.set(' w', Command.WorkspaceNext);
	keyMap.set(' W', Command.WorkspaceNext);

	keyMap.set(':', Command.Console);
	keyMap.set('/', Command.Search);

	keyMap.set('q', Command.Debug);

	keyMap.set('s', Command.WorkspaceNext);
	keyMap.set('S', Command.WorkspacePrev);

	keyMap.set('R', Command.Refresh);

	keyMap.set('r', Command.ImageRotate);
	keyMap.set('zi', Command.ImageZoomIn);
	keyMap.set('zo', Command.ImageZoomOut);
	keyMap.set('zd', Command.ImageZoomDefault);

	return keyMap;
}

export function convertKeyToCommandMap(keyMap: Map<string, Command>): Map<Command, string> {
	const commandMap = new Map<Command, string>();

	for(let [key, cmd] of keyMap.entries()){
		commandMap.set(cmd, key);
	}

	return commandMap;
}

export type CommandSequence = {
	cmd: Command,
	modInt?: number,
	cursorPos?: number,
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
	Search,
	Leader,
	Error,

	ModeNormal,
	ModeInsert,
	ModeInsertPrefix,
	ModeInsertSuffix,
	ModeInsertAppend,

	ModeVisual,
	ModeVisualLine,
	ModeVisualExit,

	Input,
	PartialInput,
	Numeric,

	CursorLeft,
	CursorUp,
	CursorDown,
	CursorRight,
	CursorBOL,
	CursorEOL,

	CursorNext,
	CursorBack,

	JumpFirst,
	JumpLast,
	PageUp,
	PageDown,

	CenterView,
	Refresh,

	WorkspaceNext,
	WorkspacePrev,

	ImageRotate,
	ImageZoomIn,
	ImageZoomOut,
	ImageZoomDefault,

	OptionUp,
	OptionDown,

	TauriFullscreen,
}

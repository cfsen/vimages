import { Command } from "./key.command";

// Labels or short descriptions for Command.
const commandLabels: Record<Command, string> = {
	[Command.Debug]: "Debug",

	[Command.None]: "None",
	[Command.Cancel]: "Abort",
	[Command.Escape]: "Escape",
	[Command.Ignore]: "Ignore",
	[Command.Return]: "Return",
	[Command.Tab]: "Tab",

	[Command.Console]: "Open console",
	[Command.Search]: "Search",
	[Command.SearchJumpNext]: "Jump to next search hit",
	[Command.SearchJumpPrev]: "Jumpt to previous search hit",
	[Command.Leader]: "Leader",
	[Command.Error]: "Error",

	[Command.ModeNormal]: "Change to Normal mode",
	[Command.ModeInsert]: "Change to Insert mode",
	[Command.ModeInsertPrefix]: "Change to Insert mode, cursor at BOL",
	[Command.ModeInsertSuffix]: "Change to Insert mode, cursor at EOL",
	[Command.ModeInsertAppend]: "Change to Insert mode, cursor at EOL",

	[Command.ModeVisual]: "Change to visual mode",
	[Command.ModeVisualLine]: "Change to visual mode, select line",
	[Command.ModeVisualExit]: "Exit visual mode",

	[Command.Input]: "Generic input",
	[Command.PartialInput]: "Partial input sequence",
	[Command.Numeric]: "Numeric input",

	[Command.CursorLeft]: "Move cursor left",
	[Command.CursorUp]: "Move cursor up",
	[Command.CursorDown]: "Move cursor down",
	[Command.CursorRight]: "Move cursor right",
	[Command.CursorBOL]: "Move cursor to BOL",
	[Command.CursorEOL]: "Move cursor to EOL",

	[Command.CursorNext]: "Move cursor to next item",
	[Command.CursorBack]: "Move cursor to previous item",

	[Command.JumpFirst]: "Jump cursor to first item",
	[Command.JumpLast]: "Jump cursor to last item",
	[Command.PageUp]: "Jump cursor one page up",
	[Command.PageDown]: "Jump cursor one page down",

	[Command.CenterView]: "Center view on cursor",
	[Command.Refresh]: "Refresh directory",

	[Command.WorkspaceNext]: "Change to next workspace",
	[Command.WorkspacePrev]: "Change to pervious workspace",

	[Command.ImageRotate]: "Rotate image",
	[Command.ImageZoomIn]: "Zoom in",
	[Command.ImageZoomOut]: "Zoom out",
	[Command.ImageZoomDefault]: "Reset zoom",

	[Command.OptionUp]: "Select option up",
	[Command.OptionDown]: "Select option down",

	[Command.TauriFullscreen]: "Toggle app fullscreen",
};

// Retrieves a human-readable label or short description of a Command.
export function GetCommandLabel(cmd: Command): string {
	return commandLabels[cmd];
}

export enum SpecialKey {
	// Navigation keys
	ArrowUp = 'ArrowUp',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	ArrowRight = 'ArrowRight',
	Home = 'Home',
	End = 'End',
	PageUp = 'PageUp',
	PageDown = 'PageDown',

	// Function keys
	F1 = 'F1',
	F2 = 'F2',
	F3 = 'F3',
	F4 = 'F4',
	F5 = 'F5',
	F6 = 'F6',
	F7 = 'F7',
	F8 = 'F8',
	F9 = 'F9',
	F10 = 'F10',
	F11 = 'F11',
	F12 = 'F12',

	// Modifier keys
	Shift = 'Shift',
	Control = 'Control',
	Alt = 'Alt',
	Meta = 'Meta',
	ContextMenu = 'ContextMenu',

	// Special keys
	Enter = 'Enter',
	Escape = 'Escape',
	Tab = 'Tab',
	Backspace = 'Backspace',
	Delete = 'Delete',
	Insert = 'Insert',
	CapsLock = 'CapsLock',
	NumLock = 'NumLock',
	ScrollLock = 'ScrollLock',
	PrintScreen = 'PrintScreen',
	Pause = 'Pause',
}

export function isSpecialKey(key: string): key is SpecialKey {
  return Object.values(SpecialKey).includes(key as SpecialKey);
}

import { Key } from "react";

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
	AltGrp = 'AltGraph',
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
	Dead = 'Dead',
	Super = 'Super'
}

const specialKeySet = new Set(Object.values(SpecialKey));

export function isSpecialKey(key: string): key is SpecialKey {
	return specialKeySet.has(key as SpecialKey);
}

export function classifyKey(event: KeyboardEvent): KeyInputClassification {
	let checkSpecial = isSpecialKey(event.key);
	if(!checkSpecial)
		return {
			SpecialKey: null,
			Key: event.key,
		};

	let cast = event.key as SpecialKey | null;
	let key = null;

	if(event.shiftKey) {
		switch(event.code) {
			case 'BracketRight': // caret workaround
				key = "^";
				cast = null;
				break;
			default:
				break;
		}
	}

	return {
		SpecialKey: cast,
		Key: key,
	}
}

export type KeyInputClassification = {
	SpecialKey: SpecialKey | null,
	Key: String | null,
}

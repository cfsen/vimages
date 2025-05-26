import { createContext, useRef, useContext, useState } from "react";
import { Command, CommandSequence } from '../keyboard/Command';
import { KeyboardCursorHandle } from "./CommandCursorHandler";

type vimagesCtxType = {
	pwd: string;
	cmdLog: CommandSequence[];
	handleCmd: (seq: CommandSequence) => void;
	updatePwd: (dir: string) => void;
	showLeader: boolean;
	showConsole: boolean;

	navActiveId: string | null;
	setNavActiveId: (id: string) => void;
	navRegister: (navItem: NavigationItem) => void;
	navUnregister: (id: string) => void;
	navItemsRef: React.RefObject<NavigationItem[]>;

	imagesPerRow: number;
	setImagesPerRow: (value: number) => void;
};

export type NavigationItem = {
	id: string;
	ref: React.RefObject<HTMLElement>;
};

const vimagesCtx = createContext<vimagesCtxType | undefined>(undefined);

export const VimagesCtxProvider = ({ children }: { children: React.ReactNode }) => {
	const [pwd, setPwd] = useState(".");
	const [cmdLog, setCmdLog] = useState<CommandSequence[]>([]);
	const [showLeader, setShowLeader] = useState<boolean>(false);
	const [showConsole, setShowConsole] = useState<boolean>(false);

	const [imagesPerRow, setImagesPerRow] = useState<number>(0);

	//
	// Navigation
	//

	const [navActiveId, setNavActiveId] = useState<string | null>(null);
	const navItemsRef = useRef<NavigationItem[]>([]);

	const navRegister = (navItem: NavigationItem) => {
		navItemsRef.current?.push(navItem);
		if (navItemsRef.current?.length === 1) setNavActiveId(navItem.id);
		//console.log("vimagesCtx:navRegister");
		//console.log("vimagesCtx:navItemsRef.length:" + navItemsRef.current?.length);
		//
		//console.log("vimagesCtx:navActiveId:" + navActiveId);
	};

	const navUnregister = (id: string) => {
		navItemsRef.current = navItemsRef.current?.filter((i) => i.id !== id);
		if (navActiveId === id) setNavActiveId(null);
		//console.log("vimagesCtx:navUnregister");
	}


	//
	// Command handling
	//
	
	const handleCmd = (seq: CommandSequence) => {
		setCmdLog(prev => [...prev, seq]);

		// TODO: refactor out
		if(seq.cmd === Command.Escape){
			console.log("ctx:handleCmd:escape");
		}
		if(seq.cmd === Command.Console){
			console.log("ctx:handleCmd:console");
			setShowConsole(!showConsole);
		}
		if(seq.cmd === Command.Leader){ 
			console.log("ctx:handleCmd:leader");
			setShowLeader(!showLeader);
		}
		if(seq.cmd === Command.Return){
			console.log("ctx:handleCmd:return");
		}
		if(seq.cmd === Command.Error){
			console.log("ctx:handleCmd:error");
		}

		// Navigation keys
		let cur = KeyboardCursorHandle(seq, navItemsRef, imagesPerRow, navActiveId);
		if(cur != null)  {
			setNavActiveId(navItemsRef.current[cur].id);
			return;
		}
		// TODO: error handling
	}

	const updatePwd = (dir: string) => {
		setPwd(dir);
	};

	return (
		<vimagesCtx.Provider value={{ 
			pwd, 
			cmdLog, 
			handleCmd,
			updatePwd,
			showLeader,
			showConsole,

			navRegister,
			navUnregister,
			navActiveId,
			setNavActiveId,
			navItemsRef,

			imagesPerRow,
			setImagesPerRow,
		}}>
			{children}
		</vimagesCtx.Provider>
	);
};

export const useCommand = (): vimagesCtxType => {
	const ctx = useContext(vimagesCtx);
	if (!ctx) throw new Error("useCommand must be used within CommandProvider");
	return ctx;
};


// Reminder:
// Access context from any nested component:
//
//import { useCommand } from "../context/vimagesCtx";
//
//const { cmdLog, navigate, handleCmd, updatePwd } = useCommand();
//navigate(seq); // shared function, updates state

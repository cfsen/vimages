import { Command, CommandSequence } from '../keyboard/Command';
import { createContext, useEffect, useRef, useContext, useState } from "react";
import { KeyboardCursorHandle } from "./CommandCursorHandler";
import { NavigableItemType } from "./NavigableItem";
import { useRustApi, RustApiAction } from "./../filesystem/RustApiBridge";
import { invoke } from "@tauri-apps/api/core";

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
	itemType: NavigableItemType;
	data: string;
};

const vimagesCtx = createContext<vimagesCtxType | undefined>(undefined);

export const VimagesCtxProvider = ({ children }: { children: React.ReactNode }) => {
	const [pwd, setPwd] = useState(".");
	const [cmdLog, setCmdLog] = useState<CommandSequence[]>([]);
	const [showLeader, setShowLeader] = useState<boolean>(false);
	const [showConsole, setShowConsole] = useState<boolean>(false);
	const [imagesPerRow, setImagesPerRow] = useState<number>(0);


	const [isInitialized, setIsInitialized] = useState(false);

	// Only use the API hook for initial setup
	const { response, loading, error } = useRustApi({
		action: RustApiAction.GetCurrentPath,
		path: "." // Use a static path for initialization
	});

	// Set initial working directory ONCE
	useEffect(() => {
		if (!loading && !error && response && !isInitialized) {
			setPwd(response as any);
			setIsInitialized(true);
			console.log("Initial pwd set to:", response);
		}
	}, [loading, error, response, isInitialized]);

	//
	// Navigation
	//

	const [navActiveId, setNavActiveId] = useState<string | null>(null);
	const navItemsRef = useRef<NavigationItem[]>([]);

	const navRegister = (navItem: NavigationItem) => {
		navItemsRef.current?.push(navItem);
		if (navItemsRef.current?.length === 1) setNavActiveId(navItem.id);
	};

	const navUnregister = (id: string) => {
		navItemsRef.current = navItemsRef.current?.filter((i) => i.id !== id);
		if (navActiveId === id) setNavActiveId(null);
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

			let item = navItemsRef.current.find((i) => i.id === navActiveId);
			if(item?.itemType === NavigableItemType.FileBrowser){
				console.log(pwd);
				console.log("data:" + item.data);

				if(item.data === ".."){
					setPwd(currentPwd => {
						console.log("Current pwd:", currentPwd);
						invoke(RustApiAction.GetParentPath, { path: currentPwd })
							.then(response => {
								setPwd(response as string);
								console.log("New pwd:", response);
							})
							.catch(console.error);
						return currentPwd; // Return current state unchanged for now
					});
					return;
				}

				setPwd(currentPwd => {
					setPwd(currentPwd + "\\" + item.data);
					return currentPwd; 
				});
			}
		}
		if(seq.cmd === Command.Error){
			console.log("ctx:handleCmd:error");
		}

		// Navigation keys
		// TODO: error handling
		let cur = KeyboardCursorHandle(seq, navItemsRef, imagesPerRow, navActiveId);
		if(cur != null)  {
			setNavActiveId(navItemsRef.current[cur].id);
			return;
		}
		else {
			setNavActiveId(navItemsRef.current[0].id);
		}
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

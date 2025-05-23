import { createContext, useContext, useState } from "react";
import { Command, CommandSequence } from '../keyboard/Command';

type vimagesCtxType = {
	pwd: string;
	cmdLog: CommandSequence[];
	handleCmd: (seq: CommandSequence) => void;
	updatePwd: (dir: string) => void;
	showLeader: boolean;
	showConsole: boolean;
};

const vimagesCtx = createContext<vimagesCtxType | undefined>(undefined);

export const VimagesCtxProvider = ({ children }: { children: React.ReactNode }) => {
	const [pwd, setPwd] = useState(".");
	const [cmdLog, setCmdLog] = useState<CommandSequence[]>([]);
	const [showLeader, setShowLeader] = useState<boolean>(false);
	const [showConsole, setShowConsole] = useState<boolean>(false);

	const handleCmd = (seq: CommandSequence) => {
		setCmdLog(prev => [...prev, seq]);

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


//other files
//
//3. Use it anywhere (including keyboard hook or components):
//
//import { useCommand } from "../context/CommandContext";
//
//useModalKey({
//	onSequenceComplete: (seq) => {
//		const { navigate } = useCommand();
//
//		// or do this
//		const { cmdLog, navigate, handleCmd, updatePwd } = useCommand();
//		navigate(seq); // shared function, updates state
//	}
//});

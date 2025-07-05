import { CommandSequence, Command } from "@/keyboard/Command";
import { Modal } from "@keyboard/KeyboardTypes";
import { useAppState } from "@context/AppContextStore";
import { nextNavProvider } from "../AppContextStore.actions";

export function NormalModeHandler(seq: CommandSequence){
	const { 
		setMode, 
		showHelp, 
		setShowHelp, 
		activeNavigationContext, 
	} = useAppState.getState();

	switch(seq.cmd){
		case Command.ModeVisual:
			console.log("MODE SWAP -> Visual");
			setMode(Modal.Visual);
			break;

		case Command.ModeInsert:
			console.log("MODE SWAP -> Insert");
			setMode(Modal.Insert);
			break;

		case Command.Console:
			console.log("MODE SWAP -> Commmand");
			setMode(Modal.Command);
			break;

		case Command.Debug:
			console.log("[DEBUG] AppContext:");
			console.log("Zustand store:", useAppState.getState());
			break;

		case Command.Escape:
			if(showHelp) setShowHelp(false);
			console.log("ctx:handleCmd:escape");
			break;

		case Command.Leader:
			console.log("ctx:handleCmd:leader");
			//setShowLeader(!showLeader);
			break;

		case Command.Error:
			console.log("ctx:handleCmd:error");
			break;

		case Command.Tab:
			console.log("ctx:handleCmd:tab"); 
			if(!nextNavProvider(useAppState)) console.error("ctx: no active navigation context available!");
			break;
	}

	// Navigation commands - delegate to active container
	if (activeNavigationContext) {
		const handler = useAppState.getState().navigationHandlers.get(activeNavigationContext);
		if (handler) {
			const wasHandled = handler.handleNavCmd(seq);
			if (wasHandled) return;
		}
	}		
	console.log("Unhandled command:", seq);
}

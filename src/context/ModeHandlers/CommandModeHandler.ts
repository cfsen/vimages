import { Command, CommandSequence } from "@/keyboard/Command";
import { useAppState } from "@context/AppContextStore";
import { Modal } from "@/keyboard/KeyboardTypes";

const paramCommands = [":set", ":e"];

export function CommandModeHandler(input: string, sequence: CommandSequence){
	const {
		setMode,
		setShowHelp,
		setInputBufferCommand,
	} = useAppState.getState();

	// update buffer
	setInputBufferCommand(input);

	if(sequence.cmd !== Command.Return) return;

	// check for parameterless commands
	switch(input){
		case ":q":
			console.log("exit vimages");
			break;
		case ":help":
			setShowHelp(true);
			break;
	};

	let split = SplitCommandParam(input);
	if(split !== null) {
		console.log("issplitCommand: " + split.cmd, split.param);
	}

	// reset to normal, clear buffer
	setMode(Modal.Normal);
	setInputBufferCommand(":");
}

function SplitCommandParam(input: string): {cmd: string, param: string[]} | null {
	for(let i = 0; i < paramCommands.length; i++){
		if(input.length <= paramCommands[i].length) {
			continue
		}

		if(input.slice(0, paramCommands[i].length) === paramCommands[i]) {
			let split = {
				cmd: input.slice(0, paramCommands[i].length),
				param: input.slice(paramCommands[i].length+1, input.length).split(" "),
			};
			return split
		}
	}
	return null
}

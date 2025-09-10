export enum ConsoleCmd {
	WIP,
	Quit,
	SaveQuit,

	SetImgScale,
	SetErrorDisplayLv,
	SetTitlebarRender,
	SetInfoMsgWindowPersists,
	SetScrollTimeout,

	WriteConfig,
	Help,
	KeywordHelp,

	GetVerison,
	GetCacheInfo,
	GetQueueSize,
	GetQueueDirs,

	RunCacheCleanup,

	ChangeDir,

	FullscreenSetInvertCursor,
	FullscreenSetMoveStep,
	FullscreenSetRotateStep,
	FullscreenSetZoomStep,
	FullscreenSetRemapCursor,
	
	QueueBlacklist,
	QueueStatus,
};

export enum ParamType {
	None,		// takes no params: ':q'
	Action, 	// takes its value directly from first param: '[call] [value]'
	Keyword, 	// takes no additional arguments: '[keyword]'
	String, 	// takes a string argument: 'set word [string value]'
	Number, 	// takes a number argumnet: 'set word [numeric value]'
};

export type Parameter = {
	position: number,
	keyword: string,
	consoleCmd: ConsoleCmd,
	inputType: ParamType,
};

export type ParamCommand = {
	call: string,
	params: Parameter[],
};

export type resultCommandAction = {
	action: ConsoleCmd,
	word: string,
	payload: unknown
};

export class ParamCommandBuilder {
	private command: ParamCommand;

	constructor(call: string) {
		this.command = { call, params: [] };
	}

	param(inputType: ParamType, consoleCmd: ConsoleCmd, keyword?: string): ParamCommandBuilder {
		this.command.params.push({
			consoleCmd,
			position: this.command.params.length,
			keyword: keyword === undefined ? "action" : keyword,
			inputType
		});
		return this;
	}

	build(): ParamCommand {
		return this.command;
	}
}

export function getParser(input: string, registeredCommands: Map<string,ParamCommand>) {
	const parts = input.split(/\s+/);
	return registeredCommands.get(parts[0]);
}

export function parseInput(input: string, command: ParamCommand): resultCommandAction[] {
	const parts = input.trim().split(/\s+/);
	const results: resultCommandAction[] = [];
	let inputIndex = 1;

	for (const param of command.params) {
		let payload: unknown = null;
		let word = param.keyword;

		switch (param.inputType) {
			case ParamType.None:
				break;

			case ParamType.Action:
				if(inputIndex < parts.length) {
					payload = parts[inputIndex];
					console.log("parts:" + parts);
					console.log("payload:" + payload);
				}
				else {
					payload = undefined;
					console.info(`Missing argument for ${param.keyword}`);
				}
				break;

			case ParamType.Keyword:
				const keywordIndex = parts.indexOf(param.keyword, inputIndex);
				if(keywordIndex !== -1)
					payload = true;
				break;

			case ParamType.String:
				const stringKeywordIndex = parts.indexOf(param.keyword, inputIndex);
				if(stringKeywordIndex !== -1 && stringKeywordIndex + 1 < parts.length) {
					payload = parts[stringKeywordIndex + 1];
					inputIndex = Math.max(inputIndex, stringKeywordIndex + 2);
				}
				break;

			case ParamType.Number:
				const numKeywordIndex = parts.indexOf(param.keyword, inputIndex);
				if(numKeywordIndex !== -1 && numKeywordIndex + 1 < parts.length) {
					const numValue = parseFloat(parts[numKeywordIndex + 1]);
					if(isNaN(numValue))
						console.error(`Invalid number for ${param.keyword}: ${parts[numKeywordIndex + 1]}`);
					payload = numValue;
					inputIndex = Math.max(inputIndex, numKeywordIndex + 2);
				}
				break;
		}

		if(payload !== null || param.inputType === ParamType.None) {
			results.push({
				action: param.consoleCmd,
				word: word,
				payload: payload
			});
		}
	}

	return results;
}

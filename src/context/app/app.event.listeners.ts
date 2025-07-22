import { StoreApi } from "zustand";
import { Event as TauriEvent} from "@tauri-apps/api/event";

import { IAppState } from "@app/app.context.store";
import { addInfoMessage } from "@app/app.context.actions";

import { IPC_MsgInfoWindow } from "./app.event.types";

export const eventHandleMsgInfoWindow = (event: TauriEvent<IPC_MsgInfoWindow>, useAppState: StoreApi<IAppState>) => {
	addInfoMessage(useAppState, event.payload.message);
};

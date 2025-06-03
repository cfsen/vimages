import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { VimagesCtxProvider } from './context/vimagesCtx';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<VimagesCtxProvider>
			<App />
		</VimagesCtxProvider>
	</React.StrictMode>,
);

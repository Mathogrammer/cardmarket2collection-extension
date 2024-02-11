import React from "react";
import ReactDOM from "react-dom/client";
import "../../enableDevHmr";
import renderContent from "../renderContent";
import App from './App';

// TODO: Import cards from query into Archidekt collection

renderContent(import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS, (appRoot) => {
    ReactDOM.createRoot(appRoot).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
});

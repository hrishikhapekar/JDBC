import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { FlowSyncProvider } from "./context/FlowSyncProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FlowSyncProvider>
      <App />
    </FlowSyncProvider>
  </React.StrictMode>
);

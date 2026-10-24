import React from "react";
import ReactDOM from "react-dom/client";
import App from "./web/App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/dm-sans";
import "./web/site.css";
import "./web/v2.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

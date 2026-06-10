/**
 * Application entry point for the CarbonTrack platform.
 *
 * Mounts the React root with StrictMode enabled.
 * Imports the global CSS design system.
 *
 * @module main
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./lib/registerServiceWorker";

registerServiceWorker();

/** Root DOM element ID. */
const ROOT_ELEMENT_ID = "root";

const rootElement = document.getElementById(ROOT_ELEMENT_ID);

if (!rootElement) {
  throw new Error(`Root element #${ROOT_ELEMENT_ID} not found`);
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

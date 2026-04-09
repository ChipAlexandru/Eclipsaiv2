// Entry point — wires App to a #root mount. A build harness (Vite or Next.js)
// will import this. Milestone 1 is source-only; a Vite dev server is added as
// a lightweight verification step before the marketplace milestone, and Next.js
// takes over in the deployment milestone.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

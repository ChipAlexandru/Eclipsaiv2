"use client";
// Home route — renders the deck shell with its in-memory state model.
// For m5.1 this is a pure client-side SPA at /, identical in behavior to the
// Vite harness it replaces. In m5.3 the slide view gets promoted to its own
// /[deck]/[chapter]/[slide] route with router-driven navigation and per-slide
// generateMetadata for OG.
import App from "../src/App.jsx";

export default function HomePage() {
  return <App />;
}

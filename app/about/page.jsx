// /about — shelf-level About page (promoted from old Chapter 5 in m3).
// Thin server wrapper: owns metadata, mounts the same App component with
// initialView="about" so the existing full-viewport AboutPage renders.
// Navigation back to Home uses App's internal setView("home") which in turn
// updates the URL via the replaceState sync effect.
import App from "../../src/App.jsx";
import { shelf } from "../../src/decks/index.js";

export const metadata = {
  title: "About Chip Alexandru — Eclipsai",
  description: shelf.about.intro,
};

export default function AboutPage() {
  return <App initialView="about" />;
}

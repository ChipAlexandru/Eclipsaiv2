import catalog from "../../src/juliette-demo/catalog.json";
import { JulietteVoiceShop } from "../../src/juliette-demo/JulietteVoiceShop.jsx";

export const metadata = {
  title: "Juliette voice shopping demo",
  description: "Explore Juliette products with a natural voice conversation and prepare a simulated Erlenbach pickup.",
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#72243B",
};

export default function JulietteDemoPage() {
  return <JulietteVoiceShop catalog={catalog} />;
}

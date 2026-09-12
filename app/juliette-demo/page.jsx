import catalog from "../../src/juliette-demo/catalog.json";
import { JulietteVoiceShop } from "../../src/juliette-demo/JulietteVoiceShop.jsx";

export const metadata = {
  title: "Juliette voice shopping",
  description: "Explore Juliette products with a natural voice conversation and prepare an Erlenbach pickup preview.",
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#72243B",
};

export default function JulietteDemoPage() {
  return <JulietteVoiceShop catalog={catalog} />;
}

import { bakeryDemoVoiceEnabled } from "../../src/bakery-demo-runtime.mjs";
import catalog from "../../src/hausammann-demo/catalog.json";
import { HausammannVoiceShop } from "../../src/hausammann-demo/HausammannVoiceShop.jsx";

export const metadata = {
  title: "Shop Hausammann",
  description: "Explore Hausammann bakery products and plan your pickup.",
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: "#0b6093" };

export default function HausammannDemoPage() {
  return <HausammannVoiceShop catalog={catalog} voiceEnabled={bakeryDemoVoiceEnabled()} />;
}

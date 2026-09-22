import { bakeryDemoVoiceEnabled } from "../../src/bakery-demo-runtime.mjs";
import catalog from "../../src/honold-demo/catalog.json";
import { HonoldVoiceShop } from "../../src/honold-demo/HonoldVoiceShop.jsx";

export const metadata = {
  title: "Shop Honold",
  description: "Explore Honold products and plan your pickup.",
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: "#582E10" };

export default function HonoldDemoPage() {
  return <HonoldVoiceShop catalog={catalog} voiceEnabled={bakeryDemoVoiceEnabled()} />;
}

import catalog from "../../src/honold-demo/catalog.json";
import { HonoldVoiceShop } from "../../src/honold-demo/HonoldVoiceShop.jsx";
import { honoldVoiceEnabled } from "../../src/honold-demo/runtime.mjs";

export const metadata = {
  title: "Shop Honold",
  description: "Explore Honold products and plan your pickup.",
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: "#582E10" };

export default function HonoldDemoPage() {
  return <HonoldVoiceShop catalog={catalog} voiceEnabled={honoldVoiceEnabled()} />;
}

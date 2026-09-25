import catalog from "../../src/honold-order/catalog.json";
import { HonoldOrder } from "../../src/honold-order/HonoldOrder.jsx";

export const metadata = {
  title: "Honold · Bestellen & Abholen",
  description: "Vorbestellen und ohne Anstehen abholen – Konzept-Demo.",
  robots: { index: false, follow: false },
  // Stop Chrome from auto-translating Honold product names and German copy.
  other: { google: "notranslate" },
};

export const viewport = { themeColor: "#5a2d18" };
export const dynamic = "force-dynamic";

export default function HonoldOrderPage() {
  return <HonoldOrder catalog={catalog} voiceEnabled={Boolean(process.env.HONOLD_ORDER_OPENAI_API_KEY || process.env.Honold2)} />;
}

import catalog from "../../src/bachmann-order/catalog.json";
import { BachmannOrder } from "../../src/bachmann-order/BachmannOrder.jsx";

export const metadata = {
  title: "Bachmann · Bestellen & Abholen",
  description: "Vorbestellen und ohne Anstehen abholen – Konzept-Demo.",
  robots: { index: false, follow: false },
  // Stop Chrome from auto-translating Bachmann product names and German copy.
  other: { google: "notranslate" },
};

export const viewport = { themeColor: "#9d125c" };
export const dynamic = "force-dynamic";

export default function BachmannOrderPage() {
  return <BachmannOrder catalog={catalog} voiceEnabled={Boolean(process.env.BACHMANN_ORDER_OPENAI_API_KEY)} />;
}

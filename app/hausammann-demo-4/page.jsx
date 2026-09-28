import catalog from "../../src/hausammann-order/catalog.json";
import { HausammannOrder } from "../../src/hausammann-order/HausammannOrder.jsx";

export const metadata = {
  title: "Hausammann · Bestellen & Abholen",
  description: "Bäckerei Hausammann: Vorbestellen und abholen – Konzept-Demo.",
  robots: { index: false, follow: false },
  other: { google: "notranslate" },
};

export const viewport = { themeColor: "#0b6293" };
export const dynamic = "force-dynamic";

export default function HausammannOrderPage() {
  return <HausammannOrder catalog={catalog} voiceEnabled={Boolean(process.env.HAUSAMMANN_ORDER_OPENAI_API_KEY)} />;
}

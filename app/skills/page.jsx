// /skills — full marketplace directory.
// Server component wrapper: owns metadata; delegates rendering to the
// client-side MarketplaceFullDirectory (filters need useState).
import { MarketplaceFullDirectory } from "../../src/marketplace/MarketplaceFullDirectory.jsx";

export const metadata = {
  title: "Business Skills for Claude Cowork — Eclipsai",
  description:
    "Turn expertise, procedures, and best practices into reusable capabilities so Claude can apply them automatically, every time.",
};

export default function SkillsPage() {
  return <MarketplaceFullDirectory />;
}

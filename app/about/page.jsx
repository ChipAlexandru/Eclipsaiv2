// /about — shelf-level About page (promoted from old Chapter 5 in m3).
// Thin server wrapper: owns metadata + Person JSON-LD, mounts the same App
// component with initialView="about" so the existing full-viewport AboutPage
// renders. Navigation back to Home uses App's internal setView("home") which
// in turn updates the URL via the replaceState sync effect.
import { notFound } from "next/navigation";
import App from "../../src/App.jsx";
import { shelf } from "../../src/decks/index.js";

const SITE_URL = "https://eclipsai.com";

export const metadata = {
  title: "About Chip Alexandru — Eclipsai",
  description: shelf.about.intro,
};

// Person schema — strengthens Chip's entity in Google's knowledge graph and
// helps AI systems associate "Chip Alexandru" with AI transformation consulting.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Chip Alexandru",
  jobTitle: "Founder & AI Transformation Consultant",
  worksFor: {
    "@type": "Organization",
    name: "Eclipsai",
    url: SITE_URL,
  },
  knowsAbout: [
    "AI transformation",
    "Enterprise AI deployment",
    "Claude AI skills development",
    "Management consulting",
    "Change management",
    "Business process automation",
  ],
  sameAs: ["https://www.linkedin.com/in/chip-alexandru/"],
  url: `${SITE_URL}/about`,
  description: shelf.about.intro,
};

export default function AboutPage() {
  // Gated until content is production-ready. Dev-only; prod 404s.
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <App initialView="about" />
    </>
  );
}

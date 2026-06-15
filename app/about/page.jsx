// /about — shelf-level About page. A real, production route. Thin server
// wrapper: owns metadata + Person JSON-LD, mounts the App shell with
// initialView="about" so the full-viewport AboutPage renders. Navigation back
// to Home uses App's internal setView("home"), which mirrors to homePath
// (/insights) via the replaceState sync effect.
import App from "../../src/App.jsx";
import { shelf } from "../../src/decks/index.js";

const SITE_URL = "https://eclipsai.com";

export const metadata = {
  title: "About Chip Alexandru — Eclipsai",
  description: shelf.about.paras[0],
};

// Person schema — strengthens Chip's entity in Google's knowledge graph and
// helps AI systems associate "Chip Alexandru" with Eclipsai.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Chip Alexandru",
  jobTitle: "Founder, Eclipsai",
  worksFor: {
    "@type": "Organization",
    name: "Eclipsai",
    url: SITE_URL,
  },
  knowsAbout: [
    "AI workflows",
    "AI agents",
    "Enterprise AI deployment",
    "Management consulting",
    "Business process automation",
    "Strategy consulting",
  ],
  sameAs: ["https://www.linkedin.com/in/chip-alexandru/"],
  url: `${SITE_URL}/about`,
  description: shelf.about.paras[0],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <App initialView="about" homePath="/insights" />
    </>
  );
}

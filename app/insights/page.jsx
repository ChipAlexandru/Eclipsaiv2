// /insights — the Eclipsai insights/playbook experience. This is the content
// that previously lived at the root "/"; it moved here when "/" became the
// standalone product page. The deep deck routes (/[deck]/[chapter]/[slide])
// are unchanged and still resolve directly.
//
// Thin server wrapper: mounts the same App shell with initialView="home" and
// homePath="/insights" so the home view (and any in-app nav back to home from
// a deck or /about) mirrors to /insights rather than bouncing to "/".
import App from "../../src/App.jsx";

const SITE_URL = "https://eclipsai.com";

export const metadata = {
  title: "Insights — Eclipsai",
  description:
    "The Eclipsai Playbook: the case for change, the latest AI tools and self-improving workflows, and what it takes to make them real inside an organization.",
  alternates: { canonical: `${SITE_URL}/insights` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/insights`,
    siteName: "Eclipsai",
    title: "Insights — Eclipsai",
    description:
      "The Eclipsai Playbook: the case for change, the latest AI tools, and how to make them real inside an organization.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights — Eclipsai",
    description:
      "The Eclipsai Playbook: the case for change, the latest AI tools, and how to make them real inside an organization.",
  },
};

export default function InsightsPage() {
  return <App initialView="home" homePath="/insights" />;
}

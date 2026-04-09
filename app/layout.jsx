// Root layout — global page chrome (html/body, cream background, full-viewport
// sizing) plus default metadata. Per-route metadata via generateMetadata
// overrides title/description on /skills/[slug], /[deck], /[deck]/[chapter]/
// [slide], and /about. metadataBase lets those overrides emit absolute OG
// URLs that resolve against the production domain.
//
// Also injects:
//  - JSON-LD Organization schema so Google sees Eclipsai as an entity
//  - Plausible analytics script (lazy, privacy-friendly, cookie-free)
//
// Both are added via next/script with afterInteractive strategy so the
// client bundle hydrates first and neither blocks the initial paint.
import Script from "next/script";

const SITE_URL = "https://eclipsai.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Eclipsai",
  url: SITE_URL,
  description:
    "Strategy consulting with deep, tested expertise in deploying AI inside organizations.",
  founder: {
    "@type": "Person",
    name: "Chip Alexandru",
    sameAs: "https://www.linkedin.com/in/chip-alexandru/",
  },
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Eclipsai — Strategy consulting for AI transformation",
    template: "%s",
  },
  description:
    "Strategy consulting with deep, tested expertise in deploying AI inside organizations. Most AI programs stall at pilots. Ours don't.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Eclipsai",
    title: "Eclipsai — Strategy consulting for AI transformation",
    description:
      "Most AI programs stall at pilots. Ours don't. Tested methodology, real expertise, deployed inside organizations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eclipsai — Strategy consulting for AI transformation",
    description:
      "Most AI programs stall at pilots. Ours don't.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          background: "#F8F4EE",
        }}
      >
        {children}
        <Script
          src="https://plausible.io/js/script.js"
          data-domain="eclipsai.com"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

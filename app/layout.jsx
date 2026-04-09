// Root layout — m5.1 scaffold.
// Global page chrome (html/body, cream background, full-viewport sizing) plus
// default metadata. Per-slide metadata via generateMetadata lands in m5.3 on
// the dynamic /[deck]/[chapter]/[slide] route.

export const metadata = {
  title: "Eclipsai — Offering",
  description:
    "Strategy consulting with deep, tested expertise in deploying AI inside organizations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          background: "#F8F4EE",
        }}
      >
        {children}
      </body>
    </html>
  );
}

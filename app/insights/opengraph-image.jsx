// OG card for /insights — preserves the playbook's existing social identity
// (the card that used to be the site-wide default at "/"). The root "/" OG
// card now reflects the product positioning; this keeps the insights/playbook
// preview pointed at the playbook headline.
import { ImageResponse } from "next/og";
import { renderOgCard, OG_SIZE, THEME_DARK } from "../_og/card.jsx";

export const runtime = "nodejs";
export const alt = "Eclipsai Insights — The Playbook";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    renderOgCard({
      theme: THEME_DARK,
      headline: "The Playbook: every role, dramatically more capable.",
      sub: "The case for change, the latest AI tools, and how to make them real inside your organization.",
    }),
    { ...size },
  );
}

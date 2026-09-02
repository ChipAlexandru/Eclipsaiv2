import fallbackResults from "../../../public/homepage-live-results.json";

export const dynamic = "force-dynamic";

const SCHEMA_VERSION = "eclipsai-homepage-live-results-v1";
const LIVE_MAX_AGE_MS = 36 * 60 * 60 * 1000;

function liveResultsOrigin() {
  if (process.env.VERCEL_ENV !== "production") return null;
  const configured = process.env.JULIETTE_PORTAL_ORIGIN;
  if (!configured) return null;

  try {
    const parsed = new URL(configured);
    if (
      parsed.protocol !== "https:"
      || parsed.username
      || parsed.password
      || parsed.pathname !== "/"
      || parsed.search
      || parsed.hash
    ) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function validResults(value) {
  return Boolean(
    value
    && value.schema_version === SCHEMA_VERSION
    && value.status === "live"
    && Number.isInteger(value.production_lines_changed)
    && Number.isFinite(value.profit_impact_share_of_sales)
    && Number.isFinite(value.estimated_waste_reduction_share)
    && typeof value.updated_at === "string"
    && typeof value.updated_label === "string"
  );
}

function displayedResults(results, remoteReached) {
  const updatedAt = Date.parse(results.updated_at);
  const age = Date.now() - updatedAt;
  const isCurrent = Number.isFinite(age) && age >= 0 && age <= LIVE_MAX_AGE_MS;
  return {
    ...results,
    display_status: remoteReached && isCurrent ? "live" : "snapshot",
  };
}

export async function GET() {
  const origin = liveResultsOrigin();
  if (origin) {
    try {
      const response = await fetch(`${origin}/public/homepage-live-results.json`, {
        cache: "no-store",
      });
      if (response.ok) {
        const results = await response.json();
        if (validResults(results)) {
          return Response.json(displayedResults(results, true), {
            headers: { "Cache-Control": "no-store" },
          });
        }
      }
    } catch {
      // Preserve the last verified public snapshot if the source is temporarily unavailable.
    }
  }

  return Response.json(displayedResults(fallbackResults, false), {
    headers: { "Cache-Control": "no-store" },
  });
}

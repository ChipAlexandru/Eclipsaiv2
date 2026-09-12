import { cookies } from "next/headers";
import catalog from "../../src/avolta-demo/catalog.json";
import flightDay from "../../src/avolta-demo/flight-day.fixture.json";
import { accessConfigured, hasAccess } from "../../src/avolta-demo/auth.mjs";
import { AvoltaVoiceShop } from "../../src/avolta-demo/AvoltaVoiceShop.jsx";
import { mapZurichTimeOfDayToFixture } from "../../src/avolta-demo/flightReplay.mjs";
import { getReplayJourneyContext } from "../../src/avolta-demo/liveContextServer.mjs";
import styles from "../../src/avolta-demo/avoltaVoiceShop.module.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Zürich Duty Free voice shopping",
  description: "Explore the Zürich Duty Free selection with voice and touch.",
  robots: { index: false, follow: false, nocache: true },
};
export const viewport = { themeColor: "#28133d" };

export default async function AvoltaDemoPage({ searchParams }) {
  const cookieStore = await cookies();
  if (hasAccess(cookieStore)) {
    const initialContext = getReplayJourneyContext(mapZurichTimeOfDayToFixture(new Date(), flightDay.provenance.serviceDate));
    return <AvoltaVoiceShop catalog={catalog} flightDay={{ fixtureVersion: flightDay.fixtureVersion, serviceDate: flightDay.provenance.serviceDate, initialContext: { scheduleEnded: false, departureCount: initialContext.departureCount, illustrativeFlights: initialContext.illustrativeFlights } }} />;
  }
  const params = await searchParams;
  const configured = accessConfigured();
  return (
    <main className={styles.accessPage}>
      <section className={styles.accessCard}>
        <div className={styles.accessBrand}><span>A</span><div><strong>ZÜRICH DUTY FREE</strong><small>Zürich Airport</small></div></div>
        <p>Welcome</p>
        <h1>Explore before you fly.</h1>
        {configured ? (
          <form method="post" action="/api/avolta-demo/access">
            <label>Passcode<input name="passcode" type="password" autoComplete="current-password" required autoFocus /></label>
            {params?.error && <span role="alert">That passcode was not recognized.</span>}
            <button type="submit">Enter the shop</button>
          </form>
        ) : <div className={styles.accessError}>This shop is temporarily unavailable.</div>}
      </section>
    </main>
  );
}

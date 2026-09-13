# Flight-day companion visual evidence

Captured in Google Chrome against the local production-equivalent route on 12 September 2026. The query-only acceptance states used to make these screenshots repeatable are compiled out of production.

| Viewport | Awaiting flight | Confirmed flight | Confirmed demo order |
| --- | --- | --- | --- |
| 1512 × 900 | `flight-day-desktop-before.png` | `flight-day-desktop-confirmed.png` | `flight-day-desktop-order.png` |
| 390 × 844 | `flight-day-390-before.png` | `flight-day-390-confirmed.png` | `flight-day-390-order.png` |
| 320 × 720 | `flight-day-320-before.png` | `flight-day-320-confirmed.png` | `flight-day-320-order.png` |

The confirmed-order states show the paired boarding and simulated-arrival countdowns. The narrow states keep both context cards above the two-column product grid and leave the floating voice/bag controls usable. The red “1 Issue” pill seen in some captures is the Next.js development toolbar and is absent from production.

## Next-departures correction — 13 September 2026

The light, compact strip was captured in headless Google Chrome against the authenticated local route. The older `flight-day-*-before.png` captures above are the before state; the following files are the corrected after state.

| Evidence | Capture |
| --- | --- |
| Desktop idle, departure within one minute | `next-departures-desktop.png` |
| 390 × 844 idle | `next-departures-390.png` |
| 320 × 720 idle | `next-departures-320.png` |
| 390 × 844 confirmed flight | `next-departures-390-confirmed.png` |
| 390 × 844 confirmed order | `next-departures-390-order.png` |
| Two departures remaining | `next-departures-390-near-last.png` |
| No future departures | `next-departures-390-exhausted.png` |
| Morning first row | `next-departures-desktop-morning.png` — 06:00 Hurghada, WK130 |
| Midday first row | `next-departures-desktop-midday.png` — 12:00 Bucharest, LX1888 |
| Evening first row | `next-departures-desktop-evening.png` — 19:00 Helsinki, AY1514 |

Measured idle-strip height was 52.53px at 1280px and 60px at both 390px and 320px. Primary time, destination, flight and gate text was 14px or larger. Computed contrast against the `rgb(244, 240, 248)` strip was 14.92:1 for plum text and 15.08:1 for near-black destination text.

At a controlled 13:04:58 start, the first row was 13:05 Chicago, LX008. After its departure passed, the rendered row became 13:10 Washington, LX072, and the context endpoint had refreshed. Dispatching the visible-tab resume event produced a second context request. A confirmed WK002 remained WK002 after more than one idle-rotation interval; the confirmed-order state retained the same flight.

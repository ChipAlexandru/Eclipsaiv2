# Avolta live source-access proof

Verified from Zurich, 2026-09-11. These sources are consumed server-side through `/api/avolta-demo/journey-context`; personal journey inputs are not included in the shared cache.

| Reading | Official public source | Actual fields observed | Source timestamp | Access and cost | Known gaps |
|---|---|---|---|---|---|
| Departures | `https://flightdata.flughafen-zuerich.ch/flights` | `flightType`, `statusCode`, `codeShare`, `isSchengen`, `PDS`, `airportName`, `airline`, `id`, `FLN`, `FLC`, `SDT`, `STD`, `ETD`, `ATD`, `EBT`, `GAT`, `cityEn`, `statusTextEn` | No feed update timestamp supplied; server records fetch time | Public JSON, no key/account/fee observed | Multi-day response; gate, boarding time and codeshare can be absent. Passenger location is never provided. |
| Security | `https://waitingtimes.flughafen-zuerich.ch/WaitingTimes/Security` | `maxWaitingTime` (observed value `4`) | No source timestamp; server records fetch time | Public JSON, no key/account/fee observed | Single maximum value; source does not explain sampling time in response. |
| Check-in | `https://waitingtimes.flughafen-zuerich.ch/WaitingTimes/Checkin` | `checkin[].number`, `economy`, `fastBagDrop`, `selfServiceBagDrop` | No source timestamp; server records fetch time | Public JSON, no key/account/fee observed | Values can be ranges/absent; not tied to a traveler's airline. |
| Passport control | `https://waitingtimes.flughafen-zuerich.ch/WaitingTimes/pkh` | `passportControl[].identifier`, `waitingTime` | No source timestamp; server records fetch time | Public JSON, no key/account/fee observed | Multiple control points; passenger route may be unknown. |

The deployed server cache refresh target is 180 seconds and expires at the next Europe/Zurich midnight. Freshness is distinct from retention: readings older than six minutes are labeled stale, and prior-day data becomes unavailable. Next.js/Vercel Data Cache supplies shared production caching; the browser response is private and uncached.

The flight page bundle labels `GAT` as gate and `EBT` as boarding time. The airport's [2026 interim report](https://report.flughafen-zuerich.ch/2026/hyr/en/business-update) confirms that current check-in, security and passport-control waits are shown on its passenger website; its [ICT services page](https://www.flughafen-zuerich.ch/en/business/renting-and-advertising/real-estate-and-letting/ict-airport-services) describes AOS/AODB as central flight-data sources. Google Routes was not adopted: traffic-aware road routing requires a billed credential. The demo accepts a traveler-provided airport arrival estimate and labels that basis; it does not treat road traffic as rail travel.

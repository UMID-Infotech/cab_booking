# Verification results for open-source demo version 2

Date: 14 October 2026. Runtime: Node.js 24.19.0.

## Completed checks

| Check | Result |
| --- | --- |
| Clean dependency install with npm ci | Passed |
| Core and React integration tests | 34 passed, 0 failed |
| Production build | Passed |
| Photon live address search | HTTP 200; Noida Sector 62 results returned |
| Photon reverse address lookup | HTTP 200; Noida city and address returned |
| OSRM live driving route | HTTP 200; valid GeoJSON route returned |
| OpenStreetMap tile request | HTTP 200; PNG tile returned |
| Search and routing response CORS headers | Access-Control-Allow-Origin: * observed |

A real Delhi-to-Noida request returned **27,761 metres** and **546 route geometry points**. This is evidence of a successful provider response at test time, not a fixed fixture used by the application. Other routes and times may produce different distances.

## Automated coverage

- Ten unique city IDs, positive valid rates, full-metre fare math and final rounding.
- Delhi aliases, Gurgaon, Allahabad, Mau, Noida and Greater Noida.
- Unsupported cities, foreign localities, disabled pickups and missing locations.
- City rate import validation, metadata preservation and corrupted-storage recovery.
- Photon coordinate order and country/city extraction.
- Preservation of selected pin coordinates over the nearest feature coordinates.
- HTTP success caching, cancellation and provider throttling errors.
- Public page contains only the calculator, with no city rate table.
- Manual pickup and drop search, actual-road quote, trip review and modal dismissal.
- Editing an already selected address keeps the newly typed text and clears old fare.
- Pickup/drop swapping reprices using the new pickup city; reset clears both fields.
- Both map click controls and draggable markers update locations.
- Current location success, permission denial and late-response protection.
- GPS/map coordinates remain usable when reverse lookup has no result.
- Missing route errors do not substitute sample kilometres.
- A delayed route response cannot restore a stale quote.
- Admin rate changes persist and affect the same-browser calculator.
- Admin invalid rates cannot be saved; disabling a city stops quoting.
- Admin city search and default restoration work.

The React interaction tests use a jsdom DOM, a Leaflet API adapter and mocked network responses. HTTP caching/throttling code is separately checked. Live public-service requests were checked in addition to those deterministic tests.

## Remaining environment and device checks

Physical-device GPS accuracy and a full visual browser review were not available in this environment. Check the appearance, browser permissions and map drag behavior on your actual phone after running locally or deploying on Vercel.

`vercel.json` declares static Vite output and dashboard rewrites. No deployment has been made in your account.

Public map/geocoding/routing services can throttle or become unavailable. Settings are saved locally in the browser, not to a shared server. The admin is a demo page without authentication. No booking or payment has been made by this application.

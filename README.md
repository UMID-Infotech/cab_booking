# CityRide open-source calculator and demo admin

A complete React + Vite frontend with **live open-source maps, address search, current location, driving routes and pickup-city pricing**. No Google Cloud account, API key, backend or database is required for this short, non-production demo.

The public page contains only the calculator. City pricing is managed at `/admin`.

## Run locally on Windows

Use Node.js 24 (tested on 24.19.0). Extract the ZIP and open its `cityride-demo` folder in VS Code.

```powershell
npm ci
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

- Calculator: `http://localhost:5173/`
- Admin dashboard: `http://localhost:5173/admin`

No `.env.local` is required. Previously configured `VITE_GOOGLE_MAPS_*` variables are ignored. Internet access is needed for map tiles, search and routing.

## Features

### Calculator

- Live Leaflet map with OpenStreetMap tiles.
- Independent manual address searches for pickup and drop, with selectable suggestions.
- Independent Pick on map controls, plus draggable A and B markers.
- Current location uses browser permission and automatically attempts pickup detection on first load. Manual edits take precedence over delayed GPS results.
- Coordinate selection remains usable when reverse address lookup fails; the user can explicitly confirm an ambiguous pickup city.
- Actual road route, distance and approximate drive time from OSRM.
- Full road metres are used for fare calculation; the displayed distance is rounded separately.
- Location swapping, reset, trip estimate review and text estimate download.
- Quote invalidation on location/rate changes and cancellation of outdated requests.
- Clear errors for denied GPS, unavailable search, unsupported city, missing route and provider throttling.
- No fabricated distance and no sample-route fallback.

### Admin dashboard

- List of all ten configured pickup cities.
- Per-kilometre rate editor and enabled/disabled pickup controls.
- Search, save, restore defaults and JSON import/export.
- Rate validation and browser-local persistence.
- Saved changes immediately affect the calculator on the **same browser and origin**. Other tabs on that same origin receive storage updates.

**Storage boundary:** this is a frontend demo dashboard without login or a server database. Changes on your laptop are not automatically shared with a client's browser, another device, another hostname or a different localhost port. For cross-browser presentation, export the rate JSON, import it on that browser and save. To change the deployed default rates for everyone, update `src/data/cityRates.js` and redeploy; browsers with their own saved overrides retain those until defaults are restored and saved.

## Demo services

| Feature | Provider |
| --- | --- |
| Interactive map | Leaflet 1.9.4 |
| Map tiles | OpenStreetMap standard tiles |
| Address search and reverse lookup | Photon public geocoder |
| Driving distance and route | OSRM public demo routing |
| Current location | Browser Geolocation API |

The network code queues public service requests, spaces them by at least 1.1 seconds per client/service and caches successful requests. Search waits until the user pauses typing. No bulk requests, tile prefetching or offline map downloads are implemented. Attribution is visible on the map and search suggestions.

These public services have usage limits and no guaranteed availability. OSRM's public demo usage policy restricts it to reasonable **non-commercial** use and at most one request per second. This package is for short, low-volume functionality evaluation; do not use its default routing endpoint for an operating commercial cab service. Photon may throttle heavy usage. The request spacing is local to each browser, not a global traffic limiter across all visitors. If your client demonstration is classified as commercial use by the provider, use a compatible permitted provider or self-hosted endpoint.

Optional service overrides are documented in `.env.example`:

```dotenv
VITE_PHOTON_URL=https://photon.komoot.io
VITE_ROUTING_URL=https://router.project-osrm.org
VITE_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

The routing override must implement the OSRM `/route/v1/driving/` API; the geocoder override must implement Photon's `/api/` and `/reverse` APIs. These are optional endpoint URLs, not credentials.

## City pricing

Built-in rates and aliases are in `src/data/cityRates.js`.

| City | Default INR/km |
| --- | ---: |
| Delhi | 18 |
| Noida | 16 |
| Greater Noida | 16 |
| Gurugram | 18 |
| Ghaziabad | 15 |
| Lucknow | 15 |
| Kanpur | 14 |
| Varanasi | 14 |
| Prayagraj | 13 |
| Mau | 12 |

```text
Estimated fare = actual road distance in metres / 1000 × pickup city rate
```

The drop city does not select the rate. Rates can differ for reverse trips, and road distances can also differ by direction. Final currency is rounded to two decimals. Minimum/base fare, tolls, tax, parking and waiting are not part of the approved pricing rule. OSRM duration does not include live traffic.

Exact city matching supports New Delhi, Gurgaon, Allahabad, Banaras and Mau aliases. Greater Noida is separate from Noida. A known unsupported city is blocked; a missing city name can be explicitly confirmed for the demo. This is city-name matching, not authoritative service-area polygons.

## Update your previous project

Simplest: keep your old folder, extract the updated ZIP into a new folder and run the commands above. That gives a clean version with no Google dependencies or old sample files.

If updating in place:

1. Stop the old dev server with Ctrl+C.
2. Back up your project.
3. Replace the entire `src` and `tests` folders with those from this ZIP. Replacing the entire folders removes the old `src/data/demoRoutes.js` sample fixture file.
4. Replace `package.json`, `package-lock.json`, `vercel.json`, `vite.config.js`, `index.html` and `.env.example`.
5. Replace the guides with the updated `README.md`, `START_HERE.md`, `UPDATE_STEPS.md` and `TEST_RESULTS.md`.
6. Keep `.gitignore` from this package as well. Do not copy `node_modules` or `dist` from another project.
7. Run `npm ci`, then `npm run dev`.

The new dependency is `leaflet`. `npm ci` installs it from the included lockfile.

## Deploy on Vercel

### GitHub import

1. Push this complete project to your GitHub repository. The repository root or selected Vercel Root Directory must contain `package.json`.
2. In Vercel, choose Add New → Project and import the repository.
3. Select Vite as Framework Preset, Node 24.x, build command `npm run build` and output directory `dist`.
4. Deploy. No API key or environment variable is required for the default demo services.
5. Open `https://YOUR-PROJECT.vercel.app/` for the calculator and `https://YOUR-PROJECT.vercel.app/admin` for demo pricing.

`vercel.json` includes rewrites for `/admin` and `/admin/` so refreshing or directly opening the dashboard works on Vercel. Browser location access works on Vercel HTTPS, subject to permission and device capability.

### Vercel CLI

Inside the project:

```powershell
npx vercel
```

Sign in and follow the project prompts. After checking the preview, publish to production:

```powershell
npx vercel --prod
```

No Vercel deployment has been made in your account by this delivery.

## Commands

```powershell
npm test
npm run build
npm run preview
```

`npm run preview` serves the production build locally. It is not the deployment server used by Vercel.

## Main files

| File | Purpose |
| --- | --- |
| `src/App.jsx` | Calculator-only public page and route selection |
| `src/pages/AdminDashboard.jsx` | Rate management dashboard |
| `src/components/LocationSearch.jsx` | Debounced searchable address controls |
| `src/components/TripMap.jsx` | Live Leaflet map, markers and route |
| `src/hooks/useTripPlanner.js` | Current location, map points and quotation state |
| `src/hooks/useRates.js` | React subscription to saved demo rates |
| `src/lib/maps.js` | Photon, OSRM and device location integration |
| `src/lib/http.js` | Queuing, throttling, cancellation and caching |
| `src/lib/rates.js` | Rate validation, save/load and default restoration |
| `src/lib/pricing.js` | Fare math and city-name matching |
| `src/lib/trips.js` | Trip validation and stale-request guards |
| `src/data/cityRates.js` | Ten default city records |

## Troubleshooting

- **GPS denied or times out:** allow location access in the browser site settings and retry, or type the address. Desktop positioning can be approximate. Current location requires HTTPS or localhost.
- **No address suggestions:** type at least three characters and pause. Use city/sector/landmark names available in OpenStreetMap. If the public search service is unavailable, use the map pins.
- **Reverse lookup has no city:** the coordinates remain selected. Confirm the pickup city in the shown control.
- **No route found:** pick a point closer to an accessible road. The app will not substitute fake kilometres.
- **Provider busy:** wait and retry. Keep this short demo low-volume.
- **Blank map:** check internet access to OpenStreetMap tile images and click Retry if displayed. Network filters can block map providers.
- **Admin saved rate does not appear elsewhere:** settings are browser-local and origin-specific. Export/import on that browser, or change the defaults and redeploy.
- **`/admin` 404 on Vercel:** make sure the included `vercel.json` was deployed and your selected project root contains it.
- **PowerShell blocks npm.ps1:** use `npm.cmd ci` and `npm.cmd run dev`.

## Verification

See `TEST_RESULTS.md`. Core and React integration checks use deterministic network/map adapters. Real public search, reverse lookup, routing and tile requests were also checked from the development environment. Physical GPS and full browser visual QA remain device/environment-dependent. This is not a booking/payment backend.

## Official references

- [Leaflet documentation](https://leafletjs.com/reference.html)
- [Photon API](https://github.com/komoot/photon/blob/master/docs/api-v1.md)
- [Photon public demo policy](https://github.com/komoot/photon)
- [OSRM API](https://project-osrm.org/docs/v5.24.0/api/)
- [OSRM demo usage policy](https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server)
- [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/)
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)

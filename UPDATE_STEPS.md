# Aapke existing CityRide project ko update karne ke steps

Existing folder: `D:\Projects\CityRide\cityride`

## Recommended clean update

1. Purana terminal mein Ctrl+C se server stop karein.
2. Updated ZIP ko naye folder mein extract karein. Purana folder backup ke liye rehne dein.
3. Extracted `cityride-demo` folder VS Code mein open karein.
4. VS Code terminal mein `npm ci` aur `npm run dev` run karein.
5. Calculator kholein. `/admin` se city rates edit karein.

## Same existing folder mein update

Pehle existing project ka backup lein. Phir ZIP se:

- Entire `src/` folder replace karein.
- Entire `tests/` folder replace karein.
- `package.json` aur `package-lock.json` replace karein.
- `vercel.json`, `vite.config.js`, `index.html`, `.env.example` aur `.gitignore` replace karein.
- README, START_HERE, UPDATE_STEPS aur TEST_RESULTS replace karein.

`src/data/demoRoutes.js` old sample file remove ho gayi hai. New project Google Maps use nahi karta. Purani Google environment variables ko read nahi kiya jayega. New demo ke liye `.env.local` create karna zaruri nahi hai.

PowerShell:

```powershell
Set-Location "D:\Projects\CityRide\cityride"
npm ci
npm run dev
```

Vite terminal ka URL kholein. Default calculator `http://localhost:5173`, admin `http://localhost:5173/admin`.

## Vercel

GitHub mein updated source push karein. Vercel project import/deploy settings:

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Node | 24.x |
| Build command | npm run build |
| Output | dist |
| Root directory | package.json wala folder |
| Environment variables | Default demo ke liye none |

`vercel.json` include zarur karein; isi mein `/admin` direct-open/refresh rewrites hain.

## Changed and added source files

Changed: App.jsx, styles.css, LocationSearch.jsx, TripMap.jsx, useTripPlanner.js, maps.js, pricing.js, trips.js.

Added: pages/AdminDashboard.jsx, hooks/useRates.js, lib/rates.js, lib/http.js.

Existing cityRates.js same default city list rakhta hai. Admin changes browser storage mein save hote hain. Public website par city-rate table nahi hai.

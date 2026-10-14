# Open-source demo ko run karein

Google Maps API key, billing account aur backend ki zarurat nahi hai.

## Step 1

Updated ZIP ko naye folder mein extract karein. `cityride-demo` folder ko VS Code mein open karein. Node.js 24 installed hona chahiye.

## Step 2

Terminal mein:

```powershell
npm ci
npm run dev
```

Vite ka printed URL kholein. Usually `http://localhost:5173` hoga.

## Step 3

Calculator par:

1. Browser location permission allow karein, ya Use current location dabayein.
2. Pickup manually enter karna ho to search karke result select karein.
3. Drop bhi manually search kar sakte hain.
4. Dono fields ke Pick on map button se map par road point select kar sakte hain.
5. A/B pins drag karke dono locations adjust kar sakte hain.
6. Calculate fare dabayein. Actual road distance × pickup city rate se price milega.

Google key aur sample mode ab nahi hain. Public APIs ko internet connection chahiye. Route unavailable ho to clear error aayega; fake distance use nahi hogi.

## Step 4

Admin dashboard kholein:

```text
http://localhost:5173/admin
```

City ka per-km rate change karein → Save changes. Public calculator same browser mein updated rate use karega. City enable/disable bhi kar sakte hain.

**Demo limitation:** prices browser-local storage mein save hain, shared database mein nahi. Dusre device/browser mein Export JSON → Import JSON → Save changes use karein. Dashboard mein demo ke liye login nahi hai.

## Step 5

Production build aur checks:

```powershell
npm test
npm run build
```

Vercel par GitHub repo import karein. Framework Vite, Node 24.x, build `npm run build`, output `dist`. Koi API key environment variable nahi chahiye.

Hosted routes:

```text
https://YOUR-PROJECT.vercel.app/
https://YOUR-PROJECT.vercel.app/admin
```

Vercel `/admin` refresh support configuration included hai. More details README.md aur UPDATE_STEPS.md mein hain.

Yeh short, low-volume non-production demo hai. Public services ki availability guaranteed nahi hai; OSRM demo server ka use reasonable non-commercial evaluation tak restricted hai. Running commercial cab service ke liye permitted provider ya apna server use karein.

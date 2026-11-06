# SlipFlow

Bank-slip / receipt OCR ingestion demo, styled after the "Neon Tokyo" cyberpunk design system in `../req/DESIGN.md`.

## Stack

- Node.js + Express 5
- EJS templates
- Tailwind CSS (CDN, config in `views/partials/head.ejs`)

## Run

```
npm install
npm start
```

Then open http://localhost:3001.

## Pages

- `/login` — sign-in
- `/dashboard` — balance + recent slips overview
- `/upload-slip` — drag-and-drop slip ingestion (matches the mockup in `../req/code.html`)
- `/transactions` — full slip ledger
- `/reports` — spend breakdown by month and bank
- `/settings` — account and notification preferences

Data is in-memory (`data/store.js`) and resets on restart. Uploaded files are written to `public/uploads/`.

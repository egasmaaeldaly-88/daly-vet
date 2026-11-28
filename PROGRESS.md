# PROGRESS — Daly Track Vet

Read `CLAUDE.md` first. Update this file at the end of every step. Keep it short.

## Current state
- React + Vite + Tailwind, AR/EN toggle, light/dark. Demo state is in-memory (seed data in `src/mockData.js`), no backend, **no D1 database yet**.
- Tabs: Home, Check-in & waiting board (Step 1), **Consultation & estimate (Step 2)**, Passport (mock).
- Public owner page: `#/estimate/<uuid>` (hash route, no router library).
- Deployed on a Cloudflare **Pages** project connected to GitHub (build: `npm run build`, output: `dist`, no deploy command).

## Decisions
- Free tier only. `wa.me` links only. No paid APIs, no AI API calls.
- Demo first (browser state + seed data), real backend later.
- Brand "Daly Track" and the "Vet" tag are always Latin, in both languages (checked: no Arabic spelling anywhere in the repo).
- Visits and estimates live in `App.jsx` (in-memory). A reload resets the demo to the 3 seed visits.
- Check-in flow is forward-only: waiting → with vet → lab → ready for pickup (lab can be skipped).
- Phone input accepts 05xxxxxxxx / 5xxxxxxxx / +966… / 00966… / Arabic digits and stores `9665xxxxxxxx`.
- Kept infra identifiers `daly-vet` (Pages project `name`) and `daly-vet-db` (D1) in `wrangler.toml` / `package.json` scripts: renaming creates a new Pages project / DB.
- Step 2: the vet works on visits in the "with vet" column. Exam notes are typed or dictated (Web Speech API, Chrome only, Arabic `ar-SA` / English `en-US`, typing is always the fallback).
- Step 2: services are a fixed list in `src/services.js` (exam, blood test, X-ray, injection, vaccine) with **placeholder SAR prices** (100/120/150/50/90) — edit freely. Not a DB table on purpose.
- Step 2: the estimate has 3 options (basic / standard / full); every option needs at least one service and exam notes are required. One estimate per visit; once created it is locked.
- Step 2: the owner page shows pet name, exam summary and the 3 options only — never the owner's phone, name or address. The `wa.me` link (staff side) uses the visit phone.
- Step 2: in the demo the estimate link only works inside the same browser session (state is in memory). A link that opens on any phone needs D1 (later).
- Schema approved and added to `schema.sql` (not applied to D1 yet): `visits`, `estimates`. `invoice_items` comes in Step 3.
- Removed from the old mock: the Consult screen with fixed sample text and the "prescription preview" (printable prescription view is a later "small" item).

## Done
- Step 0: scaffold and first deploy.
- Step 1: rename to Daly Track Vet + check-in form and waiting board. `npm run build` passed on the owner's machine (Vite 5.4) and the deploy worked.
- Step 2: consultation + estimate + owner approval page + 2 new tables in `schema.sql` (validated in SQLite: creates cleanly, runs twice without errors, foreign keys work).
- Build status for Step 2: `npm run build` was **not run** here (sandbox has no network). Files were compiled with esbuild and server-rendered in a smoke test (both languages, empty/builder/sent/approved states, owner page has no phone or owner name). Not tested in a real browser: clicking, dictation, `wa.me`. Run `npm install && npm run build` and click through locally.

## Next step
- **Step 3**: charge guard — before closing the invoice, compare what the vet recorded (exam, X-ray, injection, vaccine, lab) with the invoice lines and flag anything missing. Needs the `invoice_items` table: show the schema diff and wait for approval first. Stop after it and wait for confirmation.

## Open questions
- Real service prices and the real clinic emergency phone number (placeholders for now).
- Target market confirmed as Saudi (SAR, 9665) — change if Egypt.

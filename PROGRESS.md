# PROGRESS — Daly Track Vet

Read `CLAUDE.md` first. Update this file at the end of every step. Keep it short.

## Current state
- React + Vite + Tailwind, AR/EN toggle, light/dark. Demo state is in-memory (seed data in `src/mockData.js`), no backend yet (D1 exists but is not connected, see below).
- Tabs: Home, Check-in & waiting board (Step 1), Consultation & estimate (Step 2), **Invoice / charge guard (Step 3)**, Passport (mock).
- Public owner page: `#/estimate/<uuid>` (hash route, no router library).
- Live: https://daly-vet.pages.dev — Cloudflare **Pages** project connected to GitHub repo `egasmaaeldaly-88/daly-vet` (branch `main`, build `npm run build`, output `dist`). Every push to `main` deploys automatically.
- Steps 1 and 2 are deployed and the owner clicked through them on the live site: all OK. Step 3 is written but **not built, not deployed, not tested in a browser** (see Done).
- **D1 exists** (`daly-vet-db`, `database_id` is set in `wrangler.toml` in the owner's repo). The 5 tables from `schema.sql` (`pets`, `vaccinations`, `medical_records`, `visits`, `estimates`) were created through the Cloudflare dashboard Console. The app does **not** read or write D1 yet and Pages has **no D1 binding** yet.

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
- Step 3 (schema approved by the owner): new table `invoice_items` (visit_id, service_id, qty, unit_price, `added_by_guard`) + 2 new columns on `visits`: `performed_json` (service ids the vet recorded as done) and `invoice_closed_at`. `added_by_guard` exists so Step 5 can count "missed charges caught" without another table.
- Step 3: "what the vet recorded" = a new card in the Consultation screen, "Services actually done" (same 5 services, tick boxes). It is separate from the estimate (the estimate is the plan, this is what was done).
- Step 3: the guard compares by service id only (present / not present), not by quantity. Missing services are shown live on the Invoice tab with "Add to invoice" (marks the line `byGuard`). Closing with something missing needs a second explicit click ("Yes, close without the missing services").
- Step 3: in the demo the data lives on the visit object in browser state (`performed`, `items`, `closedAt`), mirroring the D1 columns/table. A reload resets it. Invoice tab lists visits that are not "waiting" and not closed.
- Step 3: after an invoice is closed, the services card in Consultation is locked.
- Removed from the old mock: the Consult screen with fixed sample text and the "prescription preview" (printable prescription view is a later "small" item).

## Ops notes (learned the hard way)
- The owner works from the local clone `C:\KSA projects\daly-vet-repo` (Windows, PowerShell). Copying files into it comes from a zip that Claude produces; the real `wrangler.toml` in that clone has the real `database_id`, so **never overwrite `wrangler.toml` with the placeholder version** — edit it in place or leave it untouched.
- The sandbox where Claude works has no network: `npm install` / `npm run build` cannot run there. The owner runs `npm run build` locally and reports the result.
- If Pages stops deploying with "project is disconnected from your Git account", the fix is on the GitHub side: Settings → Applications → Cloudflare Workers & Pages → Configure → give access to the repo (or uninstall and reinstall the app).

## Done
- Step 0: scaffold and first deploy.
- Step 1: rename to Daly Track Vet + check-in form and waiting board. `npm run build` passed on the owner's machine (Vite 5.4) and the deploy worked.
- Step 2: consultation + estimate + owner approval page + 2 new tables in `schema.sql` (validated in SQLite, and created in the real D1). `npm run build` passes on the owner's machine (40 modules); deployed and checked on the live site by the owner.
- Step 3: charge guard. New `src/Invoice.jsx`; changed `schema.sql`, `src/services.js`, `src/i18n.js`, `src/Consult.jsx`, `src/App.jsx`, `PROGRESS.md`. `wrangler.toml` untouched. Verified in the sandbox only: `schema.sql` runs in SQLite (fresh DB, re-run, and existing-DB + ALTER path), guard functions tested with Node, JSX has no syntax errors, AR/EN keys match. **`npm run build` was NOT run (no network): the owner must run it.**
- **Owner action still needed in D1 Console (once):** `ALTER TABLE visits ADD COLUMN performed_json TEXT;` then `ALTER TABLE visits ADD COLUMN invoice_closed_at TEXT;` then the `CREATE TABLE IF NOT EXISTS invoice_items (...)` block from `schema.sql`. Do not re-run the ALTERs.

## Next step
- First: owner runs `npm run build` locally, clicks through Step 3 (record services in Consultation -> Invoice tab -> warning -> add -> close) and confirms.
- Then **Step 4** (not started): recall list — overdue/upcoming vaccines with a one-tap `wa.me` reminder. Stop after it and wait for confirmation.

## Open questions
- Real service prices and the real clinic emergency phone number (placeholders for now).
- Target market confirmed as Saudi (SAR, 9665) — change if Egypt.

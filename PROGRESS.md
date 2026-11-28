# PROGRESS — Daly Track Vet

Read `CLAUDE.md` first. Update this file at the end of every step. Keep it short.

## Current state
- React + Vite + Tailwind, AR/EN toggle, light/dark. Demo state is in-memory (seed data in `src/mockData.js`), no backend yet (D1 exists but is not connected, see below).
- Tabs: Home (also has the boarding/grooming status card), Check-in & waiting board, Consultation & estimate (also the prescription), Invoice / charge guard, Recall, Manager board, Passport. The mobile bottom nav scrolls sideways (7 tabs).
- Public owner page: `#/estimate/<uuid>` (hash route, no router library). Public passport: `/passport/<uuid>` (the URL inside the QR code; Cloudflare Pages serves `index.html` for unknown paths, so no `_redirects` file is needed) and `#/passport/<uuid>` (inside the demo, with a back button).
- Live: https://daly-vet.pages.dev — Cloudflare **Pages** project connected to GitHub repo `egasmaaeldaly-88/daly-vet` (branch `main`, build `npm run build`, output `dist`). Every push to `main` deploys automatically.
- Steps 1 to 4 are deployed and the owner clicked through them on the live site: all OK. **Step 5, Step 6 and the two small items (boarding/grooming status, printable prescription) are written but not built, not deployed, not tested by the owner** (see Done). This completes the planned demo.
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
- Step 4 (no schema change; `vaccinations.reminder_sent` already exists): new tab Recall. Status is **computed from the due date** (`overdue` if date passed, `soon` if within 30 days, else `ok`) by `daysUntilDue`/`vaccStatus` in `src/utils.js`; the old hardcoded `state` field in `mockData.js` is no longer used for logic. The Home "vaccines due soon" counter uses the same helper so both screens agree.
- Step 4: the WhatsApp button only opens `wa.me/<phone>?text=...` (no sending). Clicking marks the vaccination as "reminder message opened" in browser state (`reminded` in `App.jsx`, mirrors `reminder_sent`); the wording says "opened", not "sent", because we cannot know whether the person pressed send. Message text follows the UI language and avoids day counts (no Arabic plural issues).
- Step 4: mock vaccination dates are fixed (2026-12-02, 2026-11-10, 2027-02-15), so what the list shows changes as real days pass. Consider making seed dates relative to today before a client demo.
- Step 4: the mobile bottom nav now has 6 tabs (grid-cols-6); a 7th (Manager board, Step 5) will be too cramped, so decide how to handle the nav then (e.g. scrollable).
- Step 5: Manager board is computed only from browser state: revenue = sum of invoices closed today; missed charges = invoice lines with `byGuard` (count and SAR value, whole session); overdue vaccines = `vaccStatus` = overdue (button opens the Recall tab). **No-shows cannot be computed**: there is no appointment data (a new table would need approval). The card \"waiting over 60 minutes\" (`LONG_WAIT_MIN` in `src/Manager.jsx`) is shown instead and the screen says so in plain words.
- Step 6: public passport uses an allow-list of fields (`name, species, breed, weight, allergies` + vaccinations + approved summaries + clinic phone); owner name/phone are never passed to the component. Unknown uuid shows only \"link not found\". Approved summaries exist for the first demo pet only (mock). The clinic Passport tab now has a pet picker, the QR (encodes the real `/passport/<uuid>` URL) and an \"open public page\" button.
- Passport shows, per vaccine, **the date it was given** (`given`, mirrors `vaccinations.administered_date`) and the next due date. Owner request after seeing the QR page. Mock `given` dates were added to `src/mockData.js` (fake, 1 year before each due date; Deworming 2026-11-15). The public page still shows no owner data, invoices, estimates, prescriptions or exam notes; a fuller doctor-only history behind a PIN is an open idea for the backend phase.
- Small item, boarding/grooming: status buttons on Home per pet (`none | boarding | grooming`, mirrors `pets.boarding_status`, no schema change); the Home \"boarded\" counter follows it.
- Small item, prescription: free-text field on the visit (`visit.rx`, demo state) + a print view (`src/Prescription.jsx`, `window.print()`); `index.css` print rules force black on white (also in dark mode) and hide navigation. For D1 later it maps to `medical_records` with `record_type = 'prescription'` (no schema change). No drug list or dose calculator (out of scope).
- Removed from the old mock: the Consult screen with fixed sample text and the "prescription preview" (printable prescription view is a later "small" item).

## Ops notes (learned the hard way)
- The owner works from the local clone `C:\KSA projects\daly-vet-repo` (Windows, PowerShell). Copying files into it comes from a zip that Claude produces; the real `wrangler.toml` in that clone has the real `database_id`, so **never overwrite `wrangler.toml` with the placeholder version** — edit it in place or leave it untouched.
- The sandbox where Claude works has no network: `npm install` / `npm run build` cannot run there. The owner runs `npm run build` locally and reports the result.
- If Pages stops deploying with "project is disconnected from your Git account", the fix is on the GitHub side: Settings → Applications → Cloudflare Workers & Pages → Configure → give access to the repo (or uninstall and reinstall the app).

## Done
- Step 0: scaffold and first deploy.
- Step 1: rename to Daly Track Vet + check-in form and waiting board. `npm run build` passed on the owner's machine (Vite 5.4) and the deploy worked.
- Step 2: consultation + estimate + owner approval page + 2 new tables in `schema.sql` (validated in SQLite, and created in the real D1). `npm run build` passes on the owner's machine (40 modules); deployed and checked on the live site by the owner.
- Step 3: charge guard. New `src/Invoice.jsx`; changed `schema.sql`, `src/services.js`, `src/i18n.js`, `src/Consult.jsx`, `src/App.jsx`, `PROGRESS.md`. `wrangler.toml` untouched. Verified in the sandbox only: `schema.sql` runs in SQLite (fresh DB, re-run, and existing-DB + ALTER path), guard functions tested with Node, JSX has no syntax errors, AR/EN keys match. `npm run build` passed on the owner's machine and Step 3 was confirmed on the live site. Follow-up fix: in `src/Consult.jsx` the \"services done\" card now shows a clear orange notice and dimmed boxes once the invoice is closed (it used to lock silently, which looked like broken checkboxes).
- Step 4: recall list. New `src/Recall.jsx`; changed `src/App.jsx`, `src/i18n.js`, `src/utils.js`, `PROGRESS.md`. `schema.sql` and `wrangler.toml` untouched. Verified in the sandbox only: date logic (boundaries 0/30/31 days, invalid date), the real app bundled with esbuild and clicked in headless Chromium (Arabic and English; rows, sections, wa.me link, "opened" state), AR/EN keys match, no syntax errors. Tailwind styling was not rendered there. **`npm run build` was NOT run (no network): the owner must run it.**
- Step 4 confirmed by the owner on the live site (build and clicks OK).
- Step 5 + Step 6 + small items (one batch, authorised by the owner after Step 4). New: `src/Manager.jsx`, `src/Passport.jsx`, `src/Prescription.jsx`. Changed: `src/App.jsx` (new tabs, public passport route, boarding state, `PetImg` moved out), `src/ui.jsx` (`PetImg` now lives here), `src/Consult.jsx` (prescription card + print view), `src/i18n.js`, `src/utils.js` (`formatDueDate`), `src/index.css` (print rules), `PROGRESS.md`. `schema.sql` and `wrangler.toml` untouched. Verified in the sandbox only: the real app bundled with esbuild and clicked in headless Chromium (Arabic and English): boarding counter, Manager numbers after closing a guarded invoice (revenue 250, 1 missed charge worth 150), prescription view + print button + text kept after back, clinic passport tab, public page both via hash and via the real `/passport/<uuid>` path (SPA fallback server), unknown uuid, no owner name/phone in the public page, print CSS in dark mode. **Not verified: Tailwind styling (not rendered there), the mobile layout, a real print preview. `npm run build` was NOT run (no network): the owner must run it.**
- **Owner action still needed in D1 Console (once):** `ALTER TABLE visits ADD COLUMN performed_json TEXT;` then `ALTER TABLE visits ADD COLUMN invoice_closed_at TEXT;` then the `CREATE TABLE IF NOT EXISTS invoice_items (...)` block from `schema.sql`. Do not re-run the ALTERs.

## Next step
- First: owner runs `npm run build` locally and clicks through: Home (boarding buttons), Manager board (close an invoice, then check the numbers), Consultation (write a prescription, open the print view, real print preview), Passport tab (pick a pet, QR, open public page), and a phone-size check of the scrolling bottom nav and the public passport.
- The planned demo is then complete. Next phase (not started, wait for the owner): the real backend, one screen at a time (`/api/clinic/*` Pages Functions + D1 + `CLINIC_PIN`), starting with whichever screen the owner chooses; public routes (`/api/public/*`) for the estimate link and the passport so they open from any phone.

## Open questions
- Real service prices and the real clinic emergency phone number (placeholders for now).
- No-shows need appointments (a new `appointments` table, requires the owner's approval). Until then the Manager board shows long waits instead.
- Mock vaccination dates are fixed; make them relative to today before a client demo.
- Target market confirmed as Saudi (SAR, 9665) — change if Egypt.

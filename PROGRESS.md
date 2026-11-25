# PROGRESS — Daly Track Vet

Read `CLAUDE.md` first. Update this file at the end of every step. Keep it short.

## Current state
- React + Vite + Tailwind, AR/EN toggle, light/dark. Demo state is in-memory (seed data in `src/mockData.js`), no backend, **no D1 database yet**.
- Tabs: Home, **Check-in & waiting board (new)**, Consultation (mock), Passport (mock).
- Deployed on a Cloudflare **Pages** project connected to GitHub (build: `npm run build`, output: `dist`, no deploy command).

## Decisions
- Free tier only. `wa.me` links only. No paid APIs, no AI API calls.
- Demo first (browser state + seed data), real backend later.
- Brand "Daly Track" is always Latin (header lockup: wordmark + small "Vet" tag, forced LTR, in both languages).
- Visit state lives in `App.jsx` (in-memory, not localStorage), so a reload resets the demo to the 3 seed visits.
- Flow is forward-only: waiting → with vet → lab → ready for pickup. The lab step can be skipped (with vet → ready).
- Phone input accepts 05xxxxxxxx / 5xxxxxxxx / +966… / 00966… / Arabic digits and stores `9665xxxxxxxx`; invalid numbers are rejected.
- Kept infra identifiers `daly-vet` (Pages project `name`) and `daly-vet-db` (D1) in `wrangler.toml` / `package.json` scripts: renaming creates a new Pages project / DB. Only comments and the npm package name were renamed.
- Removed the old mock "Reception" tab (vaccine reminder list + boarding list); the recall list returns in Step 4, boarding/grooming status later.
- Consult mock text no longer mentions a dose helper (out of scope per CLAUDE.md).

## Done
- Step 0: scaffold and first deploy.
- Step 1: rename to Daly Track Vet (title, `i18n.js`, header/sidebar lockup, package name, wrangler comments) + check-in form and 4-column waiting board.
- Build status: `npm run build` was **not run** (sandbox has no network, `npm install` times out). The JSX was only compiled with esbuild and server-rendered in a smoke test. Run `npm install && npm run build` locally before trusting it.

## Next step
- **Step 2**: consultation + estimate (exam notes, services, 3-option estimate, public approval link). Schema diff for `visits`, `estimates`, `invoice_items` must be shown and approved first. Stop after it and wait for confirmation.

## Open questions
- Real clinic emergency phone number (placeholder for now).
- Target market confirmed as Saudi (SAR, 9665) — change if Egypt.

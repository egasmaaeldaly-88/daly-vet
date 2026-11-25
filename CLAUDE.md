# CLAUDE.md — Daly Track Vet

## 0. Brand and naming (applies everywhere)
- Company/brand: **Daly Track**. This product: **Vet** (a Daly Track product), shown as "Daly Track Vet" or "Daly Track · Vet Clinic".
- **Always write "Daly Track" in Latin letters, even inside the Arabic (RTL) UI.** Never translate or transliterate it into Arabic ("دالي" / "دالي تراك" are not allowed).
- Never use "Daly Vet" or "Daily" anywhere (UI, `<title>`, README, code comments, file names).
- Header lockup: `Daly Track` as the wordmark, with `Vet` as a smaller product tag next to or under it. In Arabic UI the wordmark and the tag stay Latin; surrounding text is Arabic.
- Apply this rename in step 1: `index.html` title, `src/i18n.js` (`app` key in both languages), header/sidebar, package name, and `wrangler.toml` comments.

## 1. What we are building
A cheap, simple system that runs a small vet clinic from A to Z, for clinics in Saudi Arabia (SAR, mobile numbers `9665xxxxxxxx`).
Goal now: a **clickable demo that feels real** (one pet's full visit, start to finish), then a thin real backend behind it.
Audience: clinic owners and staff who want something light, Arabic-first, and almost free to run.

## 2. Hard constraints (cost and simplicity) — never break these
- **Free tier only**: Cloudflare Pages + Pages Functions + D1. No paid APIs, services, or auth providers.
- **No WhatsApp Business API.** WhatsApp = `https://wa.me/<number>?text=<prefilled>` links only.
- **No AI API calls.** Optional voice dictation uses the browser Web Speech API (Chrome), always with typing as fallback.
- Libraries: `react`, `vite`, `tailwindcss`, `qrcode.react`. Ask before adding anything else.
- Backend stays simple: one Function per resource, parameterized D1 queries (`db.prepare(...).bind(...)`), no ORM, no queues, no cron, no email.
- No Node-only modules (`fs`, `path`, heavy PDF/SSR libs). Printing uses `window.print()`.

## 3. Existing repo state
A React + Vite + Tailwind scaffold already exists and builds on Cloudflare Pages (`npm run build` → `dist`, no deploy command, `wrangler.toml` uses `pages_build_output_dir = "dist"`).
Reuse: `src/i18n.js` (AR/EN dictionary), light/dark theme, emerald + cream palette, and the pet images in `public/images/dog-3d.jpg` and `cat-3d.jpg` (use sparingly). Replace the current mock screens as needed.

## 4. Features — build in this order, one at a time
1. **Check-in + waiting board**: register pet and owner (auto-format phone), then move the visit through *waiting → with vet → lab → ready for pickup*.
2. **Consultation + estimate**: vet records exam notes, picks services, and builds a written estimate with 3 options (basic / standard / full). Owner approves via a public link.
3. **Charge guard**: before closing the invoice, compare what the vet recorded (exam, X-ray, injection, vaccine, lab) with the invoice lines and flag anything missing.
4. **Recall list**: overdue or upcoming vaccines with a one-tap `wa.me` reminder.
5. **Manager board**: today's revenue, missed charges caught, no-shows, overdue vaccines — computed from existing data, no extra tables.
6. **Digital health passport** `/passport/:uuid`: public, read-only, via QR.

Also small: boarding/grooming status field, printable prescription view.
**Out of scope until asked**: inventory, payments, AI scribe, owner mobile app, multi-branch, dose calculator.

## 5. Build approach
- **Demo first**: seed data and state live in the browser (in-memory, optionally localStorage) so the whole visit flow clicks through with no backend.
- **Then real**: swap each screen to `/api/clinic/*` + D1, one feature at a time.
- Start from the existing `schema.sql`. New tables are allowed only for `visits`, `estimates`, `invoice_items`. Show the schema diff and wait for approval before applying.

## 6. Security and privacy
- Public routes (`/api/public/*`, passport, estimate link) **never** expose owner phone, ID, or address.
- Public links use `crypto.randomUUID()`, never sequential ids.
- All `/api/clinic/*` routes require a single clinic PIN stored as a Cloudflare secret (`CLINIC_PIN`).
- Any clinical suggestion must be labeled as reference assistance, not a diagnosis.

## 7. UI rules
- Arabic (RTL) first, English (LTR) toggle; light/dark toggle; mobile-first.
- Plain, friendly copy; buttons say exactly what they do.
- Do not invent external image URLs or generate extra images.

## 8. How to work
- Start every session by reading this file and `PROGRESS.md`.
- Do **one step**, list every file created or modified, run `npm run build`, then stop and wait for my confirmation.
- At the end of every step, update `PROGRESS.md` (what was done, decisions made, the exact next step). Keep it short.
- If something is unclear, ask. Don't guess and don't add unrequested features.
- Never claim a build passed unless you actually ran it. If the environment can't run it, say so.

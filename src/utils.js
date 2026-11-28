// Small helpers for Step 1 (check-in + waiting board).

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/** Convert Arabic-Indic / Persian digits to Latin digits. */
export const toLatinDigits = (s) =>
  String(s)
    .replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d))
    .replace(/[۰-۹]/g, (d) => FA_DIGITS.indexOf(d))

/**
 * Normalise a Saudi mobile number to `9665xxxxxxxx` (12 digits).
 * Accepts: 05xxxxxxxx, 5xxxxxxxx, 9665xxxxxxxx, +966 5x xxx xxxx, 009665xxxxxxxx,
 * 966 05xxxxxxxx, and Arabic-Indic digits. Returns null when the number is not valid.
 */
export function normalizeSaPhone(input) {
  let d = toLatinDigits(input).replace(/\D/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('966')) d = d.slice(3)
  if (d.startsWith('0')) d = d.slice(1)
  return /^5\d{8}$/.test(d) ? `966${d}` : null
}

/** `966500000001` -> `+966 50 000 0001` (display only). */
export function formatSaPhone(p) {
  const m = /^966(5\d)(\d{3})(\d{4})$/.exec(p || '')
  return m ? `+966 ${m[1]} ${m[2]} ${m[3]}` : p
}

/** Pick the right language from a bilingual `{ ar, en }` value, or return a plain string as-is. */
export const tx = (v, lang) => (typeof v === 'string' ? v : v?.[lang] ?? '')

// Step 4 — recall list. A vaccination is `overdue` when its due date has passed, `soon` when it falls
// within RECALL_WINDOW_DAYS, otherwise `ok`. Computed from the date (no stored state).
export const RECALL_WINDOW_DAYS = 30

/** Whole days from today to a `YYYY-MM-DD` due date (negative = overdue, 0 = today). NaN if the date is invalid. */
export function daysUntilDue(due, now = new Date()) {
  const [y, m, d] = String(due).split('-').map(Number)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((new Date(y, m - 1, d) - today) / 86400000)
}

export function vaccStatus(due, now) {
  const n = daysUntilDue(due, now)
  return n < 0 ? 'overdue' : n <= RECALL_WINDOW_DAYS ? 'soon' : 'ok'
}

/** `2026-12-02` -> localized short date (parsed as a local date, so no timezone shift). */
export function formatDueDate(due, lang) {
  const [y, m, d] = String(due).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

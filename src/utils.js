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

// Fixed service list for the estimate builder (Step 2). Prices are placeholders in SAR — edit freely.
// Kept in code (not a DB table) on purpose: CLAUDE.md allows new tables only for visits, estimates, invoice_items.
export const SERVICES = [
  { id: 'exam', name: { ar: 'كشف عام', en: 'General exam' }, price: 100 },
  { id: 'lab', name: { ar: 'تحليل دم', en: 'Blood test' }, price: 120 },
  { id: 'xray', name: { ar: 'أشعة', en: 'X-ray' }, price: 150 },
  { id: 'injection', name: { ar: 'حقنة', en: 'Injection' }, price: 50 },
  { id: 'vaccine', name: { ar: 'تطعيم', en: 'Vaccine' }, price: 90 },
]

export const OPTIONS = ['basic', 'standard', 'full']
export const emptyDraft = () => ({ basic: [], standard: [], full: [] })

export const optionTotal = (ids) =>
  ids.reduce((sum, id) => sum + (SERVICES.find((s) => s.id === id)?.price ?? 0), 0)

export const money = (n, lang) => (lang === 'ar' ? `${n} ر.س` : `SAR ${n}`)

// Step 3 — charge guard.
export const findService = (id) => SERVICES.find((s) => s.id === id)

/** Ids the vet recorded as done that have no line on the invoice (matched by service id, not quantity). */
export const missingServices = (performed = [], items = []) =>
  performed.filter((id) => !items.some((i) => i.serviceId === id))

export const invoiceTotal = (items = []) => items.reduce((sum, i) => sum + i.qty * i.price, 0)

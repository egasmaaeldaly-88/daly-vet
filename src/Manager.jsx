import { Card } from './ui.jsx'
import { invoiceTotal, money } from './services.js'
import { vaccStatus } from './utils.js'

// There is no appointment data yet, so a real "no-show" cannot be computed. We measure long waits instead.
export const LONG_WAIT_MIN = 60

const sameDay = (ts, now) => {
  const a = new Date(ts), b = new Date(now)
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function Stat({ label, value, note, children }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h3 className="text-sm font-medium text-muted">{label}</h3>
      <div className="mt-1 text-3xl font-bold text-brand">{value}</div>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      {children}
    </section>
  )
}

/** Manager board: everything is computed from the visits, invoices and vaccinations that already exist. */
export default function Manager({ t, lang, visits, vaccinations, onOpenRecall }) {
  const now = Date.now()
  const closedToday = visits.filter((v) => v.closedAt && sameDay(v.closedAt, now))
  const revenue = closedToday.reduce((sum, v) => sum + invoiceTotal(v.items ?? []), 0)
  const caught = visits.flatMap((v) => (v.items ?? []).filter((i) => i.byGuard))
  const caughtValue = caught.reduce((sum, i) => sum + i.qty * i.price, 0)
  const longWaits = visits.filter((v) => v.status === 'waiting' && now - v.at > LONG_WAIT_MIN * 60000).length
  const overdue = vaccinations.filter((v) => vaccStatus(v.due) === 'overdue').length

  return (
    <div className="space-y-6">
      <Card title={t.manager.title}>
        <p className="text-sm text-muted">{t.manager.hint}</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t.manager.revenue} value={money(revenue, lang)} note={t.manager.revenueNote(closedToday.length)} />
        <Stat label={t.manager.missed} value={caught.length} note={t.manager.missedNote(money(caughtValue, lang))} />
        <Stat label={t.manager.waits(LONG_WAIT_MIN)} value={longWaits} note={t.manager.waitsNote} />
        <Stat label={t.manager.overdue} value={overdue}>
          <button type="button" onClick={onOpenRecall} className="mt-3 rounded-full border border-line px-3.5 py-1.5 text-sm hover:bg-sunk">{t.manager.openRecall}</button>
        </Stat>
      </div>
      <p className="text-sm text-muted">{t.manager.noShowNote}</p>
    </div>
  )
}

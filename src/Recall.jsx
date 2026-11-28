import { Card, Chip } from './ui.jsx'
import { tx, formatSaPhone, daysUntilDue, vaccStatus, RECALL_WINDOW_DAYS } from './utils.js'

const btn = 'inline-block rounded-full bg-brand px-3.5 py-1.5 text-sm font-medium text-brand-ink hover:opacity-90'
const btnGhost = 'inline-block rounded-full border border-line px-3.5 py-1.5 text-sm font-medium hover:bg-sunk'

function Row({ r, t, lang, fmt, sent, onReminded }) {
  const { v, pet, days } = r
  const overdue = days < 0
  const owner = tx(pet.owner, lang)
  const href = `https://wa.me/${pet.phone}?text=${encodeURIComponent(
    t.recall.wa(owner, tx(pet.name, lang), tx(v.vaccine, lang), fmt(v.due), overdue))}`
  const when = overdue ? t.recall.late(-days) : days === 0 ? t.recall.today : t.recall.in(days)
  return (
    <li className="rounded-xl border border-line bg-sunk p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{tx(pet.name, lang)} <span className="font-normal text-muted">· {t.species[pet.species]}</span></span>
        <Chip tone={overdue ? 'warn' : 'ok'}>{when}</Chip>
      </div>
      <div className="mt-1 text-sm">{tx(v.vaccine, lang)} · <span className="text-muted">{t.recall.due}: {fmt(v.due)}</span></div>
      <div className="mt-1 text-sm text-muted">{t.recall.owner}: {owner} · <span dir="ltr">{formatSaPhone(pet.phone)}</span></div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a href={href} target="_blank" rel="noreferrer" onClick={() => onReminded(v.id)} className={sent ? btnGhost : btn}>
          {sent ? t.recall.resend : t.recall.send}
        </a>
        {sent && <span role="status" className="text-sm font-medium text-brand">{t.recall.sent}</span>}
      </div>
    </li>
  )
}

function Section({ id, title, rows, t, lang, fmt, reminded, onReminded }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 id={id} className="font-semibold">{title}</h3>
        <Chip tone="warn">{rows.length}</Chip>
      </div>
      {rows.length === 0
        ? <p className="rounded-xl border border-dashed border-line p-3 text-center text-sm text-muted">{t.recall.empty}</p>
        : <ul className="space-y-3">{rows.map((r) => (
            <Row key={r.v.id} r={r} t={t} lang={lang} fmt={fmt} sent={reminded.includes(r.v.id)} onReminded={onReminded} />
          ))}</ul>}
    </section>
  )
}

export default function Recall({ t, lang, pets, vaccinations, reminded, onReminded }) {
  const locale = lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB'
  const fmt = (d) => {
    const [y, m, day] = String(d).split('-').map(Number)
    return new Date(y, m - 1, day).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
  }
  const rows = vaccinations
    .map((v) => ({ v, pet: pets.find((p) => p.id === v.petId), days: daysUntilDue(v.due) }))
    .filter((r) => r.pet && vaccStatus(r.v.due) !== 'ok')
    .sort((a, b) => a.days - b.days)
  const common = { t, lang, fmt, reminded, onReminded }

  return (
    <div className="space-y-6">
      <Card title={t.recall.title}>
        <p className="text-sm text-muted">{t.recall.intro(RECALL_WINDOW_DAYS)}</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Section id="recall-overdue" title={t.recall.overdue} rows={rows.filter((r) => r.days < 0)} {...common} />
        <Section id="recall-soon" title={t.recall.soon(RECALL_WINDOW_DAYS)} rows={rows.filter((r) => r.days >= 0)} {...common} />
      </div>
    </div>
  )
}

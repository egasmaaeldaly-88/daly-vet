import { useState } from 'react'
import { Card, Chip } from './ui.jsx'
import { normalizeSaPhone, formatSaPhone } from './utils.js'

// Flow order. A visit can skip the lab (with_vet -> ready).
const COLUMNS = ['waiting', 'with_vet', 'lab', 'ready']
const NEXT = { waiting: ['with_vet'], with_vet: ['lab', 'ready'], lab: ['ready'], ready: [] }

const text = (v, lang) => (typeof v === 'string' ? v : v?.[lang] ?? '')

const inputCls = (bad) =>
  `w-full rounded-xl border bg-card px-3 py-2.5 outline-none focus:border-brand ${bad ? 'border-warn' : 'border-line'}`

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {error ? <p id={`${id}-msg`} className="mt-1 text-xs text-warn">{error}</p>
        : hint ? <p id={`${id}-msg`} className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

function CheckInForm({ t, lang, onAdd }) {
  const [f, setF] = useState({ name: '', species: 'dog', owner: '', phone: '', reason: '' })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState('')
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setDone('') }
  const phone = normalizeSaPhone(f.phone)

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (!f.name.trim()) err.name = t.checkin.required
    if (!f.owner.trim()) err.owner = t.checkin.required
    if (!f.phone.trim()) err.phone = t.checkin.required
    else if (!phone) err.phone = t.checkin.phoneBad
    setErrors(err)
    if (Object.keys(err).length) return
    onAdd({
      id: `vis-${Date.now()}`, name: f.name.trim(), species: f.species, owner: f.owner.trim(),
      phone, reason: f.reason.trim(), status: 'waiting', at: Date.now(),
    })
    setDone(t.checkin.added(f.name.trim()))
    setF({ name: '', species: 'dog', owner: '', phone: '', reason: '' })
  }

  return (
    <Card title={t.checkin.title}>
      <form onSubmit={submit} noValidate>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field id="ci-name" label={t.checkin.petName} error={errors.name}>
            <input id="ci-name" value={f.name} onChange={set('name')} className={inputCls(errors.name)}
              aria-invalid={!!errors.name} aria-describedby={errors.name ? 'ci-name-msg' : undefined} autoComplete="off" />
          </Field>
          <div>
            <span className="mb-1 block text-sm font-medium" id="ci-species-l">{t.checkin.species}</span>
            <div role="group" aria-labelledby="ci-species-l" className="flex gap-2">
              {['dog', 'cat'].map((s) => (
                <button type="button" key={s} aria-pressed={f.species === s} onClick={() => setF({ ...f, species: s })}
                  className={`flex-1 rounded-xl border px-3 py-2.5 ${f.species === s ? 'border-brand bg-tint font-semibold text-brand' : 'border-line text-muted hover:bg-sunk'}`}>
                  {t.species[s]}
                </button>
              ))}
            </div>
          </div>
          <Field id="ci-owner" label={t.checkin.ownerName} error={errors.owner}>
            <input id="ci-owner" value={f.owner} onChange={set('owner')} className={inputCls(errors.owner)}
              aria-invalid={!!errors.owner} aria-describedby={errors.owner ? 'ci-owner-msg' : undefined} autoComplete="off" />
          </Field>
          <Field id="ci-phone" label={t.checkin.phone} error={errors.phone}
            hint={phone ? `✓ ${formatSaPhone(phone)}` : t.checkin.phoneHint}>
            <input id="ci-phone" dir="ltr" inputMode="tel" value={f.phone} onChange={set('phone')}
              onBlur={() => phone && setF((x) => ({ ...x, phone }))} placeholder="05xxxxxxxx"
              className={`${inputCls(errors.phone)} text-start`} aria-invalid={!!errors.phone}
              aria-describedby="ci-phone-msg" autoComplete="off" />
          </Field>
        </div>
        <div className="mt-4 grid items-end gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Field id="ci-reason" label={t.checkin.reason}>
              <input id="ci-reason" value={f.reason} onChange={set('reason')} className={inputCls(false)} autoComplete="off" />
            </Field>
          </div>
          <button type="submit" className="rounded-xl bg-brand px-4 py-2.5 font-semibold text-brand-ink hover:opacity-90">{t.checkin.submit}</button>
        </div>
        <p role="status" className="mt-3 min-h-5 text-sm font-medium text-brand">{done}</p>
      </form>
    </Card>
  )
}

function VisitCard({ v, t, lang, onMove }) {
  const time = new Date(v.at).toLocaleTimeString(lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB', { hour: '2-digit', minute: '2-digit' })
  const reason = text(v.reason, lang)
  return (
    <li className="rounded-xl border border-line bg-sunk p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{text(v.name, lang)}</span>
        <Chip>{t.species[v.species]}</Chip>
      </div>
      <div className="mt-1 text-sm text-muted">{text(v.owner, lang)} · <span dir="ltr">{formatSaPhone(v.phone)}</span></div>
      {reason && <div className="mt-1 text-sm">{reason}</div>}
      <div className="mt-1 text-xs text-muted">{t.board.arrived} {time}</div>
      {NEXT[v.status].length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {NEXT[v.status].map((to) => (
            <button key={to} onClick={() => onMove(v.id, to)}
              className="rounded-full bg-brand px-3 py-1.5 text-sm font-medium text-brand-ink hover:opacity-90">{t.board.act[to]}</button>
          ))}
        </div>
      )}
    </li>
  )
}

export default function CheckIn({ t, lang, visits, setVisits }) {
  const add = (v) => setVisits((vs) => [...vs, v])
  const move = (id, status) => setVisits((vs) => vs.map((v) => (v.id === id ? { ...v, status } : v)))
  return (
    <div className="space-y-6">
      <CheckInForm t={t} lang={lang} onAdd={add} />
      <section aria-labelledby="board-title">
        <h2 id="board-title" className="mb-3 text-lg font-semibold">{t.board.title}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const list = visits.filter((v) => v.status === col).sort((a, b) => a.at - b.at)
            return (
              <div key={col} className="rounded-2xl border border-line bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">{t.board.col[col]}</h3>
                  <Chip tone={col === 'ready' ? 'ok' : 'warn'}>{list.length}</Chip>
                </div>
                {list.length === 0
                  ? <p className="rounded-xl border border-dashed border-line p-3 text-center text-sm text-muted">{t.board.empty}</p>
                  : <ul className="space-y-3">{list.map((v) => <VisitCard key={v.id} v={v} t={t} lang={lang} onMove={move} />)}</ul>}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

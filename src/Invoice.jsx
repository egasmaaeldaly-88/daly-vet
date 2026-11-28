import { useState } from 'react'
import { Card, Chip } from './ui.jsx'
import { SERVICES, findService, missingServices, invoiceTotal, money } from './services.js'
import { tx } from './utils.js'

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`

const btn = 'rounded-xl bg-brand px-4 py-2.5 font-semibold text-brand-ink hover:opacity-90'
const btnGhost = 'rounded-xl border border-line px-4 py-2.5 font-semibold hover:bg-sunk'

export default function Invoice({ t, lang, visits, setVisits }) {
  const open = visits.filter((v) => v.status !== 'waiting' && !v.closedAt)
  const [sel, setSel] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const [notice, setNotice] = useState('')
  const visit = open.find((v) => v.id === sel) ?? open[0]

  const patch = (p) => visit && setVisits((vs) => vs.map((v) => (v.id === visit.id ? { ...v, ...p } : v)))

  const notices = notice ? <p role="status" className="rounded-xl bg-tint px-4 py-2.5 text-sm font-medium text-brand">{notice}</p> : null

  if (!visit) {
    return (
      <div className="space-y-4">
        {notices}
        <Card title={t.invoice.queueTitle}>
          <p className="rounded-xl border border-dashed border-line p-4 text-center text-muted">{t.invoice.none}</p>
        </Card>
      </div>
    )
  }

  const items = visit.items ?? []
  const performed = visit.performed ?? []
  const missing = missingServices(performed, items)

  const addService = (sid, byGuard = false) => {
    const svc = findService(sid)
    if (!svc) return
    setConfirm(false)
    const exists = items.find((i) => i.serviceId === sid)
    patch({
      items: exists
        ? items.map((i) => (i.serviceId === sid ? { ...i, qty: i.qty + 1 } : i))
        : [...items, { id: makeId(), serviceId: sid, qty: 1, price: svc.price, byGuard }],
    })
  }
  const addAllMissing = () => {
    setConfirm(false)
    patch({
      items: [...items, ...missing.map((sid) => ({ id: makeId(), serviceId: sid, qty: 1, price: findService(sid).price, byGuard: true }))],
    })
  }
  const removeItem = (id) => { setConfirm(false); patch({ items: items.filter((i) => i.id !== id) }) }

  const doClose = () => {
    setNotice(t.invoice.closedOk(tx(visit.name, lang), money(invoiceTotal(items), lang)))
    setConfirm(false)
    patch({ closedAt: Date.now() })
  }
  // The guard: if the vet recorded something that is not on the invoice, ask for a second, explicit click.
  const tryClose = () => (missing.length > 0 ? setConfirm(true) : doClose())

  const name = (sid) => tx(findService(sid)?.name, lang)

  return (
    <div className="space-y-6">
      {notices}
      <Card title={t.invoice.queueTitle}>
        <div className="flex flex-wrap gap-2">
          {open.map((v) => (
            <button key={v.id} type="button" aria-pressed={v.id === visit.id}
              onClick={() => { setSel(v.id); setConfirm(false); setNotice('') }}
              className={`rounded-full border px-4 py-1.5 text-sm ${v.id === visit.id ? 'border-brand bg-tint font-semibold text-brand' : 'border-line text-muted hover:bg-sunk'}`}>
              {tx(v.name, lang)}
            </button>
          ))}
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-sunk p-3"><dt className="text-muted">{t.consult.patient}</dt><dd className="font-medium">{tx(visit.name, lang)} · {t.species[visit.species]}</dd></div>
          <div className="rounded-xl bg-sunk p-3"><dt className="text-muted">{t.consult.owner}</dt><dd className="font-medium">{tx(visit.owner, lang)}</dd></div>
          <div className="rounded-xl bg-sunk p-3"><dt className="text-muted">{t.consult.reason}</dt><dd className="font-medium">{tx(visit.reason, lang) || '—'}</dd></div>
        </dl>
      </Card>

      <Card title={t.invoice.recorded}>
        {performed.length === 0 ? (
          <p className="text-sm text-muted">{t.invoice.noneRecorded}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {performed.map((sid) => (
              <li key={sid} className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm">
                <span>{name(sid)}</span>
                <Chip tone={missing.includes(sid) ? 'warn' : 'ok'}>{missing.includes(sid) ? t.invoice.notBilled : t.invoice.billed}</Chip>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {missing.length > 0 ? (
        <section role="status" className="rounded-2xl border border-warn bg-warn-tint p-5 text-warn">
          <h2 className="text-lg font-semibold">{t.invoice.guardTitle}</h2>
          <ul className="mt-3 space-y-2">
            {missing.map((sid) => (
              <li key={sid} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-3 py-2 text-ink">
                <span className="font-medium">{name(sid)} <span className="text-sm text-muted">· {money(findService(sid).price, lang)}</span></span>
                <button type="button" onClick={() => addService(sid, true)} className="rounded-full bg-brand px-3 py-1.5 text-sm font-medium text-brand-ink hover:opacity-90">{t.invoice.addMissing}</button>
              </li>
            ))}
          </ul>
          {missing.length > 1 && (
            <button type="button" onClick={addAllMissing} className={`${btn} mt-3`}>{t.invoice.addAll}</button>
          )}
        </section>
      ) : performed.length > 0 ? (
        <p role="status" className="rounded-xl bg-tint px-4 py-2.5 text-sm font-medium text-brand">{t.invoice.guardOk}</p>
      ) : null}

      <Card title={t.invoice.lines}>
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">{t.invoice.noLines}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr>
                  <th scope="col" className="p-2 text-start font-medium">{t.invoice.service}</th>
                  <th scope="col" className="p-2 text-center font-medium">{t.invoice.qty}</th>
                  <th scope="col" className="p-2 text-center font-medium">{t.invoice.price}</th>
                  <th scope="col" className="p-2 text-center font-medium">{t.invoice.lineTotal}</th>
                  <th scope="col" className="p-2"><span className="sr-only">{t.invoice.remove}</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t border-line">
                    <th scope="row" className="p-2 text-start font-normal">{name(i.serviceId)}</th>
                    <td className="p-2 text-center">{i.qty}</td>
                    <td className="p-2 text-center">{money(i.price, lang)}</td>
                    <td className="p-2 text-center">{money(i.qty * i.price, lang)}</td>
                    <td className="p-2 text-end">
                      <button type="button" onClick={() => removeItem(i.id)} aria-label={t.invoice.removeLine(name(i.serviceId))}
                        className="rounded-full border border-line px-3 py-1 text-xs hover:bg-sunk">{t.invoice.remove}</button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-line font-semibold">
                  <th scope="row" colSpan={3} className="p-2 text-start">{t.invoice.total}</th>
                  <td className="p-2 text-center text-brand">{money(invoiceTotal(items), lang)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 text-sm font-medium" id="inv-add-l">{t.invoice.add}</div>
          <div role="group" aria-labelledby="inv-add-l" className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button key={s.id} type="button" onClick={() => addService(s.id)}
                className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:bg-sunk">+ {tx(s.name, lang)}</button>
            ))}
          </div>
        </div>

        {confirm ? (
          <div role="alert" className="mt-5 rounded-xl border border-warn bg-warn-tint p-4 text-warn">
            <p className="font-medium">{t.invoice.confirmText(missing.length)}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={doClose} className={btn}>{t.invoice.closeAnyway}</button>
              <button type="button" onClick={() => setConfirm(false)} className={`${btnGhost} text-ink`}>{t.invoice.cancel}</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={tryClose} className={`${btn} mt-5`}>{t.invoice.close}</button>
        )}
      </Card>
    </div>
  )
}

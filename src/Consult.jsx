import { useEffect, useRef, useState } from 'react'
import { Card, Chip } from './ui.jsx'
import { SERVICES, OPTIONS, emptyDraft, optionTotal, money } from './services.js'
import { tx } from './utils.js'

// Browser Web Speech API (Chrome). No server, no paid service. Typing always works as a fallback.
const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

function useDictation(lang, onText) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(false)
  const rec = useRef(null)
  const cb = useRef(onText)
  cb.current = onText

  const start = () => {
    if (!SR) return
    setError(false)
    const r = new SR()
    r.lang = lang === 'ar' ? 'ar-SA' : 'en-US'
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) cb.current(e.results[i][0].transcript.trim())
      }
    }
    r.onerror = () => { setError(true); setListening(false) }
    r.onend = () => setListening(false)
    rec.current = r
    r.start()
    setListening(true)
  }
  const stop = () => rec.current?.stop()
  useEffect(() => () => rec.current?.abort?.(), [])
  return { supported: !!SR, listening, error, start, stop }
}

const makeUuid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`

export const estimateLink = (uuid) => `${location.origin}${location.pathname}#/estimate/${uuid}`

export default function Consult({ t, lang, visits, setVisits, estimates, setEstimates }) {
  const queue = visits.filter((v) => v.status === 'with_vet')
  const [sel, setSel] = useState(null)
  const [err, setErr] = useState('')
  const visit = queue.find((v) => v.id === sel) ?? queue[0]

  const patch = (p) => visit && setVisits((vs) => vs.map((v) => (v.id === visit.id ? { ...v, ...p } : v)))
  const live = useRef({})
  live.current = { exam: visit?.exam || '', patch }
  const dict = useDictation(lang, (txt) => live.current.patch({ exam: `${live.current.exam} ${txt}`.trim() }))
  useEffect(() => { dict.stop() }, [visit?.id])

  if (!visit) {
    return (
      <Card title={t.consult.queueTitle}>
        <p className="rounded-xl border border-dashed border-line p-4 text-center text-muted">{t.consult.none}</p>
      </Card>
    )
  }

  const draft = visit.draft ?? emptyDraft()
  const est = estimates.find((e) => e.visitId === visit.id)
  const toggle = (opt, sid) =>
    patch({ draft: { ...draft, [opt]: draft[opt].includes(sid) ? draft[opt].filter((x) => x !== sid) : [...draft[opt], sid] } })

  const send = () => {
    if (!(visit.exam || '').trim()) return setErr(t.consult.needExam)
    if (OPTIONS.some((o) => draft[o].length === 0)) return setErr(t.consult.needAll)
    setErr('')
    setEstimates((es) => [...es, {
      id: `est-${Date.now()}`, visitId: visit.id, uuid: makeUuid(),
      pet: visit.name, species: visit.species, exam: visit.exam.trim(),
      options: draft, status: 'sent', approved: null, at: Date.now(),
    }])
  }

  const waHref = est && `https://wa.me/${visit.phone}?text=${encodeURIComponent(t.consult.wa(tx(visit.name, lang), estimateLink(est.uuid)))}`
  const btn = 'rounded-xl bg-brand px-4 py-2.5 font-semibold text-brand-ink hover:opacity-90'

  return (
    <div className="space-y-6">
      <Card title={t.consult.queueTitle}>
        <div className="flex flex-wrap gap-2">
          {queue.map((v) => (
            <button key={v.id} type="button" aria-pressed={v.id === visit.id} onClick={() => { setSel(v.id); setErr('') }}
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

      <Card title={t.consult.exam}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="exam-notes" className="text-sm font-medium">{t.consult.examLabel}</label>
          {dict.supported && (
            <button type="button" aria-pressed={dict.listening} onClick={dict.listening ? dict.stop : dict.start}
              className={`rounded-full border px-3.5 py-1.5 text-sm ${dict.listening ? 'border-brand bg-tint font-semibold text-brand' : 'border-line hover:bg-sunk'}`}>
              {dict.listening ? t.consult.dictateStop : t.consult.dictate}
            </button>
          )}
        </div>
        <textarea id="exam-notes" rows={5} value={visit.exam || ''} onChange={(e) => patch({ exam: e.target.value })}
          placeholder={t.consult.examPh} disabled={!!est}
          className="w-full rounded-xl border border-line bg-card px-3 py-2.5 outline-none focus:border-brand disabled:opacity-70" />
        <p role="status" className="mt-2 min-h-5 text-xs text-muted">
          {!dict.supported ? t.consult.dictateNA : dict.error ? t.consult.dictateErr : dict.listening ? t.consult.listening : ''}
        </p>
      </Card>

      {est ? (
        <Card title={t.consult.sent}>
          <div className="mb-4"><Chip tone={est.approved ? 'ok' : 'warn'}>{est.approved ? t.consult.statusApproved(t.consult.opt[est.approved]) : t.consult.statusSent}</Chip></div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {OPTIONS.map((o) => (
              <li key={o} className={`rounded-xl border p-3 ${est.approved === o ? 'border-brand bg-tint' : 'border-line bg-sunk'}`}>
                <div className="text-sm text-muted">{t.consult.opt[o]}</div>
                <div className="text-lg font-bold">{money(optionTotal(est.options[o]), lang)}</div>
              </li>
            ))}
          </ul>
          <label htmlFor="est-link" className="mt-4 block text-sm font-medium">{t.consult.link}</label>
          <input id="est-link" readOnly dir="ltr" value={estimateLink(est.uuid)} onFocus={(e) => e.target.select()}
            className="mt-1 w-full rounded-xl border border-line bg-sunk px-3 py-2 text-sm text-start" />
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={waHref} target="_blank" rel="noreferrer" className={btn}>{t.consult.waBtn}</a>
            <button type="button" onClick={() => { location.hash = `#/estimate/${est.uuid}` }}
              className="rounded-xl border border-line px-4 py-2.5 font-semibold hover:bg-sunk">{t.consult.openOwner}</button>
          </div>
          <p className="mt-3 text-xs text-muted">{t.consult.demoLink}</p>
        </Card>
      ) : (
        <Card title={t.consult.estimate}>
          <p className="mb-3 text-sm text-muted">{t.consult.estimateHint}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] text-sm">
              <thead>
                <tr>
                  <th scope="col" className="p-2 text-start font-medium">{t.consult.service}</th>
                  {OPTIONS.map((o) => <th key={o} scope="col" className="p-2 text-center font-medium">{t.consult.opt[o]}</th>)}
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <th scope="row" className="p-2 text-start font-normal">
                      {tx(s.name, lang)}<span className="block text-xs text-muted">{money(s.price, lang)}</span>
                    </th>
                    {OPTIONS.map((o) => (
                      <td key={o} className="p-2 text-center">
                        <input type="checkbox" className="h-5 w-5" style={{ accentColor: 'var(--brand)' }}
                          checked={draft[o].includes(s.id)} onChange={() => toggle(o, s.id)}
                          aria-label={`${tx(s.name, lang)} — ${t.consult.opt[o]}`} />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t-2 border-line font-semibold">
                  <th scope="row" className="p-2 text-start">{t.consult.total}</th>
                  {OPTIONS.map((o) => <td key={o} className="p-2 text-center text-brand">{money(optionTotal(draft[o]), lang)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          {err && <p role="alert" className="mt-3 text-sm text-warn">{err}</p>}
          <button type="button" onClick={send} className={`${btn} mt-4`}>{t.consult.send}</button>
        </Card>
      )}
    </div>
  )
}


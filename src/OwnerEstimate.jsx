import { Card } from './ui.jsx'
import { SERVICES, OPTIONS, optionTotal, money } from './services.js'
import { tx } from './utils.js'

/**
 * Public estimate page (owner view). It never shows the owner's phone, ID or address —
 * only the pet's name, the exam summary and the three options.
 */
export default function OwnerEstimate({ t, lang, estimate, onApprove, onBack }) {
  const back = (
    <button type="button" onClick={onBack} className="rounded-xl border border-line px-4 py-2 text-sm hover:bg-sunk">{t.estimate.back}</button>
  )
  if (!estimate) {
    return (
      <Card>
        <p className="leading-relaxed">{t.estimate.missing}</p>
        <div className="mt-4">{back}</div>
      </Card>
    )
  }
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t.estimate.title(tx(estimate.pet, lang))}</h1>
        <p className="mt-1 text-muted">{t.estimate.intro}</p>
      </div>
      <Card title={t.estimate.exam}>
        <p className="whitespace-pre-line leading-relaxed">{estimate.exam}</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {OPTIONS.map((o) => {
          const chosen = estimate.approved === o
          return (
            <section key={o} aria-labelledby={`opt-${o}`}
              className={`flex flex-col rounded-2xl border p-5 ${chosen ? 'border-brand bg-tint' : 'border-line bg-card'}`}>
              <h2 id={`opt-${o}`} className="text-lg font-semibold">{t.consult.opt[o]}</h2>
              <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                {estimate.options[o].map((sid) => {
                  const s = SERVICES.find((x) => x.id === sid)
                  return (
                    <li key={sid} className="flex justify-between gap-2">
                      <span>{tx(s.name, lang)}</span><span className="text-muted">{money(s.price, lang)}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 flex justify-between border-t border-line pt-3 font-bold">
                <span>{t.consult.total}</span><span className="text-brand">{money(optionTotal(estimate.options[o]), lang)}</span>
              </div>
              <button type="button" disabled={!!estimate.approved} onClick={() => onApprove(estimate.uuid, o)}
                className={`mt-4 rounded-xl px-4 py-2.5 font-semibold ${chosen ? 'bg-brand text-brand-ink' : 'bg-brand text-brand-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40'}`}>
                {chosen ? `✓ ${t.estimate.approved}` : t.estimate.approve}
              </button>
            </section>
          )
        })}
      </div>
      <p role="status" className="min-h-5 font-medium text-brand">
        {estimate.approved ? t.estimate.thanks(t.consult.opt[estimate.approved]) : ''}
      </p>
      <p className="text-sm text-muted">{t.estimate.note}</p>
      <div>{back}</div>
    </div>
  )
}

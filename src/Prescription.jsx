import { Paw, Brand } from './ui.jsx'
import { clinic } from './mockData.js'
import { tx, formatSaPhone } from './utils.js'

/** Printable prescription sheet. Buttons are `no-print`; the print CSS in index.css forces black on white. */
export default function Prescription({ t, lang, visit, onBack }) {
  const date = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-3">
        <button type="button" onClick={onBack} className="rounded-xl border border-line px-4 py-2.5 font-semibold hover:bg-sunk">{t.rx.back}</button>
        <button type="button" onClick={() => window.print()} className="rounded-xl bg-brand px-4 py-2.5 font-semibold text-brand-ink hover:opacity-90">{t.rx.print}</button>
      </div>
      <article className="mx-auto max-w-2xl rounded-2xl border border-line bg-card p-8">
        <header className="flex items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-2 text-brand"><Paw className="h-7 w-7" /><Brand brand={t.brand} product={t.product} /></div>
          <div className="text-sm text-muted">{t.rx.clinicPhone}: <span dir="ltr">{formatSaPhone(clinic.phone)}</span></div>
        </header>
        <h1 className="mt-5 text-2xl font-bold">{t.rx.sheet}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-muted">{t.rx.patient}</dt><dd className="font-medium">{tx(visit.name, lang)} · {t.species[visit.species]}</dd></div>
          <div><dt className="text-muted">{t.rx.owner}</dt><dd className="font-medium">{tx(visit.owner, lang)}</dd></div>
          <div><dt className="text-muted">{t.rx.date}</dt><dd className="font-medium">{date}</dd></div>
        </dl>
        <p className="mt-6 min-h-40 whitespace-pre-line border-t border-line pt-5 leading-loose">{visit.rx}</p>
        <div className="mt-10 w-56 border-t border-line pt-2 text-sm text-muted">{t.rx.signature}</div>
      </article>
    </div>
  )
}

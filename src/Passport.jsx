import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, PetImg } from './ui.jsx'
import { tx, formatDueDate } from './utils.js'

export const passportUrl = (uuid) => `${location.origin}/passport/${uuid}`

// Approved summaries exist for the first demo pet only.
const summariesFor = (pet, summaries) => (pet.id === 'p1' ? [summaries.exam, summaries.xray] : [])

/** The passport content. It only ever receives the pet's public fields: no owner name, phone, ID or address. */
function PassportBody({ pet, t, lang, vaccinations, summaries, clinic, showQr }) {
  const vacc = vaccinations.filter((v) => v.petId === pet.id)
  const list = summariesFor(pet, summaries)
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card>
        <div className="flex items-center gap-4">
          <PetImg src={`/images/${pet.species}-3d.jpg`} label={t.species[pet.species]} className="h-24 w-24 rounded-3xl" />
          <div className="min-w-0 flex-1">
            <div className="text-sm text-muted">{t.passport.title}</div>
            <div className="text-2xl font-bold">{tx(pet.name, lang)}</div>
            <div className="text-muted">{t.species[pet.species]} · {tx(pet.breed, lang)} · {pet.weight} {t.kg}</div>
          </div>
          {showQr && (
            <div className="rounded-xl bg-white p-2" title={t.passport.scan}><QRCodeSVG value={passportUrl(pet.uuid)} size={84} /></div>
          )}
        </div>
        <div className="mt-4 rounded-xl bg-warn-tint px-4 py-2.5 text-sm text-warn">{t.passport.allergies}: {tx(pet.allergies, lang)}</div>
      </Card>
      <Card title={t.passport.vacc}>
        <ul className="space-y-2">
          {vacc.map((v) => (
            <li key={v.id} className="flex justify-between gap-3"><span>{tx(v.vaccine, lang)}</span><span className="text-muted">{t.passport.next}: {formatDueDate(v.due, lang)}</span></li>
          ))}
        </ul>
      </Card>
      <Card title={t.passport.summaries}>
        {list.length === 0
          ? <p className="text-sm text-muted">{t.passport.noSummaries}</p>
          : <ul className="space-y-2 leading-relaxed">{list.map((s, i) => <li key={i}>{tx(s, lang)}</li>)}</ul>}
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 text-brand-ink">
        <span className="font-medium">{t.passport.emergency}</span>
        <a dir="ltr" href={`tel:+${clinic.phone}`} className="font-semibold underline">+{clinic.phone}</a>
      </div>
      <p className="text-center text-xs text-muted">{t.passport.privacy}</p>
    </div>
  )
}

/** Public, read-only page opened from the QR code: /passport/<uuid>. */
export function PublicPassport({ t, lang, uuid, pets, vaccinations, summaries, clinic, onBack }) {
  const found = pets.find((p) => p.uuid === uuid)
  const back = onBack && (
    <button type="button" onClick={onBack} className="rounded-xl border border-line px-4 py-2 text-sm hover:bg-sunk">{t.passport.back}</button>
  )
  if (!found) {
    return (
      <div className="mx-auto max-w-2xl"><Card><p className="leading-relaxed">{t.passport.notFound}</p>{back && <div className="mt-4">{back}</div>}</Card></div>
    )
  }
  // Allow-list of public fields: the owner's details never reach the page.
  const pet = { id: found.id, uuid: found.uuid, name: found.name, species: found.species, breed: found.breed, weight: found.weight, allergies: found.allergies }
  return (
    <div className="space-y-5">
      <PassportBody pet={pet} t={t} lang={lang} vaccinations={vaccinations} summaries={summaries} clinic={clinic} showQr={false} />
      {back && <div className="mx-auto max-w-2xl">{back}</div>}
    </div>
  )
}

/** Clinic tab: pick a pet, see its passport with the QR code, and open the public page. */
export default function PassportClinic({ t, lang, pets, vaccinations, summaries, clinic }) {
  const [sel, setSel] = useState(pets[0]?.id)
  const pet = pets.find((p) => p.id === sel) ?? pets[0]
  return (
    <div className="space-y-5">
      <Card title={t.passport.choose}>
        <div className="flex flex-wrap items-center gap-2">
          {pets.map((p) => (
            <button key={p.id} type="button" aria-pressed={p.id === pet.id} onClick={() => setSel(p.id)}
              className={`rounded-full border px-4 py-1.5 text-sm ${p.id === pet.id ? 'border-brand bg-tint font-semibold text-brand' : 'border-line text-muted hover:bg-sunk'}`}>
              {tx(p.name, lang)}
            </button>
          ))}
          <button type="button" onClick={() => { location.hash = `#/passport/${pet.uuid}` }}
            className="ms-auto rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-ink hover:opacity-90">{t.passport.openPublic}</button>
        </div>
      </Card>
      <PassportBody pet={pet} t={t} lang={lang} vaccinations={vaccinations} summaries={summaries} clinic={clinic} showQr />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { dict } from './i18n.js'
import { pets, vaccinations, summaries, clinic, seedVisits } from './mockData.js'
import { Paw, Card, Brand, PetImg } from './ui.jsx'
import { vaccStatus } from './utils.js'
import CheckIn from './CheckIn.jsx'
import Consult from './Consult.jsx'
import Invoice from './Invoice.jsx'
import Recall from './Recall.jsx'
import Manager from './Manager.jsx'
import PassportClinic, { PublicPassport } from './Passport.jsx'
import OwnerEstimate from './OwnerEstimate.jsx'

const read = (k, d) => { try { return localStorage.getItem(k) || d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, v) } catch { /* storage unavailable */ } }

export default function App() {
  const [lang, setLang] = useState(() => read('dv-lang', 'ar'))
  const [theme, setTheme] = useState(() => read('dv-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [tab, setTab] = useState('home')
  const [visits, setVisits] = useState(seedVisits) // demo state lives in the browser (in-memory)
  const [estimates, setEstimates] = useState([]) // demo state (in-memory)
  const [petList, setPetList] = useState(pets) // demo state: lets the boarding/grooming status be edited
  const [reminded, setReminded] = useState([]) // vaccination ids whose reminder was opened (mirrors vaccinations.reminder_sent)
  const [route, setRoute] = useState(() => location.hash)
  const t = dict[lang]
  const L = (o) => o[lang]
  const locale = lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB'
  const fmt = (d) => new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })

  useEffect(() => {
    const h = document.documentElement
    h.lang = lang; h.dir = lang === 'ar' ? 'rtl' : 'ltr'; write('dv-lang', lang)
  }, [lang])
  useEffect(() => {
    const on = () => setRoute(location.hash)
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark'); write('dv-theme', theme)
  }, [theme])

  const setBoarding = (id, boarding) => setPetList((ps) => ps.map((p) => (p.id === id ? { ...p, boarding } : p)))
  const tabs = ['home', 'checkin', 'consult', 'invoice', 'recall', 'manager', 'passport']
  const icons = { home: 'M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z', checkin: 'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z', consult: 'M9 12h6m-6 4h6M7 3h7l5 5v13H7z', invoice: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6m-6 4h6', recall: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 5v4l3 2', manager: 'M4 20V10m6 10V4m6 16v-7m4 7H2', passport: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-4v-2' }
  const NavIcon = ({ id }) => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[id]} /></svg>
  )

  const Home = () => (
    <div className="space-y-6">
      <div className="grid items-center gap-6 overflow-hidden rounded-3xl border border-line bg-card p-6 md:grid-cols-2 md:p-8">
        <div>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">{t.welcome}</h1>
          <p className="mt-3 max-w-md leading-relaxed text-muted">{t.welcomeSub}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[['pets', petList.length], ['due', vaccinations.filter((v) => vaccStatus(v.due) !== 'ok').length], ['boarded', petList.filter((p) => p.boarding === 'boarding').length]].map(([k, n]) => (
              <div key={k} className="rounded-2xl bg-tint px-4 py-3">
                <div className="text-2xl font-bold text-brand">{n}</div>
                <div className="text-sm text-muted">{t.stats[k]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <PetImg src="/images/dog-3d.jpg" label={t.species.dog} className="h-[82%] w-[82%] rounded-[2.5rem]" />
          <PetImg src="/images/cat-3d.jpg" label={t.species.cat} className="absolute bottom-0 end-0 h-[52%] w-[52%] rounded-[2rem] border-4 border-card shadow-lg" />
        </div>
      </div>
      <Card title={t.stay.title}>
        <p className="mb-3 text-sm text-muted">{t.stay.hint}</p>
        <ul className="space-y-3">
          {petList.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{L(p.name)} <span className="text-sm font-normal text-muted">· {t.species[p.species]}</span></span>
              <div role="group" aria-label={t.stay.of(L(p.name))} className="flex flex-wrap gap-2">
                {['none', 'boarding', 'grooming'].map((st) => (
                  <button type="button" key={st} aria-pressed={p.boarding === st} onClick={() => setBoarding(p.id, st)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm ${p.boarding === st ? 'border-brand bg-tint font-semibold text-brand' : 'border-line text-muted hover:bg-sunk'}`}>
                    {t.stay.status[st]}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <p className="text-sm text-muted">{t.demoNote}</p>
    </div>
  )

  const screens = { home: Home }
  const Screen = screens[tab]
  const approve = (uuid, opt) => setEstimates((es) => es.map((e) => (e.uuid === uuid && !e.approved ? { ...e, status: 'approved', approved: opt } : e)))
  const toggles = (
    <div className="flex gap-2">
      <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:bg-sunk">{t.lang}</button>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:bg-sunk">{theme === 'dark' ? t.themeLight : t.themeDark}</button>
    </div>
  )

  // Public passport: /passport/<uuid> (QR code) or #/passport/<uuid> (inside the demo). No clinic navigation, no owner details.
  const pathPassport = /^\/passport\/([\w-]+)\/?$/.exec(location.pathname)
  const hashPassport = /^#\/passport\/([\w-]+)$/.exec(route)
  const passportRoute = pathPassport || hashPassport
  if (passportRoute) {
    return (
      <div className="min-h-screen">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-8">
          <div className="flex items-center gap-2 text-brand"><Paw className="h-6 w-6" /><Brand brand={t.brand} product={t.product} /></div>
          {toggles}
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6 md:px-8">
          <PublicPassport t={t} lang={lang} uuid={passportRoute[1]} pets={pets} vaccinations={vaccinations} summaries={summaries} clinic={clinic}
            onBack={pathPassport ? undefined : () => { location.hash = '' }} />
        </main>
      </div>
    )
  }

  // Public owner page: #/estimate/<uuid>. No clinic navigation, no owner contact details.
  const owner = /^#\/estimate\/([\w-]+)$/.exec(route)
  if (owner) {
    return (
      <div className="min-h-screen">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-8">
          <div className="flex items-center gap-2 text-brand"><Paw className="h-6 w-6" /><Brand brand={t.brand} product={t.product} /></div>
          {toggles}
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6 md:px-8">
          <OwnerEstimate t={t} lang={lang} estimate={estimates.find((e) => e.uuid === owner[1])} onApprove={approve}
            onBack={() => { location.hash = '' }} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="no-print hidden w-64 shrink-0 flex-col border-e border-line bg-card p-5 md:flex">
        <div className="mb-8 flex items-center gap-2 text-brand"><Paw className="h-7 w-7" /><Brand brand={t.brand} product={t.product} stacked /></div>
        <nav className="space-y-1">
          {tabs.map((id) => (
            <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors ${tab === id ? 'bg-tint font-semibold text-brand' : 'text-muted hover:bg-sunk'}`}>
              <NavIcon id={id} />
              <span>
                {t.nav[id]}
                {id !== 'home' && <span className="block text-xs font-normal opacity-80">{t.role[id]}</span>}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="no-print flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-8">
          <div className="flex items-center gap-2 md:hidden text-brand"><Paw className="h-6 w-6" /><Brand brand={t.brand} product={t.product} /></div>
          <p className="hidden text-sm text-muted md:block">{t.tagline}</p>
          {toggles}
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">
          {/* CheckIn, Consult, Invoice, Recall, Manager and Passport are rendered as elements (not inner components) so typed text survives language/theme toggles. */}
          {tab === 'checkin' ? <CheckIn t={t} lang={lang} visits={visits} setVisits={setVisits} />
            : tab === 'consult' ? <Consult t={t} lang={lang} visits={visits} setVisits={setVisits} estimates={estimates} setEstimates={setEstimates} />
            : tab === 'invoice' ? <Invoice t={t} lang={lang} visits={visits} setVisits={setVisits} />
            : tab === 'recall' ? <Recall t={t} lang={lang} pets={petList} vaccinations={vaccinations} reminded={reminded}
              onReminded={(id) => setReminded((r) => (r.includes(id) ? r : [...r, id]))} />
            : tab === 'manager' ? <Manager t={t} lang={lang} visits={visits} vaccinations={vaccinations} onOpenRecall={() => setTab('recall')} />
            : tab === 'passport' ? <PassportClinic t={t} lang={lang} pets={petList} vaccinations={vaccinations} summaries={summaries} clinic={clinic} />
            : <Screen />}
        </main>
      </div>

      <nav className="no-print fixed inset-x-0 bottom-0 z-10 flex overflow-x-auto border-t border-line bg-card md:hidden">
        {tabs.map((id) => (
          <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
            className={`flex min-w-[4.75rem] flex-1 shrink-0 flex-col items-center gap-1 px-1 py-2.5 text-[11px] ${tab === id ? 'font-semibold text-brand' : 'text-muted'}`}>
            <NavIcon id={id} /><span className="line-clamp-1">{t.nav[id]}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

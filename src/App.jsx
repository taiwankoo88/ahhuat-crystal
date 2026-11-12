import { useEffect, useMemo, useState } from 'react'
import { Home } from './components/Home.jsx'
import { Designer } from './components/Designer.jsx'
import { Admin } from './components/Admin.jsx'
import { MyOrders } from './components/MyOrders.jsx'
import { CrystalBackground } from './components/CrystalBackground.jsx'
import { EnergyGuide } from './components/EnergyGuide.jsx'
import { NAV_GLOSS } from './components/NavGlossIcons.jsx'
import { Bead } from './components/Bead.jsx'
import logoMark from './assets/brand/logo-mark.webp'
import { CRYSTALS, CATEGORIES, ELEMENTS } from './data/crystals.js'
import { makeBead } from './utils/bracelet.js'
import { useLang, localizeCrystal, CATEGORY_I18N, ELEMENT_I18N } from './i18n.jsx'
import {
  HomeIcon,
  DesignIcon,
  DiscoverIcon,
  OrderIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  ArrowLeft,
  CheckIcon,
  SparkleIcon,
  ChevronRight,
} from './components/icons.jsx'

const TAB_KEYS = [
  { key: 'home', tkey: 'nav.home', icon: HomeIcon },
  { key: 'design', tkey: 'nav.design', icon: DesignIcon },
  { key: 'discover', tkey: 'nav.discover', icon: DiscoverIcon },
  { key: 'order', tkey: 'nav.order', icon: OrderIcon },
  { key: 'me', tkey: 'nav.me', icon: UserIcon },
]

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    // 新键：默认普通（浅色）模式，尊重用户手动切换
    const saved = localStorage.getItem('sl-theme4')
    if (saved) return saved === 'dark'
    return false // 默认普通模式
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#050912' : '#ffffff')
    localStorage.setItem('sl-theme4', dark ? 'dark' : 'light')
  }, [dark])
  return [dark, setDark]
}

export default function App() {
  const { t, lang, setLang } = useLang()
  const [tab, setTab] = useState('home')
  const [dark, setDark] = useDarkMode()
  const [initialBeads, setInitialBeads] = useState([])
  const [designKey, setDesignKey] = useState(0)
  const [smartSignal, setSmartSignal] = useState(0)
  const [showAdmin, setShowAdmin] = useState(false)

  const start = (pattern) => {
    if (Array.isArray(pattern)) {
      setInitialBeads(pattern.map((id) => makeBead(id, 8)))
      setDesignKey((k) => k + 1)
    } else if (pattern === 'smart') {
      setSmartSignal((s) => s + 1) // 通知设计页直接弹出智能搭配面板
    }
    setTab('design')
  }

  const goTab = (name) => {
    setTab(name)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const h = {
    title: t(`header.${tab}.title`),
    sub: t(`header.${tab}.sub`),
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-sky-50 via-cyan-50/50 to-blue-50 font-sans text-neutral-900 transition-colors duration-300 dark:bg-none dark:text-[#eaf2ff]">
      <CrystalBackground tab={tab} />
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 glass dark:border-[rgba(120,170,255,0.18)] dark:bg-[#070c22]/70">
        <div
          onClick={() => {
            setTab('home')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="mx-auto flex max-w-6xl cursor-pointer items-center gap-3 px-4 py-3 sm:px-6"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          {tab !== 'home' && (
            <button onClick={(e) => { e.stopPropagation(); setTab('home') }} className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition hover:bg-black/5 active:scale-90 dark:hover:bg-white/10" aria-label="back">
              <ArrowLeft size={20} />
            </button>
          )}
          {tab === 'home' && (
            <img src={logoMark} alt="AH HUAT" className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_2px_6px_rgba(90,160,230,0.35)]" />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-semibold leading-tight">{h.title}</div>
            <div className="truncate text-[11px] text-neutral-400">{h.sub}</div>
          </div>
          {tab === 'design' && (
            <button onClick={(e) => e.stopPropagation()} className="hidden items-center gap-1 rounded-full border border-brand-300 px-3.5 py-1.5 text-[13px] font-medium text-brand-600 transition hover:bg-brand-50 active:scale-95 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/30 sm:flex">
              <CheckIcon size={14} /> {t('header.save')}
            </button>
          )}
          {/* Language toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setLang(lang === 'zh' ? 'en' : 'zh') }}
            className="grid h-9 min-w-[38px] place-items-center rounded-full px-2 text-[13px] font-semibold text-neutral-500 transition hover:bg-black/5 active:scale-90 dark:text-neutral-300 dark:hover:bg-white/10"
            aria-label="toggle language"
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDark((d) => !d) }}
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition hover:bg-black/5 active:scale-90 dark:text-neutral-300 dark:hover:bg-white/10"
            aria-label="toggle theme"
          >
            {dark ? <SunIcon size={19} /> : <MoonIcon size={19} />}
          </button>
        </div>
      </header>

      {/* Pages */}
      <main className="animate-fade-in" key={tab}>
        {tab === 'home' && <Home onStart={start} onOpenGuide={() => goTab('discover')} />}
        {tab === 'design' && <Designer key={designKey} dark={dark} initialBeads={initialBeads} smartSignal={smartSignal} />}
        {tab === 'discover' && <EnergyGuide onStart={start} />}
        {tab === 'order' && <MyOrders onStart={start} />}
        {tab === 'me' && <Profile dark={dark} setDark={setDark} onOpenAdmin={() => setShowAdmin(true)} />}
      </main>

      <Admin open={showAdmin} onClose={() => setShowAdmin(false)} />

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/85 glass dark:border-[rgba(120,170,255,0.18)] dark:bg-[#070c22]/80" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-6xl items-stretch justify-around px-2">
          {TAB_KEYS.map((tb) => {
            const active = tab === tb.key
            const Gloss = NAV_GLOSS[tb.key]
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 transition ${active ? 'text-sky-600 dark:text-sky-300' : 'text-neutral-400'}`}
              >
                <span className="relative grid h-7 w-8 place-items-center">
                  {/* 选中：能量光圈 */}
                  {active && (
                    <>
                      <span className="absolute -inset-2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(90,170,255,0.5), rgba(90,120,255,0.12) 60%, transparent 72%)' }} />
                      <span className="absolute bottom-0 left-1/2 h-1.5 w-6 -translate-x-1/2 rounded-[50%] blur-[2px]" style={{ background: 'radial-gradient(ellipse, rgba(120,190,255,0.85), transparent 70%)' }} />
                    </>
                  )}
                  {/* 点击前=线条 / 点击后=立体发光 */}
                  {active ? (
                    <span key="on" className="relative animate-pop">
                      <Gloss size={26} />
                    </span>
                  ) : (
                    <tb.icon size={23} className="relative" />
                  )}
                </span>
                <span className="text-[10px] font-medium">{t(tb.tkey)}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

/* ---------- Discover ---------- */
function Discover({ onStart }) {
  const { t, lang } = useLang()
  const [cat, setCat] = useState('all')
  const list = useMemo(() => (cat === 'all' ? CRYSTALS : CRYSTALS.filter((c) => c.category.includes(cat))), [cat])
  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-4 sm:px-6">
      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${cat === c.key ? 'bg-brand-500 text-white' : 'bg-black/5 text-neutral-500 dark:bg-white/8 dark:text-neutral-300'}`}
          >
            {lang === 'zh' ? c.label : CATEGORY_I18N[c.key]}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {list.map((raw) => {
          const c = localizeCrystal(raw, lang)
          return (
            <div key={c.id} className="flex gap-4 rounded-3xl border border-black/5 bg-white p-4 shadow-card dark:border-white/5 dark:bg-neutral-800">
              <Bead crystal={c} size={64} className="shrink-0 drop-shadow-md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-semibold text-neutral-900 dark:text-white">{c.name}</span>
                  <span className="text-[11px] text-neutral-400">{c.pinyin}</span>
                  <span className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ background: ELEMENTS[c.element]?.color }}>
                    {t('discover.element')}·{lang === 'zh' ? ELEMENTS[c.element]?.label : ELEMENT_I18N[c.element]}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-300">{c.energy}</p>
                <div className="mt-2 flex items-center gap-2">
                  {c.keywords.map((k) => (
                    <span key={k} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={() => onStart()} className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-brand-500 py-3.5 font-medium text-white shadow-glow transition hover:bg-brand-600 active:scale-[0.99]">
        <SparkleIcon size={18} /> {t('discover.cta')}
      </button>
    </div>
  )
}

/* ---------- Profile ---------- */
function Profile({ dark, setDark, onOpenAdmin }) {
  const { t } = useLang()
  const rows = [
    { label: t('me.row.designs'), value: t('me.row.designs.v') },
    { label: t('me.row.fav'), value: t('me.row.fav.v') },
    { label: t('me.row.profile'), value: t('me.row.profile.v') },
    { label: t('me.row.about'), value: t('me.row.about.v') },
  ]
  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4 sm:px-6">
      <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-brand-500 to-emerald-600 p-5 text-white shadow-card-lg">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white/20 text-2xl backdrop-blur">✦</div>
        <div>
          <div className="text-[17px] font-semibold">{t('me.member')}</div>
          <div className="text-[13px] text-white/80">{t('me.member.sub')}</div>
        </div>
      </div>

      {/* Merchant admin entry */}
      <button
        onClick={onOpenAdmin}
        className="mt-4 flex w-full items-center gap-3 rounded-3xl border border-black/5 bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg active:scale-[0.99] dark:border-white/5 dark:bg-neutral-800"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-xl dark:bg-brand-900/30">🛍️</span>
        <div className="flex-1">
          <div className="text-[15px] font-medium text-neutral-900 dark:text-white">{t('admin.entry')}</div>
          <div className="text-[12px] text-neutral-400">{t('admin.entry.sub')}</div>
        </div>
        <ChevronRight size={18} className="text-neutral-300" />
      </button>

      <div className="mt-4 flex items-center justify-between rounded-3xl border border-black/5 bg-white p-4 shadow-card dark:border-white/5 dark:bg-neutral-800">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-900/30 dark:text-brand-300">
            {dark ? <MoonIcon size={20} /> : <SunIcon size={20} />}
          </span>
          <div>
            <div className="text-[15px] font-medium text-neutral-900 dark:text-white">{t('me.dark')}</div>
            <div className="text-[12px] text-neutral-400">{t('me.dark.sub')}</div>
          </div>
        </div>
        <button
          onClick={() => setDark((d) => !d)}
          className={`relative h-7 w-12 rounded-full transition ${dark ? 'bg-brand-500' : 'bg-neutral-300'}`}
          aria-label="toggle theme"
        >
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${dark ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-card dark:border-white/5 dark:bg-neutral-800">
        {rows.map((r, i) => (
          <div key={r.label} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? 'border-t border-black/5 dark:border-white/5' : ''}`}>
            <span className="text-[15px] text-neutral-800 dark:text-neutral-100">{r.label}</span>
            <span className="text-[13px] text-neutral-400">{r.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[12px] text-neutral-400">{t('brand.footer')}</p>
      <p className="mt-1 text-center text-[11px] text-neutral-300 dark:text-neutral-600">v50 · 2026.11.12 · 成品库存 · 默认华语</p>
    </div>
  )
}

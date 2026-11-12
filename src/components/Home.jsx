import { useState, useRef } from 'react'
import { Bead } from './Bead.jsx'
import { BraceletRing } from './BraceletRing.jsx'
import { ProductSheet } from './ProductSheet.jsx'
import { IceCaveImage } from './CrystalBackground.jsx'
import { CRYSTALS, CRYSTAL_MAP } from '../data/crystals.js'
import { PRESETS, ZODIACS, BIRTH_MONTHS, zodiacByDate, buildPatternFromCrystals } from '../data/recommendations.js'
import { useStore, effectiveDefaultProducts } from '../data/store.js'
import { allSoldOut } from '../utils/stock.js'
import { makeBead } from '../utils/bracelet.js'
import { useLang, localizeCrystal, money, PRESET_I18N, ZODIAC_I18N } from '../i18n.jsx'
import { GemCrystalIcon, DiamondSparkIcon, EnergyOrbIcon, GiftGlowIcon, ZodiacMedallion } from './CrystalIcons.jsx'
import { useRipple, HeroAtmosphere, Reveal } from './effects.jsx'
import { SparkleIcon, ChevronRight } from './icons.jsx'
import aiCrystal from '../assets/ai/ai-crystal.webp'
import knowledgeBalls from '../assets/ai/knowledge-balls.webp'
import featFree from '../assets/feat/feat-free.webp'
import featAi from '../assets/feat/feat-ai.webp'
import featEnergy from '../assets/feat/feat-energy.webp'
import featOrder from '../assets/feat/feat-order.webp'

const FEATURE_KEYS = [
  { img: featFree, t: 'feat.design', d: 'feat.design.d', glow: 'rgba(90,170,255,0.7)' },
  { img: featAi, t: 'feat.ai', d: 'feat.ai.d', glow: 'rgba(90,170,255,0.7)' },
  { img: featEnergy, t: 'feat.energy', d: 'feat.energy.d', glow: 'rgba(90,170,255,0.7)' },
  { img: featOrder, t: 'feat.order', d: 'feat.order.d', glow: 'rgba(90,170,255,0.7)' },
]

function patternToBeads(pattern) {
  return pattern.map((id) => makeBead(id, 8))
}

// 首页大圈手链：14 颗大珠，围出宽阔的中心以显示招牌名字
const HERO_PATTERN = [
  'citrine', 'green-phantom', 'tiger-eye', 'citrine', 'amethyst', 'green-phantom', 'tiger-eye',
  'citrine', 'green-phantom', 'tiger-eye', 'citrine', 'amethyst', 'green-phantom', 'tiger-eye',
]
const heroBeads = HERO_PATTERN.map((id) => makeBead(id, 12))

export function Home({ onStart, onOpenGuide }) {
  const { t, lang } = useLang()
  const store = useStore()
  const [product, setProduct] = useState(null)
  const [birthday, setBirthday] = useState('1998-08-15')
  const dateRef = useRef(null)
  const openDatePicker = () => {
    const el = dateRef.current
    if (!el) return
    try {
      el.showPicker?.()
    } catch {
      el.focus?.()
    }
  }
  const featured = [...effectiveDefaultProducts(store), ...store.products]
  const startRipple = useRipple()

  const generateByBirthday = () => {
    const bd = new Date(birthday + 'T00:00:00')
    if (isNaN(bd.getTime())) return
    const m = bd.getMonth() + 1
    const d = bd.getDate()
    const z = zodiacByDate(m, d)
    const theme = BIRTH_MONTHS[m - 1]
    onStart(buildPatternFromCrystals([...z.crystals, ...theme.crystals], 14))
  }

  return (
    <div className="pb-24 lg:pb-12">
      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
        {/* Hero · 沉浸式冰洞实景 */}
        <section className="relative min-h-[340px] overflow-hidden rounded-4xl shadow-card-lg sm:min-h-[380px]">
          <div className="absolute inset-0 animate-cave-in">
            <IceCaveImage className="h-full w-full object-cover animate-cave-drift" />
          </div>
          {/* 文字可读遮罩 · 深空宇宙 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b1e]/90 via-[#0a1430]/60 to-[#0d1638]/40" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 70% at 50% 42%, rgba(60,120,255,0.14), transparent 70%)' }} />
          {/* 进光 */}
          <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 -translate-y-10 rounded-full blur-3xl" style={{ background: 'radial-gradient(ellipse at center, rgba(224,246,255,0.55), transparent 70%)' }} />
          {/* 沉浸氛围：能量雾 + 光线 + 漂浮粒子 */}
          <HeroAtmosphere />
          <div className="relative flex min-h-[340px] flex-col items-center justify-center gap-6 p-6 text-center sm:min-h-[380px] sm:flex-row sm:justify-between sm:p-9 sm:text-left">
            <div>
              <p className="text-[13px] font-medium tracking-wide text-cyan-200/90 drop-shadow">{t('brand.full')}</p>
              <h1 className="mt-2 text-2xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl">
                {t('home.heroTitle1')}
                <br />
                <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-white bg-clip-text text-transparent">{t('home.heroTitle2')}</span>
              </h1>
              <p className="mt-3 text-[14px] text-white/85 drop-shadow">{t('home.heroSub')}</p>
              <button
                onClick={() => onStart()}
                onPointerDown={startRipple.onDown}
                className="shimmer-sweep group relative mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/60 px-6 py-3 text-[15px] font-semibold text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 active:scale-[0.96]"
                style={{ background: 'linear-gradient(140deg, rgba(24,52,104,0.6), rgba(30,22,72,0.55))', boxShadow: '0 0 22px -4px rgba(90,180,255,0.7), inset 0 1px 0 rgba(180,225,255,0.5)' }}
              >
                <span className="relative grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-cyan-100 to-sky-500 shadow-[0_0_10px_rgba(160,220,255,0.85)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                </span>
                <span className="relative">{t('home.start')}</span>
                <ChevronRight size={17} className="relative transition-transform duration-300 group-hover:translate-x-0.5" />
                {startRipple.rippleNode}
              </button>
            </div>
            <div className="relative h-60 w-60 shrink-0 sm:h-72 sm:w-72">
              {/* 能量辉光（更强，宇宙感） */}
              <div className="absolute -inset-2 rounded-full animate-breath" style={{ background: 'radial-gradient(circle, rgba(110,180,255,0.55), rgba(150,110,255,0.28) 50%, transparent 70%)' }} />
              {/* 绕圈能量光点 */}
              <div className="absolute inset-0 animate-orbit">
                <span className="absolute left-1/2 top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-200" style={{ boxShadow: '0 0 10px 3px rgba(150,220,255,0.95)' }} />
                <span className="absolute right-3 top-1/2 h-1 w-1 rounded-full bg-violet-200" style={{ boxShadow: '0 0 10px 3px rgba(200,170,255,0.95)' }} />
                <span className="absolute bottom-3 left-6 h-1.5 w-1.5 rounded-full bg-sky-200" style={{ boxShadow: '0 0 10px 3px rgba(160,210,255,0.95)' }} />
              </div>
              {/* 手链极轻微摇摆，像活的一样 */}
              <div className="relative h-full w-full animate-sway drop-shadow-2xl">
                <BraceletRing beads={heroBeads} brandStyle="hero" />
              </div>
            </div>
          </div>
        </section>

        {/* Features · 立体水晶玻璃卡 */}
        <section className="mt-5 grid grid-cols-4 gap-2 sm:gap-4">
          {FEATURE_KEYS.map((f) => (
            <FeatureCard
              key={f.t}
              f={f}
              label={t(f.t)}
              desc={t(f.d)}
              onClick={() => {
                if (f.t === 'feat.ai') onStart('smart')
                else if (f.t === 'feat.energy') onOpenGuide?.()
                else onStart()
              }}
            />
          ))}
        </section>

        {/* 生日 · 星座配对 */}
        <Reveal as="section" className="mt-7">
          <div className="mb-3 px-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{t('home.match.title')}</h2>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">{t('home.match.sub')}</p>
          </div>

          {/* 毛玻璃面板 */}
          <div className="rounded-4xl border border-white/60 bg-white/45 p-3 shadow-card glass-card dark:border-white/10 dark:bg-white/10 sm:p-4">
            {/* 生日输入 —— 点整行即可弹出日期选择器 */}
            <div
              onClick={openDatePicker}
              className="mb-3 flex cursor-pointer items-center gap-2 rounded-3xl border border-white/70 bg-white/70 p-2 shadow-inner dark:border-white/10 dark:bg-neutral-900/50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center text-2xl">🎂</span>
              <input
                ref={dateRef}
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                onClick={(e) => { e.stopPropagation(); openDatePicker() }}
                className="min-w-0 flex-1 cursor-pointer rounded-2xl border border-black/5 bg-white px-3 py-2.5 text-center text-[15px] font-medium text-neutral-900 outline-none focus:border-violet-300 dark:border-white/10 dark:bg-neutral-800 dark:text-white"
              />
              <button
                onClick={generateByBirthday}
                className="shimmer-sweep shrink-0 rounded-2xl px-5 py-2.5 text-[14px] font-semibold text-white transition duration-300 hover:-translate-y-0.5 active:scale-95"
                style={{ background: 'linear-gradient(140deg, #a274f5, #6d3bd6)', boxShadow: '0 0 18px -4px rgba(150,90,240,0.75), inset 0 1px 0 rgba(255,255,255,0.4)' }}
              >
                {t('home.match.generate')}
              </button>
            </div>

            {/* 十二星座 */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {ZODIACS.map((z) => (
                <button
                  key={z.key}
                  onClick={() => onStart(buildPatternFromCrystals(z.crystals, 12))}
                  className="flex w-[108px] shrink-0 flex-col items-center gap-1.5 rounded-3xl border border-white/70 bg-white/55 p-3 text-center shadow-card transition duration-300 hover:-translate-y-1 active:scale-95 dark:border-[rgba(90,170,255,0.5)] dark:bg-[rgba(14,24,48,0.55)] dark:shadow-[0_0_20px_-6px_rgba(90,170,255,0.6)]"
                >
                  {/* 发光星座星盘 */}
                  <ZodiacMedallion symbol={z.emoji} size={56} />
                  <div className="text-[14px] font-semibold text-neutral-900 dark:text-white">{lang === 'zh' ? z.name : ZODIAC_I18N[z.key]?.name}</div>
                  <div className="text-[10px] text-neutral-400">{z.range}</div>
                  <div className="mt-0.5 flex gap-0.5">
                    {z.crystals.map((id) => (
                      <Bead key={id} crystal={CRYSTAL_MAP[id]} size={17} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Featured real-photo products */}
        <Reveal as="section" className="mt-7">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{t('home.featured')}</h2>
              <p className="text-[12px] text-neutral-500 dark:text-neutral-400">{t('home.featured.sub')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {featured.map((pr) => {
              const c = localizeCrystal(CRYSTAL_MAP[pr.crystalId], lang)
              const name = lang === 'zh' ? pr.name : pr.name_en
              const badge = lang === 'zh' ? pr.badge : pr.badge_en
              const kws = c?.keywords || pr.keywords || []
              const min = pr.sizes?.length ? Math.min(...pr.sizes.map((s) => s.price)) : 0
              const out = allSoldOut(pr)
              return (
                <button
                  key={pr.id}
                  onClick={() => setProduct(pr)}
                  className="group flex flex-col overflow-hidden rounded-4xl border border-white/60 bg-white/50 text-left shadow-card glass-card transition duration-300 hover:-translate-y-1 hover:shadow-card-lg active:scale-[0.99] dark:border-[rgba(100,160,255,0.4)] dark:bg-[rgba(16,26,50,0.55)] dark:shadow-[0_0_22px_-8px_rgba(90,160,255,0.55)]"
                >
                  <div className="relative aspect-square p-2">
                    <div className="absolute inset-2 rounded-3xl bg-gradient-to-br from-white/70 to-sky-50/40 dark:from-neutral-700/40 dark:to-neutral-900/40" />
                    <img src={pr.image} alt={name} className="relative h-full w-full object-contain drop-shadow-lg transition duration-300 group-hover:scale-105" />
                    {badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
                        {badge}
                      </span>
                    )}
                    {out && (
                      <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-medium text-white">
                        {t('product.soldout')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between p-3.5 pt-1">
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold text-neutral-900 dark:text-white">{name}</div>
                      <div className="truncate text-[11px] text-neutral-400">{kws.join(' · ')}</div>
                      <div className="mt-1 text-[15px] font-bold text-brand-600 dark:text-brand-300">{min ? t('product.from', money(min)) : ''}</div>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-sky-200/70 bg-white/70 text-sky-500 shadow-sm backdrop-blur transition group-hover:bg-sky-500 group-hover:text-white dark:border-white/10 dark:bg-white/10">
                      <ChevronRight size={17} />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* AI banner —— 深空能量卡：发光绿边 + 3D 水晶手链大图 */}
        <Reveal as="section" className="mt-6">
          <button
            onClick={() => onStart('smart')}
            className="group relative block w-full overflow-hidden rounded-[26px] p-5 text-left text-white transition active:scale-[0.99]"
            style={{
              minHeight: 202,
              background: 'linear-gradient(135deg, #0c3b32 0%, #0a2740 52%, #071426 100%)',
              border: '1px solid rgba(74,238,190,0.55)',
              boxShadow: '0 0 26px -4px rgba(52,224,172,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            {/* 右侧水晶手链大图（向左渐隐融入卡面） */}
            <img
              src={aiCrystal}
              alt=""
              className="pointer-events-none absolute right-0 top-0 h-full w-[64%] object-cover object-center"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 28%)',
                maskImage: 'linear-gradient(to right, transparent 0%, #000 28%)',
              }}
            />
            {/* 绿色能量光晕 */}
            <span
              className="pointer-events-none absolute -right-8 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full animate-breath"
              style={{ background: 'radial-gradient(circle, rgba(52,232,176,0.4), transparent 68%)', mixBlendMode: 'screen' }}
            />

            <div className="relative z-10 max-w-[62%]">
              {/* AI 光环标志 */}
              <div className="relative mb-3.5 h-12 w-12">
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 38% 32%, rgba(120,255,214,0.95), rgba(24,150,112,0.55) 58%, transparent 72%)',
                    boxShadow: '0 0 18px 2px rgba(60,240,180,0.65)',
                  }}
                />
                <span
                  className="absolute left-1/2 top-1/2 h-[18px] w-[58px] rounded-[50%] border border-emerald-200/70"
                  style={{ transform: 'translate(-50%,-50%) rotate(-22deg)', boxShadow: '0 0 8px rgba(120,255,214,0.5)' }}
                />
                <span className="absolute inset-0 grid place-items-center text-[14px] font-extrabold tracking-tight text-white drop-shadow">AI</span>
              </div>
              <div className="text-[19px] font-extrabold leading-tight drop-shadow">{t('home.ai.title')}</div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/72">{t('home.ai.sub')}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-bold text-emerald-300 drop-shadow">
                {t('home.ai.btn')} <ChevronRight size={16} />
              </span>
            </div>
          </button>
        </Reveal>

        {/* Crystal knowledge */}
        <Reveal as="section" className="mt-7">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
              <KnowGem />
              {t('home.know')}
            </h2>
            <button onClick={() => onOpenGuide?.()} className="flex items-center gap-0.5 text-[13px] text-neutral-400 transition hover:text-brand-500">
              {t('home.more')} <ChevronRight size={15} />
            </button>
          </div>
          <button
            onClick={() => onOpenGuide?.()}
            className="block w-full rounded-3xl border border-black/5 bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg active:scale-[0.99] dark:border-[rgba(120,180,255,0.18)] dark:bg-[rgba(13,23,44,0.6)] dark:shadow-[0_0_22px_-8px_rgba(90,160,255,0.5)] dark:backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_0_18px_-6px_rgba(120,160,255,0.55)]">
                <img src={knowledgeBalls} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-neutral-900 dark:text-white">{t('home.know.title')}</div>
                <p className="mt-1 line-clamp-2 text-[13px] text-neutral-500 dark:text-neutral-300/80">{t('home.know.desc')}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-400">
                  <EyeGlyph /> {t('home.know.read')}
                </div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-neutral-300 dark:text-white/50" />
            </div>
          </button>
          {/* Quick crystal chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CRYSTALS.map((raw) => {
              const c = localizeCrystal(raw, lang)
              return (
                <button
                  key={c.id}
                  onClick={() => onOpenGuide?.()}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/5 bg-white py-1.5 pl-1.5 pr-3 shadow-card transition hover:-translate-y-0.5 dark:border-[rgba(120,180,255,0.22)] dark:bg-[rgba(13,23,44,0.6)] dark:shadow-[0_0_16px_-8px_rgba(90,160,255,0.6)] dark:backdrop-blur-xl"
                >
                  <Bead crystal={c} size={26} />
                  <span className="text-[12px] font-medium text-neutral-700 dark:text-neutral-100">{c.name}</span>
                </button>
              )
            })}
          </div>
        </Reveal>
      </div>

      <ProductSheet open={!!product} onClose={() => setProduct(null)} product={product} />
    </div>
  )
}

/* 绿色发光水晶簇小图标（水晶知识标题） */
function KnowGem() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <defs>
        <linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a8ffe4" />
          <stop offset="0.5" stopColor="#37e0ac" />
          <stop offset="1" stopColor="#127a5a" />
        </linearGradient>
        <filter id="kgGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#kgGlow)">
        <path d="M12 3l3.4 5.2L12 21 8.6 8.2 12 3z" fill="url(#kg)" opacity="0.95" />
        <path d="M7 7.5l2.2 2.4L7.6 20 4.8 10.4 7 7.5z" fill="url(#kg)" opacity="0.75" />
        <path d="M17 7.5l-2.2 2.4L16.4 20l2.8-9.6L17 7.5z" fill="url(#kg)" opacity="0.75" />
        <path d="M12 3l3.4 5.2H8.6L12 3z" fill="#ffffff" opacity="0.5" />
      </g>
    </svg>
  )
}

/* 阅读量小眼睛 */
function EyeGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-70">
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

/* ---------- 深色能量玻璃功能卡（发光边框 + 绕圈光环 + 波纹） ---------- */
function FeatureCard({ f, label, desc, onClick }) {
  const { onDown, rippleNode } = useRipple()
  return (
    <button
      onClick={onClick}
      onPointerDown={onDown}
      style={{
        border: '1px solid rgba(120,180,255,0.5)',
        background: 'linear-gradient(160deg, rgba(46,86,160,0.34), rgba(18,42,92,0.5))',
        boxShadow: '0 0 20px -6px rgba(90,160,255,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
      className="group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-3xl p-2.5 text-center text-white glass-card transition duration-300 hover:-translate-y-1 active:scale-[0.96] sm:p-3.5"
    >
      {/* 顶部柔光 */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/14 to-transparent" />
      {/* ZIP 原图发光 3D 图标（边缘渐隐融入卡面） */}
      <span className="relative grid h-16 w-16 place-items-center sm:h-[70px] sm:w-[70px]">
        <img
          src={f.img}
          alt=""
          className="h-full w-full animate-float object-cover"
          style={{
            animationDelay: '0.3s',
            WebkitMaskImage: 'radial-gradient(ellipse 62% 62% at 50% 46%, #000 58%, transparent 82%)',
            maskImage: 'radial-gradient(ellipse 62% 62% at 50% 46%, #000 58%, transparent 82%)',
          }}
        />
      </span>
      <div className="relative">
        <div className="text-[13px] font-semibold drop-shadow sm:text-[14px]">{label}</div>
        <div className="hidden text-[10px] text-white/60 sm:block">{desc}</div>
      </div>
      {rippleNode}
    </button>
  )
}

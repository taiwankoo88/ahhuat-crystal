import { useMemo, useState } from 'react'
import { useMyOrders, removeMyOrder, clearMyOrders } from '../data/myOrders.js'
import { CRYSTAL_MAP } from '../data/crystals.js'
import { waLink } from '../data/store.js'
import { useLang, localizeCrystal, money } from '../i18n.jsx'
import { OrderIcon, WhatsAppIcon } from './icons.jsx'

// 把存下来的手链珠子列表合并成「水晶 8mm ×N」
function compose(beads, lang) {
  const tally = {}
  ;(beads || []).forEach((b) => {
    const k = `${b.crystalId}|${b.size}`
    tally[k] = (tally[k] || 0) + 1
  })
  return Object.entries(tally).map(([k, n]) => {
    const [id, size] = k.split('|')
    const nm = localizeCrystal(CRYSTAL_MAP[id], lang)?.name || id
    return `${nm} ${size}mm ×${n}`
  })
}

function fmtDate(ts, lang) {
  try {
    return new Date(ts).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function OrderCard({ o, lang, t }) {
  const [open, setOpen] = useState(false)
  const isProduct = o.type === 'product'
  const title = isProduct
    ? `${lang === 'zh' ? o.productName : o.productNameEn || o.productName} · ${o.size}mm`
    : t('myorders.diy')
  const lines = useMemo(() => (isProduct ? [] : compose(o.beads, lang)), [o, isProduct, lang])

  const ask = () => {
    const txt =
      lang === 'zh'
        ? `你好，我想查询订单：${title}（${fmtDate(o.at, lang)}，${money(o.total)}），姓名 ${o.name}。`
        : `Hi, I'd like to check my order: ${title} (${fmtDate(o.at, lang)}, ${money(o.total)}), name ${o.name}.`
    window.open(waLink(txt), '_blank')
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-card dark:border-white/5 dark:bg-neutral-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
              isProduct
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                : 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300'
            }`}
          >
            {isProduct ? t('myorders.product') : t('myorders.diy')}
          </span>
          <div className="mt-1.5 truncate text-[15px] font-semibold text-neutral-900 dark:text-white">{title}</div>
          <div className="mt-0.5 text-[12px] text-neutral-400">{fmtDate(o.at, lang)}</div>
        </div>
        <div className="shrink-0 text-right text-[16px] font-semibold text-brand-600 dark:text-brand-300">{money(o.total)}</div>
      </div>

      {!isProduct && (
        <p className="mt-2 text-[13px] text-neutral-500 dark:text-neutral-400">
          {o.count} {t('unit.pcs')}
          {o.wristCm ? ` · ${t('myorders.wrist')} ${o.wristCm}cm` : ''}
        </p>
      )}

      {open && (
        <div className="mt-2 space-y-1 rounded-2xl bg-black/[0.03] p-3 text-[13px] text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
          {lines.length > 0 && <div>{lines.join(lang === 'zh' ? '、' : ', ')}</div>}
          <div>
            {o.name}
            {o.phone ? ` · ${o.phone}` : ''}
          </div>
          <div>{o.address}</div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => setOpen((v) => !v)} className="rounded-full border border-black/10 px-3.5 py-2 text-[13px] text-neutral-600 transition active:scale-95 dark:border-white/10 dark:text-neutral-300">
          {open ? t('myorders.hide') : t('myorders.detail')}
        </button>
        <button onClick={ask} className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-2 text-[13px] font-medium text-white transition active:scale-95">
          <WhatsAppIcon size={15} /> {t('myorders.ask')}
        </button>
        <button
          onClick={() => window.confirm(t('myorders.delconfirm')) && removeMyOrder(o.id)}
          className="ml-auto px-2 py-2 text-[12px] text-neutral-400 transition hover:text-red-500"
        >
          {t('myorders.del')}
        </button>
      </div>
    </div>
  )
}

export function MyOrders({ onStart }) {
  const { t, lang } = useLang()
  const orders = useMyOrders()

  if (!orders.length) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 pb-28 pt-24 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-50 dark:bg-brand-900/30">
          <OrderIcon size={44} className="text-brand-400" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-neutral-900 dark:text-white">{t('order.empty.title')}</h3>
        <p className="mt-1.5 text-[14px] text-neutral-500 dark:text-neutral-400">{t('order.empty.desc')}</p>
        <button onClick={() => onStart()} className="mt-6 rounded-full bg-brand-500 px-6 py-3 text-[15px] font-medium text-white shadow-glow transition hover:bg-brand-600 active:scale-95">
          {t('order.empty.btn')}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4 sm:px-6">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-[18px] font-semibold text-neutral-900 dark:text-white">{t('myorders.title')}</h2>
        <span className="text-[12px] text-neutral-400">{orders.length} {t('myorders.count')}</span>
      </div>
      <p className="mb-3 text-[12px] text-neutral-400">{t('myorders.note')}</p>
      <div className="space-y-3">
        {orders.map((o) => (
          <OrderCard key={o.id} o={o} lang={lang} t={t} />
        ))}
      </div>
      <button
        onClick={() => window.confirm(t('myorders.clearconfirm')) && clearMyOrders()}
        className="mx-auto mt-5 block text-[12px] text-neutral-400 transition hover:text-red-500"
      >
        {t('myorders.clear')}
      </button>
    </div>
  )
}

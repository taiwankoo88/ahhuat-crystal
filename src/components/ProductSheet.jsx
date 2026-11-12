import { useEffect, useState } from 'react'
import { Modal } from './Modal.jsx'
import { CRYSTAL_MAP, ELEMENTS } from '../data/crystals.js'
import { useLang, localizeCrystal, money, ELEMENT_I18N } from '../i18n.jsx'
import { waLink, isCloud } from '../data/store.js'
import { api } from '../data/api.js'
import { addMyOrder } from '../data/myOrders.js'
import { soldOut, lowStock } from '../utils/stock.js'
import { WhatsAppIcon } from './icons.jsx'

export function ProductSheet({ open, onClose, product }) {
  const { t, lang } = useLang()
  const [sizeIdx, setSizeIdx] = useState(0)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      // 默认选第一个有货的尺寸
      const first = (product?.sizes || []).findIndex((x) => !soldOut(x))
      setSizeIdx(first < 0 ? 0 : first)
      setErr('')
    }
  }, [open, product])

  if (!product) return null
  const c = product.crystalId ? localizeCrystal(CRYSTAL_MAP[product.crystalId], lang) : null
  const displayName = lang === 'zh' ? product.name : product.name_en
  const subtitle = c?.pinyin || product.name_en || ''
  const keywords = c?.keywords || product.keywords || []
  const element = c?.element || product.element
  const energy = c?.energy || (lang === 'zh' ? product.energy : product.energy_en) || ''
  const sizes = product.sizes || []
  const picked = sizes[sizeIdx] || sizes[0]

  const order = () => {
    if (!picked || soldOut(picked)) return
    if (!name.trim() || !address.trim()) {
      setErr(t('order.needinfo'))
      return
    }
    setErr('')

    // 云端记录成品订单（部署在 Cloudflare 时生效；否则静默忽略）。
    // summary 用中文，老板后台按它显示；「成品」前缀用来和 DIY 手链单区分。
    if (isCloud()) {
      api
        .createOrder({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          items: {
            type: 'product',
            productId: product.id,
            name: product.name,
            name_en: product.name_en,
            size: picked.size,
            price: picked.price,
            qty: 1,
          },
          summary: `成品 · ${product.name} ${picked.size}mm ×1`,
          total: picked.price,
          channel: 'web',
        })
        .catch(() => {})
    }

    // 本机「我的订单」记录（不依赖云端）
    addMyOrder({
      type: 'product',
      name: name.trim(), phone: phone.trim(), address: address.trim(),
      productId: product.id, productName: product.name, productNameEn: product.name_en,
      size: picked.size, total: picked.price,
    })

    const lines =
      lang === 'zh'
        ? [
            `【${t('brand.name')} · 成品订单】`,
            `姓名：${name.trim()}`,
            phone.trim() ? `电话：${phone.trim()}` : null,
            `地址：${address.trim()}`,
            '——',
            `产品：${displayName}（${picked.size}mm）`,
            `合计：${money(picked.price)}`,
          ]
        : [
            `[${t('brand.name')} · Product Order]`,
            `Name: ${name.trim()}`,
            phone.trim() ? `Phone: ${phone.trim()}` : null,
            `Address: ${address.trim()}`,
            '--',
            `Product: ${displayName} (${picked.size}mm)`,
            `Total: ${money(picked.price)}`,
          ]
    window.open(waLink(lines.filter(Boolean).join('\n')), '_blank')
  }

  return (
    <Modal open={open} onClose={onClose} title={displayName} subtitle={subtitle} maxWidth="max-w-md">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 dark:from-neutral-800 dark:to-neutral-900">
        {product.image ? (
          <img src={product.image} alt={displayName} className="mx-auto max-h-64 w-auto object-contain drop-shadow-xl" />
        ) : (
          <div className="grid h-48 place-items-center text-neutral-400">—</div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {keywords.map((k) => (
          <span key={k} className="rounded-full bg-brand-50 px-3 py-1 text-[12px] font-medium text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">{k}</span>
        ))}
        {element && (
          <span className="rounded-full px-3 py-1 text-[12px] font-medium text-white" style={{ background: ELEMENTS[element]?.color }}>
            {lang === 'zh' ? '五行' : 'Element'} · {lang === 'zh' ? ELEMENTS[element]?.label : ELEMENT_I18N[element]}
          </span>
        )}
        <span className="rounded-full bg-amber-100 px-3 py-1 text-[12px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {t('product.natural')}
        </span>
      </div>

      {energy && <p className="mt-3 text-left text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-300">{energy}</p>}

      {sizes.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-[13px] font-medium text-neutral-700 dark:text-neutral-200">{t('product.size')}</div>
          <div className={`grid gap-2 ${sizes.length >= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {sizes.map((s, i) => {
              const active = i === sizeIdx
              const out = soldOut(s)
              return (
                <button
                  key={`${s.size}-${i}`}
                  onClick={() => setSizeIdx(i)}
                  disabled={out}
                  className={`flex flex-col items-center rounded-2xl border px-2 py-2.5 transition active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${
                    active
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/30 dark:text-brand-200'
                      : 'border-black/8 bg-white text-neutral-600 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  <span className="text-[14px] font-semibold">{s.size}mm</span>
                  <span className="text-[12px]">{out ? t('product.soldout') : money(s.price)}</span>
                  {lowStock(s) && (
                    <span className="mt-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      {lang === 'zh' ? `仅剩 ${s.stock}` : `${s.stock} left`}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {picked && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3 dark:bg-white/5">
          <span className="text-[13px] text-neutral-500">{picked.size}mm</span>
          <span className="text-xl font-bold text-brand-600 dark:text-brand-300">{money(picked.price)}</span>
        </div>
      )}

      {/* 收货信息：与 DIY 下单一致，姓名+地址必填，电话选填（电话是后台客户档案的主键） */}
      <div className="mt-4">
        <div className="mb-2 text-[13px] font-medium text-neutral-700 dark:text-neutral-200">{t('product.order.info')}</div>
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('order.name.ph')} className={inputCls} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder={t('order.phone.ph')} className={inputCls} />
          </div>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder={t('order.address.ph')} className={inputCls} />
        </div>
        {err && <p className="mt-2 text-[13px] text-red-500">{err}</p>}
      </div>

      <button
        onClick={order}
        disabled={!picked || soldOut(picked)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 font-medium text-white shadow-glow transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
      >
        <WhatsAppIcon size={20} /> {picked && soldOut(picked) ? t('product.soldout') : t('product.buy')}
      </button>
      <p className="mt-2 px-1 text-[11px] leading-relaxed text-neutral-400">{t('product.order.note')}</p>
    </Modal>
  )
}

const inputCls =
  'w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-neutral-800 dark:text-white'

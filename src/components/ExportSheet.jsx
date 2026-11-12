import { useEffect, useMemo, useState } from 'react'
import { Modal } from './Modal.jsx'
import { renderProductImage, downloadDataUrl } from '../utils/render.js'
import { useLang, localizeCrystal, money } from '../i18n.jsx'
import { CRYSTAL_MAP } from '../data/crystals.js'
import { summarize } from '../utils/bracelet.js'
import { waLink, isCloud } from '../data/store.js'
import { api } from '../data/api.js'
import { addMyOrder } from '../data/myOrders.js'
import { DownloadIcon, ShareIcon, WhatsAppIcon } from './icons.jsx'

const apiCreateOrder = api.createOrder

export function ExportSheet({ open, onClose, beads, dark, wristCm }) {
  const { t, lang } = useLang()
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const imgI18n = useMemo(
    () => ({
      brand: t('brand.full'),
      tagline: t('brand.tagline'),
      money: (n) => money(n),
      unitPcs: t('unit.pcs'),
      lengthLabel: t('export.img.length'),
      weightLabel: t('export.img.weight'),
      wristLabel: t('export.img.wrist'),
      emptyText: t('export.img.empty'),
      qrText: t('export.img.qr'),
      crystalName: (id) => localizeCrystal(CRYSTAL_MAP[id], lang)?.name,
    }),
    [t, lang],
  )

  useEffect(() => {
    if (!open) return
    setPreview(renderProductImage(beads, { dark, share: false, wristCm, i18n: imgI18n }))
  }, [open, beads, dark, wristCm, imgI18n])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const stats = useMemo(() => summarize(beads), [beads])

  // 手链成分明细
  const composition = useMemo(() => {
    const tally = {}
    beads.forEach((b) => {
      const key = `${b.crystalId}|${b.size}`
      tally[key] = (tally[key] || 0) + 1
    })
    return Object.entries(tally).map(([k, n]) => {
      const [id, size] = k.split('|')
      const nm = localizeCrystal(CRYSTAL_MAP[id], lang)?.name || id
      return `${nm} ${size}mm ×${n}`
    })
  }, [beads, lang])

  const savePng = () => {
    downloadDataUrl(renderProductImage(beads, { dark, wristCm, i18n: imgI18n }), 'my-bracelet.png')
    notify(t('order.saved'))
  }

  const shareImg = async () => {
    const url = renderProductImage(beads, { dark, share: true, wristCm, i18n: imgI18n })
    try {
      const blob = await (await fetch(url)).blob()
      const file = new File([blob], 'my-bracelet.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: t('export.shareTitle'), text: t('export.shareText') })
        return
      }
    } catch (_) {}
    downloadDataUrl(url, 'my-bracelet-share.png')
    notify(t('order.saved'))
  }

  const sendOrder = () => {
    if (!name.trim() || !address.trim()) return notify(t('order.needinfo'))
    // 先保存设计图，方便顾客在 WhatsApp 里附上
    downloadDataUrl(renderProductImage(beads, { dark, wristCm, i18n: imgI18n }), 'my-bracelet.png')

    // 云端记录订单（部署在 Cloudflare 时生效；否则静默忽略）
    if (isCloud()) {
      apiCreateOrder({
        name, phone, address,
        items: { beads: beads.map((b) => b.crystalId), wristCm, count: stats.count },
        summary: `${stats.count} 颗 · ${composition.join('、')}`,
        total: stats.price, channel: 'web',
      }).catch(() => {})
    }

    // 本机「我的订单」记录（不依赖云端）
    addMyOrder({
      type: 'diy',
      name: name.trim(), phone: phone.trim(), address: address.trim(),
      beads: beads.map((b) => ({ crystalId: b.crystalId, size: b.size })),
      wristCm, count: stats.count, total: stats.price,
    })

    const lines =
      lang === 'zh'
        ? [
            `【${t('brand.name')} · 手链定制订单】`,
            `姓名：${name}`,
            phone ? `电话：${phone}` : null,
            `地址：${address}`,
            '——',
            `设计：${stats.count} 颗 · 周长 ${stats.circumferenceCm.toFixed(1)}cm · 约 ${stats.weightG.toFixed(1)}g`,
            `成分：${composition.join('、')}`,
            `合计：${money(stats.price)}`,
            '——',
            '（我已保存设计图，稍后在对话里发送图片给你 🙏）',
          ]
        : [
            `[${t('brand.name')} · Custom Bracelet Order]`,
            `Name: ${name}`,
            phone ? `Phone: ${phone}` : null,
            `Address: ${address}`,
            '--',
            `Design: ${stats.count} pcs · ${stats.circumferenceCm.toFixed(1)}cm · ~${stats.weightG.toFixed(1)}g`,
            `Beads: ${composition.join(', ')}`,
            `Total: ${money(stats.price)}`,
            '--',
            '(I have saved the design image and will send it in this chat 🙏)',
          ]
    window.open(waLink(lines.filter(Boolean).join('\n')), '_blank')
  }

  return (
    <Modal open={open} onClose={onClose} title={t('order.title')} subtitle={t('order.sub')} maxWidth="max-w-md">
      {/* 完整手链图 —— 限制高度，object-contain 保证整条可见 */}
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-card dark:border-white/10 dark:from-neutral-800 dark:to-neutral-900">
        {preview ? (
          <img src={preview} alt={t('order.preview')} className="mx-auto max-h-[40vh] w-auto object-contain" />
        ) : (
          <div className="grid h-40 place-items-center text-neutral-400">{t('export.generating')}</div>
        )}
      </div>

      {/* 汇总 */}
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-2.5 dark:bg-white/5">
        <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
          {stats.count} {t('unit.pcs')} · {stats.circumferenceCm.toFixed(1)}cm
        </span>
        <span className="text-lg font-bold text-brand-600 dark:text-brand-300">{money(stats.price)}</span>
      </div>

      {/* 保存 / 分享 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniBtn onClick={savePng} icon={<DownloadIcon size={18} />} label={t('export.png')} />
        <MiniBtn onClick={shareImg} icon={<ShareIcon size={18} />} label={t('export.share')} />
      </div>

      {/* 收货信息 */}
      <div className="mt-4 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('order.name.ph')} className={inputCls} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('order.phone.ph')} className={inputCls} />
        </div>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder={t('order.address.ph')} className={inputCls} />
      </div>

      <button
        onClick={sendOrder}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 font-semibold text-white shadow-glow transition hover:brightness-105 active:scale-[0.99]"
      >
        <WhatsAppIcon size={20} /> {t('order.send')}
      </button>
      <p className="mt-2 px-1 text-[11px] leading-relaxed text-neutral-400">{t('order.note')}</p>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-6">
          <div className="rounded-full bg-neutral-900/90 px-4 py-2 text-center text-[13px] text-white shadow-card-lg animate-scale-in dark:bg-white/90 dark:text-neutral-900">{toast}</div>
        </div>
      )}
    </Modal>
  )
}

const inputCls =
  'w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-neutral-800 dark:text-white'

function MiniBtn({ onClick, icon, label, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 rounded-2xl border border-black/5 bg-white py-2.5 text-neutral-700 shadow-card transition hover:text-brand-600 active:scale-95 disabled:opacity-50 dark:border-white/5 dark:bg-neutral-800 dark:text-neutral-200"
    >
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  )
}

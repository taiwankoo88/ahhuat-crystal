// 顾客「我的订单」：保存在本机浏览器（localStorage），不依赖云端。
// 点「发送订单到 WhatsApp」时写入一条；订单页读取显示。
// 新结构请换 key，不要原地改（见 CLAUDE.md §4）。
import { useSyncExternalStore } from 'react'

const KEY = 'ah_myorders_v1'
const MAX = 50

function read() {
  try {
    const v = localStorage.getItem(KEY)
    const a = v ? JSON.parse(v) : []
    return Array.isArray(a) ? a : []
  } catch {
    return []
  }
}
function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* 配额满/隐私模式：忽略，订单仍已发到 WhatsApp */
  }
}

let orders = read()
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

// order: { type:'diy'|'product', total, name, phone, address, ... }
export function addMyOrder(order) {
  const rec = { id: `o_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, at: Date.now(), ...order }
  orders = [rec, ...orders].slice(0, MAX)
  save(orders)
  emit()
}
export function removeMyOrder(id) {
  orders = orders.filter((o) => o.id !== id)
  save(orders)
  emit()
}
export function clearMyOrders() {
  orders = []
  save(orders)
  emit()
}

function subscribe(l) {
  listeners.add(l)
  return () => listeners.delete(l)
}
export function useMyOrders() {
  return useSyncExternalStore(subscribe, () => orders, () => orders)
}

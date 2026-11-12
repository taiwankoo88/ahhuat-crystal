// 成品库存：记在每个尺寸上 sizes: [{ size, price, stock? }]
// stock 留空/缺省 = 不限（不跟踪）；0 = 售罄。sizes 是自由 JSON，云端原样保存，无需改表。
export const LOW_STOCK = 3

export const tracked = (s) => !!s && s.stock != null && s.stock !== ''
export const soldOut = (s) => tracked(s) && Number(s.stock) <= 0
export const lowStock = (s) => tracked(s) && Number(s.stock) > 0 && Number(s.stock) <= LOW_STOCK
export const allSoldOut = (p) => !!p?.sizes?.length && p.sizes.every(soldOut)

# CLAUDE.md · 阿发水晶阁 AH HUAT CRYSTAL PAVILION

> 给 Claude Code 的项目记忆。每次开新会话先读这里，再动手。
> 当前版本：**v49**（2026-11-12）。版本号写在 `src/App.jsx` Profile 底部的 `<p>` 里，以及每条 commit message 的结尾 `(vNN)`。**每次代码改动都要同时把这两处 +1；纯文档（CLAUDE.md / README / docs）改动不升版本。**

---

## 1. 这是什么

马来西亚水晶小店「阿发水晶阁」的**移动端优先** Web App：

- 顾客端：DIY 水晶手链设计器（圆环预览、拖拽、撤销/重做、手围→颗数、自动算价）+ AI/星座/五行/生日推荐 + 成品实拍商城 + 一键 WhatsApp 下单。
- 商家端：内置「商家后台」（我的 → 商家后台），管理 DIY 珠子、成品、WhatsApp 号、密码；上云后多出 统计 / 订单 / 客户 三个 CRM 页。
- 部署：Cloudflare Pages + D1（免费）。**没有云端时整个 App 也能纯前端跑**（localStorage），所有 API 调用 best-effort、静默失败。

业务常量（勿随意改）：

| 项 | 值 | 位置 |
|---|---|---|
| 货币 | `RM`（马来西亚令吉），整数四舍五入 | `src/i18n.jsx` `money()` |
| WhatsApp | `60127718812`（不含 +） | `src/data/store.js` `DEFAULT_WA`、`schema.sql` |
| 后台默认密码 | `ahhuat888`（可被环境变量 `ADMIN_PASSWORD` 和数据库 `settings.admin_pass` 覆盖） | `store.js`、`functions/api/_lib.js`、`public/_worker.js` |
| 珠径 | 8 / 10 / 12 mm，价格系数 1 / 1.5 / 2.2（6mm 已在 v43 移除） | `src/data/crystals.js` |
| 手围 | S15 / M16 / L17 / XL18 cm；颗数 = (手围+1.5cm)×10 / 珠径 | `src/utils/bracelet.js` |

---

## 2. 技术栈与命令

React 18 + Vite 5 + Tailwind 3（`darkMode: 'class'`）+ jsPDF。**没有 TypeScript、没有 ESLint、没有测试。**

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # → dist/（Cloudflare Pages 用这个）
npm run build:single   # → dist-single/index.html 单文件离线版
npm run preview
```

**推送前必须 `npm run build` 通过。** 这是唯一的自动检查。

---

## 3. 目录地图

```
index.html                 入口 + OG/Twitter 分享 meta（og:url 指向 https://ahhuat.pages.dev/）
public/_worker.js          ★ Cloudflare Pages「高级模式」Worker：完整 CRM API（见 §5 陷阱）
public/share.jpg           分享卡片 1200×630
functions/                 Pages Functions 版 API（与 _worker.js 内容重复，见 §5）
schema.sql                 D1 表结构：products / beads / overrides / orders / customers / settings
wrangler.toml              仅声明 name + 输出目录；D1 绑定在控制台做
docs/上线指南-Cloudflare.md  给老板看的零代码上线步骤（中文）

src/
  main.jsx                 挂载 <LangProvider><App/>
  App.jsx                  外壳：Header、5 个底部 Tab、深/浅色、Orders(占位) 与 Profile 页
  i18n.jsx                 ★ 全部 UI 文案字典 DICT.zh / DICT.en + 水晶/星座/分类等的英文映射
  index.css                Tailwind 指令 + 全局效果类（glass、no-scrollbar 等）
  data/
    crystals.js            16 种内置水晶 + SPACER + CRYSTAL_MAP + beadPrice/beadWeight
    products.js            2 个内置成品（东陵玉、黄水晶）含尺寸→RM 价格
    recommendations.js     星座/五行/幸运色/生日月/预设/随机 推荐引擎（规则表，不是真 AI）
    store.js               ★ 商家数据 store：localStorage 为真源 + 云端 best-effort 同步
    api.js                 fetch 封装；cloudReady() 探测 /api/state 决定是否云端模式
  utils/
    bracelet.js            makeBead / summarize / recommendCount / beadsToFill / layoutRing / fitRingRadius
    render.js              Canvas 产品图/分享图/PNG/PDF 导出
  components/
    Home.jsx               首页：hero、4 功能卡、星座生日配对、臻选实拍、AI 入口、知识入口
    Designer.jsx           ★ 设计页主体：顶部 4 模式 Tab、圆环+工具轨、手围/珠径、动作卡、分类、搜索、水晶网格、能量分析
    BraceletRing.jsx       SVG 圆环手链（点选、飞入动画）
    Bead.jsx               单颗珠子（photo 优先，否则径向渐变）
    SortableBeadStrip.jsx  底部可拖拽珠链
    SmartRecommend.jsx     智能搭配面板
    ExportSheet.jsx        ★ 保存/分享/下单弹窗：填姓名电话地址 → 下载 PNG → 云端 createOrder → 跳 WhatsApp
    ProductSheet.jsx       成品详情 + 选尺寸 + 收货信息 → 云端 createOrder（items.type='product'）→ WhatsApp
    EnergyGuide.jsx        「发现」页：水晶能量图鉴
    Admin.jsx              ★ 商家后台：stats/orders/customers/beads/products/settings 六个 tab
    CrystalBackground.jsx  每个 Tab 的宇宙/水晶背景（深色模式）
    Modal.jsx / icons.jsx / CrystalIcons.jsx / NavGlossIcons.jsx / effects.jsx
  assets/                  全部 .webp：beads/ products/ backgrounds/ feat/ brand/ ai/ bg/
```

---

## 4. 数据流（改功能前先理解）

1. **内置数据**（`crystals.js`、`products.js`）是代码常量。
2. **商家改动**分三类，都进 `store.js` 的 state 并写 localStorage：
   - 新增自定义珠子/成品 → `state.beads` / `state.products`（id 前缀 `c_` / `p_`）
   - 编辑内置项 → `beadEdits` / `productEdits`（patch 叠加在内置项上）
   - 隐藏内置项 → `beadHidden` / `productHidden`
3. 自定义珠子通过 `registerBead()` 注入 **`CRYSTAL_MAP`**（可变对象），所以设计器、算价、渲染不用改就能用它们。
4. 页面要拿「生效后的列表」用 `effectiveDefaultBeads(store)` / `effectiveDefaultProducts(store)` + `store.beads` / `store.products`，**不要直接用 `CRYSTALS`/`PRODUCTS` 渲染商家可编辑的内容**。
5. 云端：启动时 `syncFromCloud()` 拉 `/api/state` 覆盖本地并缓存；每次写操作 `push()` 到 API（需 token）。云端不可用时一切照常在本地工作。
6. 登录 token = `sha256(密码 + '::' + AUTH_SECRET)`，存 localStorage `ah_token_v1`。改密码会让旧 token 失效。
7. 云端 `orders.items` 是自由 JSON：DIY 单是 `{ beads:[crystalId…], wristCm, count }`，成品单是 `{ type:'product', productId, name, size, price, qty }`。后台订单页只显示 `summary` 字符串，不解析 `items`。

localStorage key 全部带 `_v1` 后缀（`ah_beads_v1` 等），主题键是 `sl-theme4`。**改结构要换新 key 而不是原地改，避免老用户数据坏掉。**

---

## 5. 陷阱与硬规则

- **★ API 有两份实现，必须同步改**：`public/_worker.js` 会被复制到 `dist/_worker.js`，Cloudflare Pages 检测到它就进入「高级模式」并**忽略 `functions/` 目录**。也就是说线上跑的是 `_worker.js`；`functions/` 是同一套逻辑的 Functions 写法（备用/本地 wrangler）。改任何接口，两边都改，或者先决定删掉一份。
- **所有 UI 文案走 i18n**：`t('key')` 或 `lang === 'zh' ? … : …`。新增文案要同时加 `DICT.zh` 和 `DICT.en`。水晶名/关键词英文在 `CRYSTAL_I18N`。
- **默认浅色模式**（v45 决定，键 `sl-theme4`）。所有新 UI 必须在浅色下可读，再补 `dark:` 变体。
- **移动端优先**：底部固定导航（`pb-28`/`pb-32` 留白）、`env(safe-area-inset-*)`、点击目标 ≥ 36px、`active:scale-95` 反馈。桌面只是放大版。
- **性能**：v34 因为卡顿砍过动画。背景发光用静态 CSS，不要加持续的 transform/filter 动画、大面积 blur 动画、每帧 setState。
- **图片**：一律 `.webp`，放 `src/assets/` 用 import 引用（Vite 会 hash）；商家上传的照片经 `compressImage()` 压到 ≤512px 存 dataURL。
- **iPhone HEIC** 照片解码会失败，`Admin.jsx` 已有提示逻辑，别删。
- **localStorage 写入可能抛异常**（配额/隐私模式），统一走 `store.js` 的 `write()`，不要裸调 `localStorage.setItem`。
- 不要把 `CRYSTALS` 里的 `id` 改名：推荐引擎、i18n、订单 items 都靠 id 关联。
- `vite.config.js` 的 `base: './'` 是为了 githack/单文件/子路径都能打开，不要改成 `/`。
- commit / PR 里**不要出现模型名**。

---

## 6. 部署现状

- 仓库 `blessingfoodsdnbhd-spec/desmond`。**GitHub 默认分支 = 生产分支 = `claude/jewelry-diy-app-ec4kjm`**（上线指南和 Cloudflare Pages 都指向它）。
- `main` 分支从 v47 起与生产分支同步（每次合并 PR 到生产分支后，把生产分支 head 快进推到 main：`git push origin origin/claude/jewelry-diy-app-ec4kjm:main`）。之前 main 长期停在 v25。
- 开发分支按会话分配（如 `claude/elegant-mccarthy-t5q3bh`），从生产分支切出，完成后 push 并开 draft PR **合回生产分支**。
- 线上域名：`ahhuat.pages.dev`（写在 `index.html` 的 og 标签里；如果换域名要一起改）。
- Cloudflare 侧手工配置：D1 绑定变量名 `DB`、环境变量 `ADMIN_PASSWORD`、`AUTH_SECRET`。

---

## 7. 已知未完成 / 待办（按价值排序）

1. ~~顾客端「订单」Tab 是空壳~~ v48 已做（本机记录）。仍缺：订单状态（需要一个顾客可读的查询接口，`_worker.js` 和 `functions/` 都要改）、本地「我的设计」保存。
2. ~~库存字段没用起来~~ v49 已做成品库存，记在 `sizes[].stock`（不用表里的 `stock` 列：它默认 0，无法区分「没设置」和「售罄」）。仍缺：下单/完成订单时自动扣减；DIY 珠子没有库存。
3. **`functions/` 与 `_worker.js` 重复**（见 §5），迟早漂移。建议删 `functions/`，只留 `_worker.js`。
4. **README 已过时**（还写着 12 种水晶、无后台、无 i18n）。
5. 没有任何测试/lint；`bracelet.js` 和 `store.js` 是最值得先加单测的两个纯逻辑文件。
6. Profile 页四行（我的设计 / 收藏 / 资料 / 关于）是静态占位。
7. 后台密码默认值 `ahhuat888` 硬编码在三处；上线后务必在 Cloudflare 设置 `ADMIN_PASSWORD`。

---

## 8. 版本流水（近期）

| 版本 | 内容 |
|---|---|
| v49 | 成品库存：每个尺寸可填库存（`sizes[].stock`，留空=不限，0=售罄），后台可编辑，顾客端显示售罄/仅剩 N；不自动扣减。规则在 `src/utils/stock.js` |
| v48 | 顾客「订单」Tab：下单时写本机 `ah_myorders_v1`（`src/data/myOrders.js`、`MyOrders.jsx`），不依赖云端、不显示订单状态 |
| v47 | 成品下单进 CRM：ProductSheet 加收货信息表单，云端 createOrder（summary 前缀「成品 ·」） |
| v46 | OG/Twitter 分享预览 + share.jpg |
| v45 | 默认浅色模式；设计页浅色可读性 |
| v44 | 改手围/珠径自动重排颗数 |
| v43 | 价格随设置实时变；移除 6mm |
| v41 | 后台加产品失败修复（localStorage 配额、HEIC） |
| v35 | 设计页按 ZIP 设计稿重做 |
| v34 | 性能：砍动画 |

更早的看 `git log --oneline`。

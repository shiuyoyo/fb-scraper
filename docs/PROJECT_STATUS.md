# 專案現況與交接說明

> 最後更新：2026-10-27（v2.9 + 五個 Kit 全部接上 Google Sheet）
> 給接手的人（含 Claude Code）：**動手前先讀完這份**。
> 裡面有幾個已經踩過、修好、但很容易被改回去的坑。

---

## 一、這是什麼

EvalyCloud Website Kits — 把網站產品化，賣給小商家的可重複使用模板系統。

- 一份 monorepo，多個 Kit（產業類型），每個 Kit 多款 Template（視覺變體）
- 客戶內容放在 `customers/<slug>/`，模板不為客戶改動
- 客戶可用自己的 Google 試算表改公開內容
- 部署到客戶自己的 Cloudflare Pages 帳號
- **一般方案不交付原始碼**（見 `docs/SERVICE_DELIVERY_MODEL.md`）

治理規則在 `CLAUDE.md` 與 `docs/Product_Bible.md`：
動工前先給計畫／檔案／假設／驗收清單／風險；新想法進 Backlog；重要變更寫 RFC。
**Product Bible 不要改**，產品決策寫進 `docs/RFC/`。

---

## 二、產品矩陣（5 Kit × 3 Template = 15）

| Kit | Template 1 | Template 2 | Template 3 |
|---|---|---|---|
| business | **classic ✅** | visual ⏳ | minimal ⏳ |
| restaurant | **classic ✅** | visual ⏳ | minimal ⏳ |
| event | **classic ✅** | festival ⏳ | minimal ⏳ |
| education | **classic ✅** | playful ⏳ | minimal ⏳ |
| portfolio | **classic ✅** | visual ⏳ | minimal ⏳ |

**5 款 available、10 款 planned。**

機器可讀的來源是 `packages/templates/src/matrix.ts` 的 `availableTemplates`。
`templateStatus()` 產出完整矩陣與狀態，`packages/templates/test/registry.test.ts` 驗證它。

規則：
- planned 的模板**不可以**被悄悄 fallback 成 classic 然後當作完成
- 只有「舊內容完全沒寫 template 欄位」時才用該 Kit 的 classic
- scaffold 遇到 planned 模板會明確拒絕、不建立資料夾

---

## 三、架構地圖

```
apps/
  marketing-site        :3000
  business-kit-demo     :3001
  event-kit-demo        :3002
  restaurant-kit-demo   :3003
  education-kit-demo    :3004
  portfolio-kit-demo    :3005
packages/
  content-schema    所有 Kit 的型別 + templateMatrix（唯一的產品矩陣來源）
  templates         matrix.ts（純資料、可測）+ registry.tsx（接元件）+ 各 Kit 模板
  ui                Container / SectionTitle / Button / CtaLink
  config            themes.ts（五組色盤）、tailwind-preset.ts、自帶 Inter 字型
  external-data     CSV parser / sheet loader / merge / 各 Kit mapper
customers/
  <slug>/content.ts     該客戶全部內容
  <slug>/site.json      slug / kit / template / domain / cloudflareProject
  <slug>/images/        壓縮後的圖（進版控）
  <slug>/images-source/ 原圖（gitignore）
scripts/
  new-customer / use-customer / dev-customer / build-customer
  list-customers / optimize-images / resolve-content
```

**資料流**

```
customers/<slug>/content.ts  （本地 fallback，永遠完整）
   ↓ scripts/use-customer.mjs（build 前，在 Node 裡跑）
   ↓ 抓 Google Sheet → parse → mapping → merge → 驗證
apps/<kit>-kit-demo/app/content.generated.ts （已解析好的內容，gitignore）
   ↓
page.tsx（同步，不 fetch）→ Kit entry → registry → Template
```

---

## 四、⚠️ 已踩過的坑（最重要的一節）

這四個都已經修好了。**改動相關區域時請確認沒有改回去。**

### 1. Tailwind 的 content 路徑必須寫在每個 app 裡

**症狀**：雲端 build 出來的網站是純文字、完全沒排版。CSS 只有約 5.9KB。

**原因**：content glob 原本放在共用 preset 裡用相對路徑（`../../packages/...`），
本機跑得到、Cloudflare build 的工作目錄不同就掃不到 `packages/` 裡的模板，
整套版面 utility 都沒生成。

**現在的作法**：`packages/config/tailwind-preset.ts` **不放 content**（型別是
`satisfies Partial<Config>`），每個 `apps/*/tailwind.config.ts` 自己列：

```ts
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  "../../packages/templates/src/**/*.{js,ts,jsx,tsx}",
],
```

**檢查方式**：build 後 `apps/<kit>-kit-demo/out/_next/static/css/*.css`
應該有 **17KB 以上**，且含得到 `.py-14`、`.grid`、`.bg-primary`。
掉回 6KB 左右就是又壞了。

### 2. 靜態輸出不會執行頁面裡的 fetch

**症狀**：Google Sheet 接好了、網址對、權限對，但網站永遠顯示本地內容，
build log 裡完全沒有抓取的痕跡。

**原因**：`output: "export"` 之下，Next 不會在 build 時執行 async page 的
`fetch`，那段抓 Sheet 的程式等於被跳過。

**現在的作法**：Sheet 的抓取與合併移到 `scripts/use-customer.mjs`，
它在 `next build` **之前**用純 Node 執行（prebuild hook，帶
`--experimental-strip-types` 才能 import `.ts`），把解析好的內容寫進
`content.generated.ts`。**page.tsx 是同步的，不 fetch。**

**所以**：`apps/*/package.json` 的 `predev` / `prebuild` / `pretypecheck` /
`prelint` 都必須是：

```
node --experimental-strip-types ../../scripts/use-customer.mjs --ensure <kit>
```

拿掉 `--experimental-strip-types` 會壞。
把 fetch 搬回 page.tsx 也會壞（而且是無聲的壞）。

`sheet.ts` 的 fetch **不要加 `next: { revalidate }`** —— 靜態站沒有 server
可以 revalidate，加了會和 export 衝突。

### 3. 主題變數要有 `:root` 預設值

`bg-background`、`text-foreground` 這些 token 解析成
`rgb(var(--color-background))`。模板最外層的 div 會注入客戶色盤，但 `<body>`
在那個 div **外面**，吃不到變數。

所以每個 app 的 `app/globals.css` 的 `:root` 有一份預設（ocean）色盤。
刪掉它，body 的顏色就會空掉。

### 4. CSV 範本裡的中文逗號

Sheet 範本 CSV 裡，句子中間要用**全形逗號（，）**，
或讓欄位被引號包住。半形逗號會把欄位切斷。

`customers/demo-restaurant/sheet-template/` 裡的六份都已驗證欄數正確。

---

## 五、Google Sheet 內容管理

### 現況

**五個 Kit 都接好了，網站上每一段客戶內容都能從試算表改。**
各 Kit 的分頁與欄位、客戶操作說明、開發者設定步驟都在 `docs/GOOGLE_SHEETS_CONTENT.md`。

| Kit | 分頁 |
|---|---|
| business | `site` · `services` · `gallery` · `faq` |
| restaurant | `site` · `featured` · `menu` · `openingHours` · `announcements` · `faq` · `gallery` |
| event | `site`（含 `status`/`notice`/`registered`/`capacity`）· `schedule` · `speakers` · `announcements` · `faq` · `sponsors` |
| education | `site` · `features` · `courses` · `teachers` · `gallery` · `faq` |
| portfolio | `site` · `projects` · `services` · `clients` |

`site` 分頁是 key/value，涵蓋所有單一值欄位（hero、按鈕、about、聯絡、地點、
訂位／報名、段落標題 `labels.*`、SEO、色盤）。

### 程式在哪

- `packages/external-data/src/kit-sheets.ts`：通用流程。每個 Kit 一份 `KitSheetSpec`
  （可選欄位 + 列表分頁），同一份 spec **同時負責解析與匯出範本**
- `packages/external-data/src/<kit>.ts`：各 Kit 的 spec 與列表 mapper
- `packages/external-data/src/resolve.ts`：`resolveCustomerContent(kit, content)`，
  `scripts/resolve-content.mjs` 呼叫它
- `pnpm sheet:template <slug>`：從 `content.ts` 產生預先填好的分頁 CSV
- `packages/external-data/test/kits.test.ts`：**涵蓋率測試**——把每個 demo 的內容全部
  換成佔位字，再用它匯出的試算表解析回來，必須和原內容完全一樣。
  **新增 schema 欄位卻沒接上試算表，這個測試會失敗。**

### 試算表改不了的

`site.template`、`site.language`、`site.sheets`、`site.sheet`、`site.status` 被鎖住
（`LOCKED_PATHS`）；`site.theme` 只接受五個色盤名稱。活動狀態只能透過 `status` 列，
且只能讓頁面更保守（`resolveStatus`）。

### Event 的即時值

`status` / `notice` / `registered` / `capacity` 和內容一樣，在 build 前由
`use-customer.mjs` 解析，寫成 `content.generated.ts` 的 `export const live`。
**`apps/event-kit-demo/app/page.tsx` 不 fetch**（原本在頁面裡 fetch，正是第四節第 2 點的坑）。
舊的單一分頁 `site.sheet` 仍支援。

### 合併規則（`packages/external-data/src/merge.ts`）

```
本地 fallback → 有效的 Sheet 值覆寫 → 重新通過 schema → 交給 Template
```

- 空白格 = **保留** fallback，不清空
- 要刻意清空填 `__EMPTY__`
- 陣列欄位（如 `venue.transportNotes`）用 `|` 分隔
- 無效值不覆寫有效 fallback
- 單一壞資料列只丟那一列
- 整個 source 失敗 → 該段用 fallback，**網站不會壞**
- schema 沒宣告的欄位會被忽略，不會憑空新增
- 可選物件（如 `hero.image`、`hero.secondaryCta`）可以從試算表新增；
  必要欄位沒填齊（沒有 src 的圖、沒有連結的按鈕）就整個不加
- 列表分頁的 `enabled=false` 列會被略過；`sort_order` 決定順序

### 價格

`price`（數字）與 `priceLabel`（文字，如「時價」「請洽詢」）**分開**。
不要把所有價格強制轉 number，不可產生 NaN。
`formatPrice()` 在 `packages/external-data/src/price.ts`。

### 生效時機

**靜態網站，改完 Sheet 要重新 build 才會更新。**
不是即時的。跟客戶講清楚這點。

前端即時讀取曾被要求，評估後否決（需要 client JS、CSV 網址會進 bundle、
有 CORS 問題），列在 Backlog。理由寫在 RFC-002。

---

## 六、部署

### 已上線

`restaurantdemo-3fu.pages.dev` — Restaurant demo（森日蔬食），
Google Sheet 接 `site` 分頁，已驗證改試算表→重 build→網站更新。

**其他四個 Kit 尚未部署。**

### Cloudflare Pages 設定（這條路才對）

走 **Pages**，不要走 Workers Builds（會變成 hello world）。

| 欄位 | 值 |
|---|---|
| Framework preset | None |
| Build command | `npx pnpm install && npx pnpm --filter @evalycloud/<kit>-kit-demo build` |
| Build output directory | `apps/<kit>-kit-demo/out` |
| 環境變數 | `NODE_VERSION` = `22` |

### 一個客戶一個專案

同一個 repo，用環境變數 `CUSTOMER` 決定這個專案 build 誰：

```
CUSTOMER = wanglai-cafe
```

沒設就用該 Kit 的預設 demo 客戶。**已實測**：設了之後產出的網站只含該客戶，
其他客戶的內容不會出現。

### 靜態輸出

六個 app 的 `next.config.ts` 都有：

```ts
output: "export",
images: { unoptimized: true },
trailingSlash: true,
```

這是單向的：之後若需要 server 功能（表單、ISR）要改走別的方案。
目前產品是純展示站，這樣最省最快。

---

## 七、新增客戶流程

```bash
pnpm new:customer <slug> <kit> [template]     # 省略 template = classic
# 編 customers/<slug>/content.ts
# 原圖丟 customers/<slug>/images-source/{logo,hero,gallery,thumbnail}/
pnpm images <slug>                             # 壓縮成 WebP 進 images/
pnpm dev:customer <slug>                       # 本機預覽
pnpm build:customer <slug>                     # 建置
pnpm customers                                 # 列出所有客戶
```

命名建議用客戶名（`wanglai-cafe`），不要用 `restaurant-custom1`，
因為 kit 已經記在 `site.json` 裡了。

圖片工具（`pnpm images`）：WebP 轉換、EXIF 轉正、不放大小圖、
分類尺寸上限、檔名 ASCII 化、HEIC 跳過並提示。
`images-source/` 不存在時**什麼都不做**（不會刪掉重建不回來的東西）。

---

## 八、尚未完成（待辦）

### A. 10 款模板變體

`business/visual`、`business/minimal`、`restaurant/visual`、`restaurant/minimal`、
`event/festival`、`event/minimal`、`education/playful`、`education/minimal`、
`portfolio/visual`、`portfolio/minimal`

做法：一個元件檔 + `matrix.ts` 的 `availableTemplates` 加一個字串 +
`registry.tsx` 的 `implemented` 加一行。**不要只換顏色**——
Hero 版面、導覽方式、區塊排列、圖片比例、CTA 呈現、手機版資訊層級要有實質差異。

每款完成後 `registry.test.ts` 的數量斷言要跟著更新。

### B. ~~其他四個 Kit 的 Google Sheet 接線~~ ✅ 已完成

見第五節。每位真實客戶仍需要做一次：`pnpm sheet:template <slug>` → 匯入
Google 試算表 → 發布各分頁 → 把 CSV 網址貼進 `content.ts`。

### C. 其他四個 Kit 部署到 Cloudflare

流程已經跑通，照第六節複製設定、換名字即可。

### D. 真機驗收

Restaurant 的手機版已經人工看過，排版正確。
**其他四個 Kit 的手機版還沒有在真機上看過。**
這是唯一只能人工做的事。

### E. 觸發重新部署的方式

目前是手動（push 或 Cloudflare 的 Retry deployment）。
「客戶自己按更新」的三條路線寫在 `docs/CUSTOMER_DEPLOYMENT.md`，
建議等真的有客戶、跑過一次手動流程再選。

---

## 九、驗收指令

```bash
pnpm typecheck      # 6 apps
pnpm lint           # 6 apps
pnpm test           # 48 tests
pnpm build          # 6 apps
pnpm build:customer demo-restaurant
```

全部通過才算完成。另外檢查：
- `pnpm dev` 不帶參數仍可正常啟動
- 切換客戶後 `apps/*/public/images/` 沒有殘留上一個客戶的圖
- CSS 檔大小 17KB 以上（見第四節第 1 點）

---

## 十、設計系統

五組色盤（`packages/config/themes.ts`），全部通過 WCAG AA：

| key | 名稱 | 主色 | 適合 |
|---|---|---|---|
| `ocean` | 專業海藍 | `#2563EB` | 科技、顧問、診所（預設） |
| `forest` | 自然墨綠 | `#15803D` | 有機、農產、療癒 |
| `ivory` | 象牙石板 | `#334155` | 顧問、律師、攝影、婚紗 |
| `terracotta` | 暖陶土 | `#C2410C` | 餐飲、咖啡、零售 |
| `plum` | 質感紫 | `#6D28D9` | 美業、課程、藝文 |

在 `content.ts` 的 `site.theme` 指定。語意色（success/warning/danger）**不隨品牌變**。

字型：Inter 自架（`packages/config/fonts/`，附 OFL 授權），
中文走系統字型（PingFang TC / 微軟正黑 / Noto Sans CJK），
**不載中文 webfont**——Noto Sans TC 三個字重合計 9.4MB，
換成系統字型後每站字型傳輸只剩 47KB。

無障礙：所有模板有 skip link、原生 `<details>` 做手機選單與 FAQ（零 client JS）、
鍵盤可操作。

---

## 十一、相關文件

| 檔案 | 內容 |
|---|---|
| `CLAUDE.md` | 工作流程規範 |
| `docs/Product_Bible.md` | 產品定義（**不要改**） |
| `docs/RFC/RFC-001` | 可選品牌色盤的決策 |
| `docs/RFC/RFC-002` | 15 款模板矩陣、分階段交付、Sheet 架構、風險 |
| `docs/SERVICE_DELIVERY_MODEL.md` | 交付邊界：不給原始碼、帳號歸屬、只處理公開資料 |
| `docs/CUSTOMER_DEPLOYMENT.md` | 部署三條路線與取捨 |
| `docs/GOOGLE_SHEETS_CONTENT.md` | 給客戶看的試算表操作說明 |
| `customers/README.md` | 客戶資料夾結構 |
| `customers/demo-restaurant/sheet-template/` | 六份 Sheet 範本 CSV + 說明 |

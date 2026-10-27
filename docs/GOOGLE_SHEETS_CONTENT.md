# 用 Google 試算表管理網站內容

五個 Kit 都支援：**網站上客戶看得到的每一段內容，都可以在 Google 試算表裡改。**
改完試算表 → 網站重新建置一次 → 網站更新。

前半是給客戶看的操作說明，最後一節「開發者設定」是給接案的人看的。

---

## 能放什麼、不能放什麼

試算表只放**網站上本來就公開的內容**：名稱、介紹、服務、菜單、價格、課程、作品、
營業時間、公告、常見問題、圖片網址、公開電話、地址、社群連結。

**不要放**任何私人資料：客戶名單、訂單、付款、卡號、私人預約、身分證字號、密碼、
API 金鑰。試算表必須「發布到網路」才能運作，裡面的一切都要當作公開資料。

---

## 試算表的結構

一份試算表、好幾個分頁。每個分頁對應網站的一段，**各自獨立**：
菜單分頁打錯字，不會影響營業時間或其他段落。

每個 Kit 都有一個 **`site` 分頁**，加上幾個**列表分頁**。

### `site` 分頁（所有 Kit 都有）

兩欄：`key` / `value`，一列一個欄位。**`key` 欄不要改，只改 `value`。**

| key | value |
|---|---|
| site.name | 森日蔬食 |
| hero.tagline | 讓蔬食成為每天都想吃的料理 |
| hero.primaryCta.label | 免費諮詢 |
| contact.phone | 07-123-4567 |
| labels.faq | 常見問題 |

涵蓋所有「只有一個值」的欄位：

- **品牌**：`site.name`、`site.logo`、`site.theme`（色盤，見下方）
- **首頁大圖區**：`hero.*` 的標題、副標、介紹、按鈕文字與連結、大圖（`hero.image.src` / `hero.image.alt`）
- **關於**：`about.title`、`about.description`
- **聯絡**：`contact.phone`、`email`、`lineUrl`、`instagramUrl`、`facebookUrl`、`mapUrl`
- **地點**：`venue.*`（地址、地圖、交通）
- **訂位／報名**：`reservation.*`（餐廳）、`enrollment.*`（教育）
- **段落標題**：`labels.*`，留空就用預設標題（例如「常見問題」）
- **搜尋引擎**：`site.seo.title`、`site.seo.description`、`site.seo.ogImage`

範本裡 `value` 是空白的列，代表「目前網站沒有用到，想加就填」。

**`site.theme`** 只能填這五個之一，填錯會被忽略：
`ocean`（海藍）、`forest`（墨綠）、`ivory`（象牙）、`terracotta`（陶土）、`plum`（紫）。

**一格多條**：`venue.transportNotes`（交通說明）用 `|` 分隔：
`捷運 2 號出口步行 5 分鐘。|鄰近有付費停車場。`

**試算表改不了的**（避免網站被改壞）：模板款式、語言、試算表連線設定，以及活動狀態
（活動請用下面的 `status` 列）。

### 各 Kit 的列表分頁

第一列是欄位標題，**標題不要改**；一列一筆，可自由增減列。

**Business（形象官網）**

| 分頁 | 欄位 |
|---|---|
| `services` 服務項目 | title, description, enabled, sort_order |
| `gallery` 作品照片 | src, alt, enabled, sort_order |
| `faq` 常見問題 | question, answer, enabled, sort_order |

**Restaurant（餐廳）**

| 分頁 | 欄位 |
|---|---|
| `featured` 人氣料理 | item_id, item_name, item_description, price, price_label, currency, image_src, image_alt, tags, sold_out, item_sort |
| `menu` 完整菜單 | category_id, category_name, category_description, category_sort, item_id, item_name, item_description, price, price_label, currency, image_src, image_alt, tags, featured, new_item, sold_out, item_sort |
| `openingHours` 營業時間 | day, closed, open_1, close_1, open_2, close_2, note, sort_order（`day` 填 monday…sunday） |
| `announcements` 最新優惠 | id, title, body, enabled, sort_order |
| `faq` 常見問題 | question, answer, enabled, sort_order |
| `gallery` 照片 | src, alt, enabled, sort_order |

菜單是一列一道菜，分類欄位（category_*）往下重複填。

**Event（活動）**

| 分頁 | 欄位 |
|---|---|
| `schedule` 議程 | day_label, day_date, time, title, description, location, enabled, sort_order |
| `speakers` 講者／表演者 | name, role, bio, photo_src, photo_alt, link_label, link_href, enabled, sort_order |
| `announcements` 公告 | date, title, body, enabled, sort_order |
| `faq` 常見問題 | question, answer, enabled, sort_order |
| `sponsors` 主辦／協辦／贊助 | name, tier, logo_src, logo_alt, url, enabled, sort_order |

議程是一列一個時段，`day_label`、`day_date`（如「第一天」「2026.08.15（六）」）往下重複填。

**Education（教育／補習班）**

| 分頁 | 欄位 |
|---|---|
| `features` 特色 | title, description, enabled, sort_order |
| `courses` 課程 | id, name, audience, description, price_label, schedule, duration, image_src, image_alt, tags, featured, enabled, sort_order |
| `teachers` 師資 | name, title, bio, photo_src, photo_alt, subjects, enabled, sort_order |
| `gallery` 環境照片 | src, alt, enabled, sort_order |
| `faq` 常見問題 | question, answer, enabled, sort_order |

**Portfolio（作品集）**

| 分頁 | 欄位 |
|---|---|
| `projects` 作品 | id, title, meta, description, cover_src, cover_alt, image_srcs, image_alts, tags, url_label, url_href, featured, enabled, sort_order |
| `services` 服務 | title, description, enabled, sort_order |
| `clients` 合作客戶 | name, logo_src, logo_alt, enabled, sort_order |

作品的多張圖：`image_srcs` 和 `image_alts` 各用 `|` 分隔，順序要對齊。

---

## 填寫規則

- **空白格 = 保留原本內容。** 留空不會清掉網站上的字。
- **真的要清空，填 `__EMPTY__`。** 這是唯一能從試算表清掉內容的方式。
- **是／否欄位**（`enabled`、`featured`、`sold_out`、`closed`、`new_item`）：填 `true` 或 `false`。
- **`enabled` 填 `false`** = 這一列先藏起來，不用刪掉。留空視為顯示。
- **排序**：`sort_order` / `item_sort` / `category_sort`，數字小的在前；留空就照試算表的列順序。
- **多個標籤**：`tags`、`subjects` 用 `|` 分隔，例如 `招牌|人氣`。
- **價格**（餐廳）：一般價格只填數字（`320`、`1,280`）；「時價」「請洽詢」這類文字
  **填在 `price_label`**，`price` 留空。`price` 欄不要填文字。
- **圖片**：`src` 填網站圖片路徑（如 `/images/gallery/food.webp`，由開發者放進網站），
  或一個**公開、可直接開啟圖片**的網址。`alt` 用幾個字描述圖片，給視障者與搜尋引擎。
- **按鈕**：文字和連結要一起填，只填一半的按鈕不會顯示。
- **一列缺必要欄位**（例如課程沒有名稱）→ 只略過那一列，其他照常。
- **句子裡有逗號**：直接在 Google 試算表裡打字即可，它會自動處理。

---

## 活動狀態（Event Kit）

`site` 分頁最上面有四列特別的欄位：

| key | value | 說明 |
|---|---|---|
| status | closed | `upcoming` / `open` / `closed` / `completed` / `archived` |
| notice | 因雨延期至 3/15 | 頁面頂端的一行公告橫幅 |
| registered | 128 | 已報名人數 |
| capacity | 150 | 名額（兩個都填才會顯示剩餘名額） |

**`status` 只能讓網站「更保守」**：可以從「報名中」改成「已截止」或「已結束」，
但不能從試算表把已截止的活動改回「報名中」——避免一格打錯字把人送去已取消的活動。
重新開放報名請找開發者改 `content.ts`。

---

## 什麼時候會生效

網站是靜態網站，**改完試算表要重新建置一次才會更新**，不是存檔就即時生效。
Cloudflare 專案 → Deployments → 最新一筆右側 ⋯ → **Retry deployment**。
（之後若提供「客戶自己按更新」的按鈕，見 `docs/CUSTOMER_DEPLOYMENT.md`。）

## 出問題時

- **整個分頁壞掉或打不開** → 那一段用網站內建的內容，其他段落不受影響。
- **改了但網站沒變** → 確認分頁仍是「發布到網路 → CSV」，而且改完之後有重新建置。
- **不小心刪掉欄位標題** → 那一欄會被忽略；從範本把標題貼回來即可。

---

## 開發者設定（每位客戶做一次）

1. **產生預先填好的範本**

   ```bash
   pnpm sheet:template <slug>
   ```

   在 `customers/<slug>/sheet-template/` 產出 `1_site.csv` 與各列表分頁的 CSV，
   內容就是客戶網站現在的樣子——匯入後什麼都不改，網站也不會變。

2. **建立試算表**：新建一份 Google 試算表，每個 CSV 用
   「檔案 → 匯入 → 上傳 → **插入新工作表**」匯入成一個分頁。分頁名稱可自訂。

3. **發布每個分頁**：檔案 → 共用 → **發布到網路** → 選該分頁 →
   **逗號分隔值 (.csv)** → 發布。每個分頁會得到一個網址。

4. **貼進 `customers/<slug>/content.ts`** 的 `site.sheets.sources`：

   ```ts
   sheets: {
     enabled: true,
     sources: {
       site: { enabled: true, csvUrl: "https://docs.google.com/…&gid=0&single=true&output=csv" },
       faq: { enabled: true, csvUrl: "https://docs.google.com/…&gid=123&single=true&output=csv" },
       // csvUrl 留空 = 該分頁停用，那一段用 content.ts 的內容
     },
   },
   ```

   分頁名稱（`site`、`faq`…）就是上面各 Kit 表格裡的名稱。
   `mapping` 可以省略——範本的欄位標題已經是正確名稱。

5. **建置**：`pnpm build:customer <slug>`。log 會顯示 `sheets resolved`，
   有問題的分頁列在 `sheet notes`。

試算表的抓取發生在 `scripts/use-customer.mjs`（`next build` 之前），
**不在頁面裡**——靜態輸出不會執行頁面的 fetch。原因見 `docs/PROJECT_STATUS.md` 第四節。

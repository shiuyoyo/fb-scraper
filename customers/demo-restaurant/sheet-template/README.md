# 餐廳 Google Sheet 範本

一個 Google 試算表,六個分頁。每個分頁各自「發布到網路 → CSV」,把六個網址貼進
`customers/<slug>/content.ts` 的 `sheets.sources` 對應欄位。

分頁名稱可自訂,重要的是**第一列的欄位標題必須完全一致**。

| 檔案 | 分頁用途 | 列數 |
|---|---|---|
| `1_site.csv` | 店名、介紹、關於、位置、交通、聯絡、訂位 | 固定,一列一個欄位 |
| `2_featured.csv` | 人氣料理 | 可增減 |
| `3_menu.csv` | 完整菜單 | 可增減 |
| `4_opening_hours.csv` | 營業時間 | 七列(週一到週日) |
| `5_announcements.csv` | 最新優惠 | 可增減 |
| `6_faq.csv` | 常見問題 | 可增減 |

## 通用規則

- **空白格 = 保留原本內容**,不會清空。要真的清空請填 `__EMPTY__`
- **是/否欄位**(`sold_out`、`enabled`、`closed`、`featured`、`new_item`):填 `true` 或 `false`
- **排序**:`sort_order` / `item_sort` / `category_sort` 數字小的在前
- **標籤** `tags`:多個用 `|` 分隔,例如 `招牌|人氣`。可用:招牌、人氣、新品、素食、純素、辣、限量
- **價格**:一般價填數字(`320`、`1,280`);「時價」「請洽詢」這類文字**填在 `price_label`**,`price` 留空
- **句子裡若有逗號**,Google 試算表會自動處理,直接打字即可

## 1_site 特別說明

`key` 欄是固定的欄位代號,**不要改**;只改 `value` 欄。

`venue.transportNotes` 一格裡可放多條交通資訊,用 `|` 分隔:

```
捷運示範站 2 號出口步行 5 分鐘。|鄰近有付費停車場。
```

## 更新流程

改完試算表後,網站要**重新建置一次**才會更新(靜態網站的特性)。
在 Cloudflare 專案 → Deployments → 該筆右側 ⋯ → Retry deployment。

# 餐廳 Google Sheet 範本

這個資料夾由 `pnpm sheet:template demo-restaurant` 從 `content.ts` 產生，
**不要手動改 CSV**——改 `content.ts` 後重新產生即可。

| 檔案 | 分頁（`sheets.sources` 名稱） |
|---|---|
| `1_site.csv` | `site`：店名、介紹、關於、位置、交通、聯絡、訂位、段落標題 |
| `2_featured.csv` | `featured`：人氣料理 |
| `3_menu.csv` | `menu`：完整菜單 |
| `4_opening_hours.csv` | `openingHours`：營業時間 |
| `5_announcements.csv` | `announcements`：最新優惠 |
| `6_faq.csv` | `faq`：常見問題 |
| `7_gallery.csv` | `gallery`：照片 |

填寫規則、匯入與發布步驟見 `docs/GOOGLE_SHEETS_CONTENT.md`。

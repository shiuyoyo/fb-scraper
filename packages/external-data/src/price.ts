import type { MenuItem } from "@evalycloud/content-schema";

/**
 * How a menu item's price should read.
 *
 * priceLabel always wins — an item marked "時價" keeps that text even if a
 * stray number is also present. A numeric price is formatted with the item's
 * currency (or a fallback), grouping thousands. An item with neither shows
 * nothing rather than "NT$0" or "NaN".
 */
export function formatPrice(item: MenuItem, fallbackCurrency = "TWD"): string {
  if (item.priceLabel && item.priceLabel.trim() !== "") return item.priceLabel.trim();
  if (typeof item.price !== "number" || !Number.isFinite(item.price)) return "";

  const currency = item.currency ?? fallbackCurrency;
  const symbol = currency === "TWD" ? "NT$" : `${currency} `;
  return `${symbol}${item.price.toLocaleString("en-US")}`;
}

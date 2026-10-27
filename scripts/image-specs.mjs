/**
 * Image rules, kept in one place so they are easy to argue about later.
 *
 * Category comes from the sub-folder name under images-source/.
 * Files sitting loose at the top level are treated as gallery.
 */
export const categories = {
  logo: { maxWidth: 800, maxHeight: 800, maxBytes: 300 * 1024 },
  hero: { maxWidth: 1920, maxHeight: 1080, maxBytes: 500 * 1024 },
  gallery: { maxWidth: 1600, maxHeight: 1200, maxBytes: 400 * 1024 },
  thumbnail: { maxWidth: 800, maxHeight: 600, maxBytes: 200 * 1024 },
};

export const defaultCategory = "gallery";

/** Tried in order until the file fits under maxBytes. */
export const qualitySteps = [82, 75, 68, 60, 52, 45];

/** Re-encoded to WebP. */
export const convertible = new Set([".jpg", ".jpeg", ".png"]);

/** Copied through untouched — re-encoding these would lose more than it saves. */
export const passthrough = new Set([".webp", ".svg"]);

export const skipReasons = {
  ".heic": "HEIC 無法讀取。iPhone：設定 → 相機 → 格式 → 選「最相容」，再重拍或重新傳一次。",
  ".heif": "HEIF 無法讀取。請改用 JPEG。",
  ".gif": "GIF 未支援。靜態圖請改存成 PNG。",
  ".bmp": "BMP 未支援。請改用 JPEG 或 PNG。",
  ".tif": "TIFF 未支援。請改用 JPEG。",
  ".tiff": "TIFF 未支援。請改用 JPEG。",
};

export function specFor(category) {
  return categories[category] ?? categories[defaultCategory];
}

export function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

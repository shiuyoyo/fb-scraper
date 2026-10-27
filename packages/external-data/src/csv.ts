/**
 * RFC 4180-ish CSV parser.
 *
 * Written by hand rather than pulled from npm because the input is narrow
 * (Google's "publish to web" CSV) and the failure modes matter more than the
 * feature list: a stray quote in a customer's opening hours should not take
 * down their website.
 *
 * Handles: UTF-8 BOM, CRLF and LF, quoted fields, escaped quotes ("" inside a
 * quoted field), commas and newlines inside quotes, and trailing blank lines.
 */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];

  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    // Drop rows that are entirely empty — sheets are full of trailing blanks.
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      endField();
      i += 1;
      continue;
    }
    if (char === "\r") {
      if (text[i + 1] === "\n") i += 1;
      endRow();
      i += 1;
      continue;
    }
    if (char === "\n") {
      endRow();
      i += 1;
      continue;
    }

    field += char;
    i += 1;
  }

  if (field !== "" || row.length > 0) endRow();

  return rows;
}

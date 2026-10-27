import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCsv } from "../src/csv.ts";
import { loadSheet } from "../src/sheet.ts";
import type { SheetSource } from "@evalycloud/content-schema";

const source: SheetSource = {
  enabled: true,
  csvUrl: "https://example.test/sheet.csv",
  mapping: { key: "key", value: "value" },
};

function stubFetch(impl: () => Promise<Response> | Response) {
  const original = globalThis.fetch;
  globalThis.fetch = impl as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

function csvResponse(body: string, init: ResponseInit = {}) {
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/csv" },
    ...init,
  });
}

test("strips the UTF-8 BOM", () => {
  assert.deepEqual(parseCsv("\uFEFFa,b\n1,2"), [
    ["a", "b"],
    ["1", "2"],
  ]);
});

test("handles CRLF and trailing blank lines", () => {
  assert.deepEqual(parseCsv("a,b\r\n1,2\r\n\r\n"), [
    ["a", "b"],
    ["1", "2"],
  ]);
});

test("keeps commas and newlines inside quotes", () => {
  assert.deepEqual(parseCsv('a,b\n"x,y","line1\nline2"'), [
    ["a", "b"],
    ["x,y", "line1\nline2"],
  ]);
});

test("unescapes doubled quotes", () => {
  assert.deepEqual(parseCsv('a\n"say ""hi"""'), [["a"], ['say "hi"']]);
});

test("disabled source returns the fallback without fetching", async () => {
  const restore = stubFetch(() => {
    throw new Error("must not fetch");
  });
  try {
    const result = await loadSheet({ ...source, enabled: false }, { fallback: [{ key: "a" }] });
    assert.equal(result.status, "disabled");
    assert.deepEqual(result.rows, [{ key: "a" }]);
  } finally {
    restore();
  }
});

test("an un-published sheet returning a login page is treated as failure", async () => {
  const restore = stubFetch(() =>
    new Response("<!DOCTYPE html><html>sign in</html>", {
      status: 200,
      headers: { "content-type": "text/html" },
    }),
  );
  try {
    const result = await loadSheet(source, { fallback: [{ key: "kept" }] });
    assert.equal(result.status, "failed");
    assert.deepEqual(result.rows, [{ key: "kept" }]);
  } finally {
    restore();
  }
});

test("HTTP error returns the fallback and never throws", async () => {
  const restore = stubFetch(() => new Response("nope", { status: 404 }));
  try {
    const result = await loadSheet(source, { fallback: [{ key: "kept" }] });
    assert.equal(result.status, "failed");
    assert.equal(result.error, "HTTP 404");
    assert.deepEqual(result.rows, [{ key: "kept" }]);
  } finally {
    restore();
  }
});

test("a thrown network error returns the fallback", async () => {
  const restore = stubFetch(() => {
    throw new Error("getaddrinfo ENOTFOUND");
  });
  try {
    const result = await loadSheet(source, { fallback: [] });
    assert.equal(result.status, "failed");
    assert.deepEqual(result.rows, []);
  } finally {
    restore();
  }
});

test("maps columns, ignores unmapped ones, and coerces numbers", async () => {
  const restore = stubFetch(() =>
    csvResponse("key,value,internal note\nregistered,\"1,280\",ignore me\n"),
  );
  try {
    const result = await loadSheet<{ key: string; value: number }>(
      { ...source, numberFields: ["value"] },
      {},
    );
    assert.equal(result.status, "ok");
    assert.deepEqual(result.rows, [{ key: "registered", value: 1280 }]);
  } finally {
    restore();
  }
});

test("a header-only sheet counts as empty, not as data", async () => {
  const restore = stubFetch(() => csvResponse("key,value\n"));
  try {
    const result = await loadSheet(source, { fallback: [{ key: "fallback" }] });
    assert.equal(result.status, "empty");
    assert.deepEqual(result.rows, [{ key: "fallback" }]);
  } finally {
    restore();
  }
});

test("unparseable numbers are dropped rather than becoming NaN", async () => {
  const restore = stubFetch(() => csvResponse("key,value\ncapacity,約一百\n"));
  try {
    const result = await loadSheet({ ...source, numberFields: ["value"] }, { fallback: [] });
    assert.equal(result.status, "ok");
    assert.deepEqual(result.rows, [{ key: "capacity" }]);
  } finally {
    restore();
  }
});

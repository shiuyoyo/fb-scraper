import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isTemplateAvailable,
  isTemplateValid,
  templateStatus,
} from "../src/matrix.ts";

test("matrix has fifteen entries", () => {
  assert.equal(templateStatus().length, 15);
});

test("all five classics are available", () => {
  const available = templateStatus().filter((e) => e.status === "available");
  assert.deepEqual(
    available.map((e) => `${e.kit}/${e.template}`).sort(),
    ["business/classic", "education/classic", "event/classic", "portfolio/classic", "restaurant/classic"],
  );
});

test("the other ten are planned", () => {
  assert.equal(templateStatus().filter((e) => e.status === "planned").length, 10);
});

test("a valid-but-unbuilt template is valid but not available", () => {
  assert.equal(isTemplateValid("restaurant", "visual"), true);
  assert.equal(isTemplateAvailable("restaurant", "visual"), false);
});

test("a cross-kit template name is rejected as invalid", () => {
  // festival belongs to event, not business
  assert.equal(isTemplateValid("business", "festival"), false);
  assert.equal(isTemplateValid("event", "festival"), true);
});

test("education and portfolio classics are available; their variants are planned", () => {
  assert.equal(isTemplateAvailable("education", "classic"), true);
  assert.equal(isTemplateAvailable("education", "playful"), false);
  assert.equal(isTemplateValid("education", "playful"), true);
  assert.equal(isTemplateAvailable("portfolio", "classic"), true);
  assert.equal(isTemplateAvailable("portfolio", "visual"), false);
});

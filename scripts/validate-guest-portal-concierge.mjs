import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const formPath = join(root, "src/components/check-in/check-in-form.tsx");
const pagePath = join(root, "src/app/dashboard/check-in/page.tsx");
const configPath = join(root, "src/lib/site/config.ts");

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

test("guest portal renders a clear concierge-style journey", () => {
  const formSource = sourceAt(formPath, "src/components/check-in/check-in-form.tsx");
  const pageSource = sourceAt(pagePath, "src/app/dashboard/check-in/page.tsx");

  for (const label of [
    "Guest details",
    "ID/payment upload",
    "Arrival details",
    "Review/submission",
    "Welcome / next steps",
    "Arrival Guide",
  ]) {
    assert.match(`${pageSource}\n${formSource}`, new RegExp(label), `${label} label missing`);
  }

  assert.match(formSource, /handleSubmit\(onSubmit\)/, "must preserve existing react-hook-form submission");
  assert.match(formSource, /guest_checkins/, "must preserve guest_checkins insert");
  assert.match(formSource, /guest_documents/, "must preserve guest document insert");
});

test("guest portal success state avoids false verification claims", () => {
  const formSource = sourceAt(formPath, "src/components/check-in/check-in-form.tsx");

  assert.match(formSource, /Welcome to GreenLux/, "success state must welcome the guest");
  assert.match(formSource, /details have been received/, "success state must confirm receipt");
  assert.match(formSource, /staff will review/i, "success state must say staff review is pending");
  assert.match(formSource, /ID received/, "success state must show ID received");
  assert.match(formSource, /pending review/i, "success state must show pending review");
  assert.match(formSource, /room assigned/i, "success state must mention room assignment status");
  assert.doesNotMatch(formSource, /documents verified|payment verified|approved for arrival/i, "must not claim verification or approval after submission");
});

test("guest portal supports Wi-Fi request without exposing credentials", () => {
  const formSource = sourceAt(formPath, "src/components/check-in/check-in-form.tsx");
  const configSource = sourceAt(configPath, "src/lib/site/config.ts");

  assert.match(formSource, /Request Wi-Fi Access/, "must include Wi-Fi request button");
  assert.match(
    formSource,
    /Hello GreenLux team, I have completed my check-in and would like Wi-Fi access\. My name is/,
    "must use approved named Wi-Fi WhatsApp message",
  );
  assert.match(formSource, /getWhatsAppHref/, "must use existing WhatsApp helper");
  assert.match(configSource, /whatsappNumber/, "must use configured GreenLux WhatsApp number");
  assert.doesNotMatch(formSource, /wi-?fi\s+password|wifi\s+password|password\s*:/i, "must not expose Wi-Fi credentials");
});

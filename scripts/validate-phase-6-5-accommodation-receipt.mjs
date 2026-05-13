import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const receiptPagePath = join(root, "src/app/admin/guest-records/[id]/receipt/page.tsx");
const guestRecordPagePath = join(root, "src/app/admin/guest-records/[id]/page.tsx");
const reportsPath = join(root, "src/lib/reports/analytics.ts");

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

test("admin accommodation receipt route exists and is printable", () => {
  const receipt = sourceAt(receiptPagePath, "Accommodation receipt route");

  assert.match(receipt, /Accommodation Receipt/, "receipt route must use the required title");
  assert.match(receipt, /requireRole\(managementRoles\)/, "receipt route must stay admin/management protected");
  assert.match(receipt, /Print \/ Download Receipt/, "receipt route must expose a print/download action");
  assert.match(receipt, /window\.print|PrintButton/, "receipt route must use the existing print helper");
  assert.match(receipt, /autoPrint=\{queryParams\.print === "1"\}/, "print/download link must trigger browser print on the receipt route");
  assert.doesNotMatch(receipt, /Tax Invoice/i, "receipt must not claim tax-invoice status");
});

test("receipt includes stay, room, nights, and financial fields", () => {
  const receipt = sourceAt(receiptPagePath, "Accommodation receipt route");

  assert.match(receipt, /GLR-/, "receipt must use a deterministic GreenLux reference");
  assert.match(receipt, /siteConfig\.addressLine/, "receipt must use existing business address details");
  assert.match(receipt, /formatStayRangeWithNights/, "receipt must show stay dates with nights");
  assert.match(receipt, /getStayNights/, "receipt must expose number of nights");
  assert.match(receipt, /Room\/stay charge/, "receipt must separate the base room or stay charge");
  assert.match(receipt, /Additional charges/, "receipt must include folio/additional charges");
  assert.match(receipt, /Total amount/, "receipt must include total amount");
  assert.match(receipt, /Amount paid/, "receipt must include amount paid");
  assert.match(receipt, /Outstanding balance/, "receipt must include outstanding balance");
  assert.match(receipt, /Payment method/, "receipt must include payment method");
  assert.match(receipt, /Payment status/, "receipt must include payment status");
});

test("receipt handles multi-room context without combining group revenue", () => {
  const receipt = sourceAt(receiptPagePath, "Accommodation receipt route");

  assert.match(receipt, /Part of multi-room booking/, "receipt must flag grouped stays");
  assert.match(
    receipt,
    /This receipt covers the room\/stay listed above\. Linked rooms may have separate receipts unless a combined receipt is issued\./,
    "receipt must warn that it covers only this room/stay",
  );
  assert.match(receipt, /Linked rooms\/stays/, "receipt must show linked stays as reference");
  assert.doesNotMatch(receipt, /expected_total_amount|paid_total_amount/, "receipt must not use booking group totals as receipt totals");
});

test("guest record page links to receipt and WhatsApp receipt action", () => {
  const page = sourceAt(guestRecordPagePath, "Guest record detail");

  assert.match(page, /View Accommodation Receipt/, "guest detail must link to receipt view");
  assert.match(page, /Print \/ Download Receipt/, "guest detail must expose receipt print/download action");
  assert.match(page, /Send receipt via WhatsApp/, "guest detail must expose WhatsApp receipt action");
  assert.match(page, /Accommodation Receipt is ready/, "WhatsApp receipt message must be prefilled");
  const receiptMessageLine = page.split("\n").find((line) => line.includes("const receiptMessage")) ?? "";
  assert.doesNotMatch(receiptMessageLine, /\/receipt/i, "guest WhatsApp message must not expose admin receipt links directly");
});

test("business reports remain stay-level and do not use booking group totals", () => {
  const reports = sourceAt(reportsPath, "src/lib/reports/analytics.ts");

  assert.match(reports, /guest_checkins/, "reports must continue from stay-level guest_checkins");
  assert.doesNotMatch(reports, /booking_groups/, "receipt phase must not switch reports to group-level revenue");
  assert.doesNotMatch(reports, /expected_total_amount|paid_total_amount/, "reports must not use booking group total column names");
});

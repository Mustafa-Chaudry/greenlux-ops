import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const pagePath = join(root, "src/app/admin/guest-records/[id]/page.tsx");
const actionsPath = join(root, "src/app/admin/guest-records/actions.ts");
const receiptPath = join(root, "src/app/admin/guest-records/[id]/receipt/page.tsx");
const adminHomePath = join(root, "src/app/admin/page.tsx");
const guestStaysPath = join(root, "src/app/admin/guest-records/page.tsx");

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

test("guest record detail v2 has an operational top summary", () => {
  const page = sourceAt(pagePath, "guest record detail page");

  for (const label of [
    "Top Operational Summary",
    "Guest Stay Details",
    "Room / Suite",
    "Stay period",
    "Booking source",
    "Balance Due",
    "ID Verification",
    "Payment Confirmation",
    "Room Readiness",
    "Ready for Arrival",
  ]) {
    assert.match(page, new RegExp(label), `${label} is missing from the top summary`);
  }

  assert.match(page, /formatStayRangeWithNights/, "stay period must include nights");
  assert.match(page, /financialSummary\.outstanding/, "summary must reuse existing financial summary for Balance Due");
});

test("guest record detail v2 keeps a consolidated stay details layout", () => {
  const page = sourceAt(pagePath, "guest record detail page");

  for (const label of [
    "Guest Stay Details",
    "One operational view of the guest, stay context, and staff notes.",
    "Guest count",
    "ID / passport",
    "Stay period",
    "Room / Suite",
    "Travelling from",
    "Arrival time",
    "Special requests",
    "Internal notes",
  ]) {
    assert.match(page, new RegExp(label), `${label} is missing from consolidated stay details`);
  }

  assert.doesNotMatch(page, /Front Desk Stay Summary/, "old duplicate Front Desk Stay Summary must be removed");
  assert.match(page, /maskSensitiveId\(record\.cnic_passport_number\)/, "ID/passport value should stay masked in the detail card");
});

test("guest record detail v2 surfaces priority alerts without blocking operations", () => {
  const page = sourceAt(pagePath, "guest record detail page");

  for (const label of [
    "Needs Attention",
    "Priority Alerts",
    "ID Verification",
    "Payment Confirmation",
    "Balance Due",
    "Room is not Ready for Arrival",
    "Pending Team Review",
    "Multi-room booking finance check",
  ]) {
    assert.match(page, new RegExp(label), `${label} alert language missing`);
  }

  assert.match(page, /not hard blockers/i, "priority alerts must stay non-blocking");
});

test("guest record detail v2 groups staff actions and preserves receipt workflow", () => {
  const page = sourceAt(pagePath, "guest record detail page");
  const receipt = sourceAt(receiptPath, "accommodation receipt route");

  for (const label of [
    "Action Panel",
    "Verify ID / Documents",
    "Verify Payment Confirmation",
    "Add Additional Charge",
    "Extend Stay",
    "View Receipt",
    "Print / Download Receipt",
    "Send Receipt via WhatsApp",
    "Message Guest on WhatsApp",
    "Check in / Check out",
  ]) {
    assert.match(page, new RegExp(label), `${label} action missing`);
  }

  assert.match(page, /\/admin\/guest-records\/\$\{record\.id\}\/receipt/, "guest detail must link to receipt route");
  assert.match(receipt, /Accommodation Receipt/, "receipt route must remain present");
  assert.doesNotMatch(`${page}\n${receipt}`, /Tax Invoice/i, "guest stay and receipt must not use Tax Invoice wording");
});

test("guest record detail v2 keeps finance and multi-room truth clear", () => {
  const page = sourceAt(pagePath, "guest record detail page");
  const actions = sourceAt(actionsPath, "guest record actions");

  for (const label of [
    "Payment & Charges",
    "Accommodation Charges",
    "Additional Charges",
    "Total Amount",
    "Amount Paid",
    "Payment Method",
    "Payment Status",
    "Part of a multi-room booking",
    "Linked stays/rooms",
    "This room/stay amount",
    "Lead booking reference total",
  ]) {
    assert.match(page, new RegExp(label), `${label} finance or multi-room label missing`);
  }

  assert.match(page, /getGuestFinancialSummary/, "page must reuse existing financial summary helper");
  assert.match(page, /bookingGroup\?\.expected_total_amount \?\? linkedFinancialSummary\.totalExpected/, "group totals must remain reference fallback, not revenue truth");
  assert.doesNotMatch(
    actions,
    /guest_checkins"\)\.update\(\{[\s\S]*(expected_total_amount|paid_total_amount)/,
    "actions must not rewrite stay finance from booking group totals",
  );
});

test("guest record detail v2 keeps lower operational sections and admin entry language consistent", () => {
  const page = sourceAt(pagePath, "guest record detail page");
  const adminHome = sourceAt(adminHomePath, "admin home page");
  const guestStays = sourceAt(guestStaysPath, "guest stays list page");
  const inspectedAdminUi = `${adminHome}\n${guestStays}`;

  for (const label of [
    "Documents / ID Verification",
    "Payment & Charges",
    "Admin Controls",
    "Replace / Upload Documents",
    "Guest Messages / WhatsApp",
  ]) {
    assert.match(page, new RegExp(label), `${label} section missing`);
  }

  assert.match(inspectedAdminUi, /Guest Stays/, "admin entry points should use Guest Stays language");
  assert.match(inspectedAdminUi, /Add Guest Stay/, "admin entry points should use Add Guest Stay language");
  assert.doesNotMatch(inspectedAdminUi, /Add Guest \/ Walk-in/, "old Add Guest / Walk-in wording should not remain in inspected admin UI");
  assert.doesNotMatch(inspectedAdminUi, /Create guest record/i, "Create guest record wording should not remain in inspected admin UI");
});

test("guest record detail v2 keeps controls in the refined operational order", () => {
  const page = sourceAt(pagePath, "guest record detail page");

  for (const label of [
    "Replace / Upload Documents",
    "Lead booking group",
    "Assigned unit",
    "Warning: this room is not marked ready",
    "Agreed room rate",
    "Total expected",
    "Advance paid",
    "Amount paid",
    "Payment status",
    "Payment Confirmation verified",
    "Extend Stay",
  ]) {
    assert.match(page, new RegExp(label), `${label} control missing`);
  }

  const documentReviewIndex = page.indexOf("Documents / ID Verification");
  const documentUploadIndex = page.indexOf("Replace / Upload Documents");
  const paymentIndex = page.indexOf("Payment & Charges");
  const adminIndex = page.indexOf("Admin Controls");
  assert.ok(documentReviewIndex < documentUploadIndex, "document upload should sit after document review");
  assert.ok(documentUploadIndex < paymentIndex, "document upload should remain in the left column before the right-column controls");
  assert.ok(paymentIndex < adminIndex, "Admin Controls should sit directly after Payment & Charges in the right column");

  const checkinStatusIndex = page.indexOf("Check-in status");
  const leadBookingIndex = page.indexOf("Lead booking group");
  const assignedUnitIndex = page.indexOf("Assigned unit");
  const agreedRateIndex = page.indexOf("Agreed room rate");
  const totalExpectedIndex = page.indexOf("Total expected");
  const advancePaidIndex = page.indexOf("Advance paid");
  const amountPaidIndex = page.indexOf("Amount paid");
  const paymentStatusIndex = page.indexOf("Payment status");
  const verificationIndex = page.indexOf("ID/passport received and verified");
  const notesIndex = page.indexOf("Internal notes", verificationIndex);
  const saveIndex = page.indexOf("Save admin changes");
  const extendIndex = page.indexOf("Extend Stay", saveIndex);

  assert.ok(checkinStatusIndex < leadBookingIndex, "status and checklist should appear before room/lead booking controls");
  assert.ok(leadBookingIndex < assignedUnitIndex, "lead booking should appear before assigned unit");
  assert.ok(assignedUnitIndex < agreedRateIndex, "assigned unit should appear before financial update fields");
  assert.ok(agreedRateIndex < totalExpectedIndex, "agreed room rate should appear before total expected");
  assert.ok(totalExpectedIndex < advancePaidIndex, "total expected should appear before advance paid");
  assert.ok(advancePaidIndex < amountPaidIndex, "advance paid should appear before amount paid");
  assert.ok(amountPaidIndex < paymentStatusIndex, "payment status should follow amount fields");
  assert.ok(paymentStatusIndex < verificationIndex, "verification checkboxes should follow payment/admin classification fields");
  assert.ok(verificationIndex < notesIndex, "internal notes should follow verification checkboxes");
  assert.ok(saveIndex < extendIndex, "Extend Stay should sit after the core admin save form");
});

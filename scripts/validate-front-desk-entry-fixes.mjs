import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const adminNewPagePath = join(root, "src/app/admin/guests/new/page.tsx");
const adminNewActionsPath = join(root, "src/app/admin/guests/new/actions.ts");
const guestDetailPagePath = join(root, "src/app/admin/guest-records/[id]/page.tsx");
const guestDetailActionsPath = join(root, "src/app/admin/guest-records/actions.ts");
const checkInFormPath = join(root, "src/components/check-in/check-in-form.tsx");
const checkInValidationPath = join(root, "src/lib/validation/check-in.ts");
const optionsPath = join(root, "src/lib/check-in/options.ts");
const databaseTypesPath = join(root, "src/types/database.ts");
const migrationPath = join(root, "supabase/migrations/20260516010000_phase_6_8a_front_desk_documents.sql");

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

test("front desk uploads support multiple primary IDs, supporting documents, and camera-friendly capture", () => {
  const adminNewPage = sourceAt(adminNewPagePath, "admin new guest page");
  const guestDetailPage = sourceAt(guestDetailPagePath, "guest detail page");
  const checkInForm = sourceAt(checkInFormPath, "guest check-in form");
  const combinedUi = `${adminNewPage}\n${guestDetailPage}\n${checkInForm}`;

  assert.match(combinedUi, /name="primary_document"[\s\S]{0,140}multiple|multiple[\s\S]{0,140}\{\.\.\.register\("primary_document"\)/, "primary guest ID/passport upload must allow multiple files");
  assert.match(combinedUi, /name="additional_documents"[\s\S]{0,180}multiple|multiple[\s\S]{0,180}\{\.\.\.register\("additional_documents"\)/, "additional guest ID/passport uploads must still allow multiple files");
  assert.match(combinedUi, /Supporting Documents/, "Supporting Documents upload label is missing");
  assert.match(combinedUi, /Marriage certificate, authorization letter, company letter, or other supporting document/, "supporting document helper text is missing");
  assert.match(combinedUi, /capture="environment"/, "camera-friendly capture attribute is missing");
  assert.match(combinedUi, /You can upload files or take a photo from a supported device/, "camera upload helper text is missing");
});

test("supporting document type and distinct folder path are implemented safely", () => {
  const migration = sourceAt(migrationPath, "Phase 6.8A migration");
  const databaseTypes = sourceAt(databaseTypesPath, "database types");
  const adminNewActions = sourceAt(adminNewActionsPath, "admin new guest actions");
  const guestDetailActions = sourceAt(guestDetailActionsPath, "guest record actions");
  const checkInForm = sourceAt(checkInFormPath, "guest check-in form");
  const combinedActions = `${adminNewActions}\n${guestDetailActions}\n${checkInForm}`;

  assert.match(migration, /alter type public\.document_type add value if not exists 'supporting_document'/, "migration must add supporting_document document type");
  assert.match(databaseTypes, /"supporting_document"/, "database types must include supporting_document");
  assert.match(combinedActions, /supporting_documents/, "supporting document form field must be handled by actions/forms");
  assert.match(combinedActions, /documentType: "supporting_document"/, "supporting uploads must use supporting_document type");
  assert.match(combinedActions, /supporting-documents/, "supporting uploads should use a distinct supporting-documents path segment");
});

test("Agent booking source and repeat guest autofill are available", () => {
  const options = sourceAt(optionsPath, "check-in options");
  const validation = sourceAt(checkInValidationPath, "check-in validation");
  const databaseTypes = sourceAt(databaseTypesPath, "database types");
  const migration = sourceAt(migrationPath, "Phase 6.8A migration");
  const adminNewPage = sourceAt(adminNewPagePath, "admin new guest page");

  assert.match(options, /value: "agent", label: "Agent"/, "Agent booking source option is missing");
  assert.match(validation, /"agent"/, "Agent must be allowed by check-in validation");
  assert.match(databaseTypes, /"agent"/, "database types must include agent booking source");
  assert.match(migration, /alter type public\.booking_source add value if not exists 'agent'/, "migration must add agent booking source");
  assert.match(adminNewPage, /Repeat Guest Autofill/, "repeat guest autofill helper is missing");
  assert.match(adminNewPage, /Search previous guest by name, phone, ID\/passport, or email/, "repeat guest search prompt is missing");
  assert.match(adminNewPage, /Previous guest details can be reused, but stay dates, room, payment, and documents must be reviewed for this stay\./, "repeat guest safety helper is missing");
  assert.match(adminNewPage, /Use these details/, "repeat guest selection action is missing");
  assert.doesNotMatch(adminNewPage, /defaultValue=\{selectedRepeatStay\?\.check_in_date/, "repeat autofill must not copy old stay dates");
  assert.doesNotMatch(adminNewPage, /defaultValue=\{selectedRepeatStay\?\.amount_paid_pkr/, "repeat autofill must not copy old payment truth");
});

test("advance paid is hidden from operational UI and Balance Due remains amount-paid based", () => {
  const adminNewPage = sourceAt(adminNewPagePath, "admin new guest page");
  const guestDetailPage = sourceAt(guestDetailPagePath, "guest detail page");
  const options = sourceAt(optionsPath, "check-in options");
  const combinedUi = `${adminNewPage}\n${guestDetailPage}`;

  assert.doesNotMatch(combinedUi, /<Label htmlFor="advance_paid_amount_pkr">Advance paid/i, "Advance paid should not appear as an operational input label");
  assert.match(options, /Math\.max\(expected - \(checkin\.amount_paid_pkr \?\? 0\), 0\)/, "Balance Due must remain based on amount paid");
  assert.match(options, /getGuestFinancialSummary/, "existing financial summary helper must remain available");
});

test("payment coverage alert is visible without changing financial truth", () => {
  const guestDetailPage = sourceAt(guestDetailPagePath, "guest detail page");

  assert.match(guestDetailPage, /getPaymentCoverageAlert/, "payment coverage helper is missing");
  assert.match(guestDetailPage, /Payment follow-up required before the next night/, "payment coverage follow-up wording is missing");
  assert.match(guestDetailPage, /Paid amount currently covers approximately/, "paid-night coverage wording is missing");
  assert.match(guestDetailPage, /Balance Due remains after checkout/, "checked-out Balance Due alert is missing");
  assert.match(guestDetailPage, /Payment Confirmation pending/, "payment confirmation pending alert is missing");
  assert.match(guestDetailPage, /financialSummary\.outstanding/, "payment coverage must use existing financial summary Balance Due");
});

test("security-sensitive wording remains safe", () => {
  const checkInForm = sourceAt(checkInFormPath, "guest check-in form");
  const guestDetailPage = sourceAt(guestDetailPagePath, "guest detail page");
  const combined = `${checkInForm}\n${guestDetailPage}`;

  assert.doesNotMatch(combined, /Tax Invoice/i, "front desk changes must not introduce Tax Invoice wording");
  assert.doesNotMatch(combined, /Wi-?Fi password/i, "front desk changes must not expose Wi-Fi password wording");
  assert.match(guestDetailPage, /short-lived signed URLs from the private storage bucket/, "document signed URL/security language must remain visible");
});

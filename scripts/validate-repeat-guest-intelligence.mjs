import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const adminNewPagePath = join(root, "src/app/admin/guests/new/page.tsx");
const adminNewActionsPath = join(root, "src/app/admin/guests/new/actions.ts");
const guestDetailPagePath = join(root, "src/app/admin/guest-records/[id]/page.tsx");
const optionsPath = join(root, "src/lib/check-in/options.ts");

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

test("repeat guest search and safe autofill are available", () => {
  const adminNewPage = sourceAt(adminNewPagePath, "admin new guest page");

  assert.match(adminNewPage, /Repeat Guest Autofill/, "repeat guest autofill section is missing");
  assert.match(adminNewPage, /Search previous guest by name, phone, ID\/passport, or email/, "repeat guest search must cover name, phone, ID/passport, and email");
  assert.match(adminNewPage, /Previous stay count/, "repeat search results must show previous stay count");
  assert.match(adminNewPage, /Last stay:/, "repeat search results must show last stay date");
  assert.match(adminNewPage, /Last room\/unit:/, "repeat search results must show last room/unit");
  assert.match(adminNewPage, /Last booking source:/, "repeat search results must show last booking source");
  assert.match(adminNewPage, /Last rate\/night:/, "repeat search results must show previous rate/night");
  assert.match(adminNewPage, /Previous documents:/, "repeat search results must show previous document availability");
  assert.match(adminNewPage, /Use these details/, "repeat guest selection action is missing");
  assert.match(adminNewPage, /repeat_source_checkin_id/, "selected previous stay id must be submitted for document reuse review");
  assert.match(adminNewPage, /Previous guest details can be reused, but stay dates, room, payment, and documents must be reviewed for this stay\./, "repeat guest safety helper is missing");
  assert.doesNotMatch(adminNewPage, /defaultValue=\{selectedRepeatStay\?\.check_in_date/, "autofill must not copy old stay dates");
  assert.doesNotMatch(adminNewPage, /defaultValue=\{selectedRepeatStay\?\.amount_paid_pkr/, "autofill must not copy old payment truth");
  assert.doesNotMatch(adminNewPage, /defaultValue=\{selectedRepeatStay\?\.payment_status/, "autofill must not copy old payment status");
  assert.doesNotMatch(adminNewPage, /defaultValue=\{selectedRepeatStay\?\.assigned_room_id/, "autofill must not copy old room assignment");
});

test("previous ID and supporting documents populate the new repeat Guest Stay safely", () => {
  const adminNewActions = sourceAt(adminNewActionsPath, "admin new guest actions");
  const guestDetailPage = sourceAt(guestDetailPagePath, "guest detail page");

  assert.match(adminNewActions, /attachPreviousDocumentsForReview/, "previous document reuse helper is missing");
  assert.match(adminNewActions, /reusablePreviousDocumentTypes: DocumentType\[\] = \["primary_cnic", "additional_guest_cnic", "supporting_document"\]/, "only ID/supporting documents should be reusable");
  assert.match(adminNewActions, /\.in\("checkin_id", Array\.from\(sourceStayIds\)\)/, "repeat document reuse should search matching previous stays, not only one selected stay");
  assert.match(adminNewActions, /\.in\("document_type", reusablePreviousDocumentTypes\)/, "only reusable ID/supporting document types should be inserted");
  assert.doesNotMatch(adminNewActions, /"payment_proof"[\s\S]{0,220}attachPreviousDocumentsForReview/, "old payment confirmation must not be reused as current proof");
  assert.match(adminNewActions, /document_status: document\.document_status === "verified" \? "verified" as DocumentStatus : "pending" as DocumentStatus/, "verified ID documents may remain verified while unverified documents downgrade to pending");
  assert.match(adminNewActions, /reusedPreviousDocuments\.verifiedPrimaryCount > 0/, "verified primary ID reuse should be able to mark the current stay ID as verified");
  assert.match(adminNewActions, /update\(\{ cnic_verified: true \}\)/, "verified primary ID documents should populate as current-stay verification");
  assert.doesNotMatch(adminNewActions, /payment_verified: true/, "payment confirmation must not be inherited from previous stays");
  assert.doesNotMatch(adminNewActions, /payment_status: "paid"/, "payment status must not be inherited from previous stays");
  assert.match(adminNewActions, /Previous ID\/supporting documents on file were added to this Guest Stay/, "document-on-file success wording is missing");
  assert.match(guestDetailPage, /Previous documents added for review/, "guest detail must surface previous documents added for review");
  assert.match(guestDetailPage, /Document on file/, "reused documents should be labelled inside the normal document list");
  assert.match(guestDetailPage, /These documents now appear in this Guest Stay document list/, "reused documents should appear as normal current-stay documents");
  assert.match(guestDetailPage, /pending or rejected documents still need staff review/i, "unverified/rejected documents must not be incorrectly upgraded");
  assert.match(guestDetailPage, /Links are short-lived signed URLs from the private storage bucket/, "signed URL/private document access language must remain");
});

test("guest stay history, rates, and risk memory are visible", () => {
  const guestDetailPage = sourceAt(guestDetailPagePath, "guest detail page");

  assert.match(guestDetailPage, /Repeat Guest \/ Stay History/, "guest detail stay history section is missing");
  assert.match(guestDetailPage, /Guest profile foundation from previous room-level stays/, "guest profile foundation wording is missing");
  assert.match(guestDetailPage, /Previous stay count/, "guest detail must show previous stay count");
  assert.match(guestDetailPage, /Rate \/ Night/, "previous rate/night column is missing");
  assert.match(guestDetailPage, /getRatePerNightLabel/, "rate/night derivation helper is missing");
  assert.match(guestDetailPage, /Balance Due/, "previous Balance Due visibility is missing");
  assert.match(guestDetailPage, /Previous stay had Balance Due/, "previous balance risk memory is missing");
  assert.match(guestDetailPage, /previous stay needed payment follow-up or document review/i, "soft previous follow-up warning is missing");
  assert.match(guestDetailPage, /Open/, "previous Guest Stay link is missing");
});

test("financial truth and sensitive surfaces remain unchanged", () => {
  const adminNewActions = sourceAt(adminNewActionsPath, "admin new guest actions");
  const guestDetailPage = sourceAt(guestDetailPagePath, "guest detail page");
  const options = sourceAt(optionsPath, "check-in options");
  const combined = `${adminNewActions}\n${guestDetailPage}`;

  assert.match(options, /getGuestFinancialSummary/, "existing financial summary helper must remain");
  assert.match(options, /Math\.max\(expected - \(checkin\.amount_paid_pkr \?\? 0\), 0\)/, "Balance Due must remain amount-paid based");
  assert.doesNotMatch(combined, /booking_groups[\s\S]{0,120}revenue/i, "booking groups must not become revenue truth");
  assert.doesNotMatch(combined, /Tax Invoice/i, "repeat guest work must not introduce Tax Invoice wording");
  assert.doesNotMatch(combined, /Wi-?Fi password/i, "repeat guest work must not expose Wi-Fi password wording");
});

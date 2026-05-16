import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const analyticsPath = join(root, "src/lib/reports/analytics.ts");
const nightlyAllocationPath = join(root, "src/lib/reports/nightly-allocation.ts");
const reportsPagePath = join(root, "src/app/admin/reports/page.tsx");
const exportRoutePath = join(root, "src/app/admin/reports/export/route.ts");

function sourceAt(path, label) {
  assert.equal(existsSync(path), true, `${label} is missing`);
  return readFileSync(path, "utf8");
}

test("Business Analytics v2 keeps overlap room-night allocation", () => {
  const analytics = sourceAt(analyticsPath, "reports analytics");
  const nightlyAllocation = sourceAt(nightlyAllocationPath, "nightly allocation helper");

  assert.match(nightlyAllocation, /getStayOverlapAllocation/, "overlap allocation helper is missing");
  assert.match(nightlyAllocation, /clippedStartDate/, "clipped start date logic is missing");
  assert.match(nightlyAllocation, /clippedEndDate/, "clipped end date logic is missing");
  assert.match(nightlyAllocation, /overlappingNights/, "overlapping nights calculation is missing");
  assert.match(nightlyAllocation, /totalBookedNights/, "full stay booked nights calculation is missing");
  assert.match(nightlyAllocation, /allocateAmountByNights/, "proportional revenue allocation helper is missing");

  assert.match(analytics, /\.lte\("check_in_date", range\.endDate\)/, "reports must include stays that start before or on the report end date");
  assert.match(analytics, /\.gt\("check_out_date", range\.startDate\)/, "reports must include stays that end after the report start date");
  assert.doesNotMatch(analytics, /\.gte\("check_in_date", range\.startDate\)[\s\S]{0,140}\.lte\("check_in_date", range\.endDate\)/, "reports must not rely only on check_in_date range");
});

test("Daily, weekly, monthly, and custom report modes exist", () => {
  const analytics = sourceAt(analyticsPath, "reports analytics");
  const reportsPage = sourceAt(reportsPagePath, "reports page");

  assert.match(analytics, /ReportMode = "daily" \| "weekly" \| "monthly" \| "custom"/, "ReportMode union is missing");
  assert.match(analytics, /reportModeOptions/, "report mode options are missing");
  assert.match(analytics, /mode: "daily"/, "Daily mode handling is missing");
  assert.match(analytics, /mode: "weekly"/, "Weekly mode handling is missing");
  assert.match(analytics, /mode: "monthly"/, "Monthly mode handling is missing");
  assert.match(analytics, /mode: "custom"/, "Custom mode handling is missing");

  for (const label of ["Report Mode", "Daily", "Weekly", "Monthly", "Custom", "Reporting period:"]) {
    assert.match(reportsPage, new RegExp(label), `${label} missing from report controls`);
  }

  assert.match(reportsPage, /name="start"/, "Custom start input is missing");
  assert.match(reportsPage, /name="end"/, "Custom end input is missing");
  assert.match(reportsPage, /name="date"/, "Daily/weekly date input is missing");
  assert.match(reportsPage, /name="month"/, "Monthly input is missing");
});

test("Owner-grade cockpit sections are present and ordered by decision need", () => {
  const reportsPage = sourceAt(reportsPagePath, "reports page");

  for (const label of [
    "Owner Command Summary",
    "Expected Revenue",
    "Paid Revenue Recorded",
    "Balance Due",
    "Expenses",
    "Net Profit",
    "Booked Room Nights",
    "Occupancy",
    "Average Rate / Night",
    "Strategic Steering",
    "Visual Breakdown",
    "Revenue Map",
    "Daily Performance",
    "Unit Type Performance",
    "Unit Performance",
    "Booking Source Performance",
    "Risk & Recovery",
    "Supporting Detail",
    "How this report is calculated",
  ]) {
    assert.match(reportsPage, new RegExp(label), `${label} section or label missing`);
  }

  assert.match(reportsPage, /Daily booked nights, daily revenue, and daily occupancy/, "daily performance explanation is missing");
  assert.match(reportsPage, /Paid Revenue Recorded/, "paid revenue must be labelled honestly");
  assert.match(reportsPage, /Open Guest Stay/, "risk rows must link to Guest Stay workflow");
});

test("Lightweight visual summaries exist without chart dependencies", () => {
  const reportsPage = sourceAt(reportsPagePath, "reports page");

  assert.match(reportsPage, /function BarRow/, "lightweight bar component is missing");
  assert.match(reportsPage, /percentOf/, "proportional bar helper is missing");
  assert.match(reportsPage, /Revenue by Booking Source/, "booking source visual breakdown missing");
  assert.match(reportsPage, /Revenue by Unit Type/, "unit type visual breakdown missing");
  assert.match(reportsPage, /Occupancy \/ Booked Nights Overview/, "occupancy visual overview missing");
  assert.match(reportsPage, /Expenses by Category/, "expense visual breakdown missing");
  assert.doesNotMatch(reportsPage, /recharts|chart\.js|victory|nivo/i, "must not add a heavy chart library");
});

test("Daily performance is derived from overlap allocation", () => {
  const analytics = sourceAt(analyticsPath, "reports analytics");
  const reportsPage = sourceAt(reportsPagePath, "reports page");

  assert.match(analytics, /dailyRows/, "dailyRows output is missing");
  assert.match(analytics, /reportDateList/, "daily report date list is missing");
  assert.match(analytics, /rangeStartDate: date/, "daily breakdown must use per-day overlap start");
  assert.match(analytics, /rangeEndDate: date/, "daily breakdown must use per-day overlap end");
  assert.match(analytics, /arrivals/, "daily arrivals are missing");
  assert.match(analytics, /departures/, "daily departures are missing");
  assert.match(reportsPage, /Booked nights/, "daily booked nights column is missing");
  assert.match(reportsPage, /Expected revenue/, "daily revenue column is missing");
  assert.match(reportsPage, /Occupancy/, "daily occupancy column is missing");
});

test("CSV export still includes Business Analytics v2 room-night fields", () => {
  const analytics = sourceAt(analyticsPath, "reports analytics");
  const exportRoute = sourceAt(exportRoutePath, "reports export route");

  assert.match(exportRoute, /createBusinessReportCsv/, "export route must use the shared report CSV builder");
  assert.match(analytics, /GreenLux Residency Business Analytics v2/, "CSV title must identify Business Analytics v2");
  assert.match(analytics, /Daily Performance/, "CSV must include Daily Performance");
  assert.match(analytics, /Booked Room Nights/, "CSV must include booked room nights");
  assert.match(analytics, /Average Rate \/ Night/, "CSV must include average rate/night");
  assert.match(analytics, /Unit Type Performance/, "CSV must include unit type performance");
  assert.match(analytics, /Booking Source Performance/, "CSV must include source performance");
  assert.match(analytics, /Balance Due/, "CSV must include Balance Due");
});

test("Business Analytics v2 keeps multi-room and payment safety boundaries", () => {
  const analytics = sourceAt(analyticsPath, "reports analytics");
  const reportsPage = sourceAt(reportsPagePath, "reports page");

  assert.match(analytics, /guest_checkins/, "reports must remain stay-level from guest_checkins");
  assert.doesNotMatch(analytics, /booking_groups/, "reports must not use booking_groups as revenue truth");
  assert.doesNotMatch(analytics, /expected_total_amount|paid_total_amount/, "reports must not use booking group total column names");
  assert.match(reportsPage, /individual Guest Stays to avoid\s+double-counting/, "multi-room reporting safety wording is missing");
  assert.doesNotMatch(analytics, /Tax Invoice/i, "reports must not introduce Tax Invoice wording");
  assert.doesNotMatch(reportsPage, /Tax Invoice/i, "reports page must not introduce Tax Invoice wording");
  assert.doesNotMatch(analytics, /from\("booking_groups"\)/, "reports must not query booking_groups");
});

test("Business Analytics v2 removes full live occupancy duplication", () => {
  const reportsPage = sourceAt(reportsPagePath, "reports page");

  assert.doesNotMatch(reportsPage, /Live Occupancy Summary/, "reports page should not duplicate the Room Reality Board");
  assert.doesNotMatch(reportsPage, /fetchOccupancySnapshot/, "reports page should not fetch full operational occupancy snapshot");
});

test("Business Analytics v2 includes additional charges without replacing financial truth", () => {
  const analytics = sourceAt(analyticsPath, "reports analytics");

  assert.match(analytics, /guest_charges/, "reports must keep guest charges in the reporting helper");
  assert.match(analytics, /charged_at/, "guest charges should be period-aware where charged_at is available");
  assert.match(analytics, /guestChargesTotal/, "additional charges total is missing");
  assert.match(analytics, /paidGuestCharges/, "paid additional charges total is missing");
  assert.match(analytics, /unpaidGuestCharges/, "unpaid additional charges total is missing");
  assert.match(analytics, /getExpectedAmount/, "reports must keep using the existing stay expected amount helper");
  assert.match(analytics, /amount_paid_pkr/, "reports must use recorded stay paid amount");
  assert.doesNotMatch(analytics, /guest-records\/actions|guests\/new\/actions/, "reporting helper must not import payment entry actions");
});

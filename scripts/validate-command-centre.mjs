import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const pagePath = join(root, "src/app/admin/command-centre/page.tsx");

function pageSource() {
  assert.equal(existsSync(pagePath), true, "src/app/admin/command-centre/page.tsx is missing");
  return readFileSync(pagePath, "utf8");
}

test("command centre reuses existing operational sources", () => {
  const source = pageSource();

  assert.match(source, /fetchOccupancySnapshot/, "must reuse occupancy snapshot");
  assert.match(source, /fetchReportInputs/, "must reuse report inputs");
  assert.match(source, /buildBusinessReport/, "must reuse report analytics");
  assert.match(source, /guest_checkins/, "must read guest_checkins");
  assert.match(source, /guest_documents/, "must account for guest_documents");
  assert.match(source, /guest_charges/, "must read folio/additional charges");
  assert.match(source, /room_maintenance_logs/, "must use existing maintenance table");
  assert.match(source, /expenses/i, "must use existing expenses table via reports");
});

test("command centre renders required action-first sections", () => {
  const source = pageSource();

  for (const section of ["Immediate Actions", "Today Timeline", "Unit Snapshot", "Money Snapshot", "Quick Actions"]) {
    assert.match(source, new RegExp(section), `${section} section missing`);
  }

  for (const action of [
    "Check-outs due today",
    "Check-ins today without unit",
    "CNIC not verified",
    "Payment not verified",
    "Outstanding balances",
    "Maintenance issues",
    "Missing checkout date",
  ]) {
    assert.match(source, new RegExp(action), `${action} action missing`);
  }
});

test("command centre links staff to real admin fix screens", () => {
  const source = pageSource();

  for (const href of ["/admin/guest-records/", "/admin/guest-records?view=active", "/admin/guests/new", "/admin/occupancy", "/admin/maintenance"]) {
    assert.match(source, new RegExp(href.replaceAll("/", "\\/").replace("?", "\\?")), `${href} link missing`);
  }

  assert.doesNotMatch(source, /seed|fake|mock/i, "must not use fake seed data");
});

// Run: node scripts/validate-stay-lifecycle.mjs
// Loads the real lifecycle module (Node strips the TypeScript types) and checks the rules
// the front desk depends on, then checks that screens and actions read those rules.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  canFlagStay,
  canResolveStayIssue,
  canTransitionStay,
  isOpenStayStatus,
  statusAfterFlag,
  stayTransitions,
  stayViewStatuses,
} from "../src/lib/check-in/stay-lifecycle.ts";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const statuses = Object.keys(stayTransitions);

test("every status is covered and every target is a real status", () => {
  const enumLine = read("src/types/database.ts").match(/checkin_status: (.+);/)[1];
  const enumStatuses = [...enumLine.matchAll(/"([a-z_]+)"/g)].map((match) => match[1]).sort();

  assert.deepEqual([...statuses].sort(), enumStatuses, "stayTransitions must list every checkin_status");
  for (const targets of Object.values(stayTransitions)) {
    for (const target of targets) {
      assert.ok(statuses.includes(target), `${target} is not a status`);
    }
  }
});

test("the normal journey works end to end", () => {
  for (const [from, to] of [
    ["submitted", "under_review"],
    ["under_review", "approved"],
    ["approved", "checked_in"],
    ["checked_in", "checked_out"],
  ]) {
    assert.ok(canTransitionStay(from, to), `${from} -> ${to} must be allowed`);
  }
});

test("staff are never trapped: every open status has a way forward", () => {
  for (const status of statuses.filter(isOpenStayStatus)) {
    assert.ok(stayTransitions[status].length > 0, `${status} has no exit`);
  }
  assert.ok(canResolveStayIssue("issue") && canTransitionStay("issue", "under_review"), "issue must be resolvable");
});

test("a completed stay is never reopened by a front-desk action", () => {
  assert.deepEqual(stayTransitions.checked_out, []);
  assert.equal(canFlagStay("checked_out"), false);
  for (const status of statuses) {
    assert.equal(canTransitionStay(status, "submitted"), false, "nothing moves back to submitted");
  }
});

test("an in-house guest is flagged, not moved out of checked-in", () => {
  assert.equal(canTransitionStay("checked_in", "issue"), false);
  assert.equal(canFlagStay("checked_in"), true);
  assert.equal(statusAfterFlag("checked_in"), "checked_in");
  assert.equal(statusAfterFlag("approved"), "issue");
  assert.ok(canTransitionStay("checked_in", "checked_out"), "check-out must stay available");
});

test("list views partition the non-issue statuses without overlap between active and completed", () => {
  assert.deepEqual(stayViewStatuses.active, ["checked_in"]);
  assert.deepEqual(stayViewStatuses.completed, ["checked_out"]);
  assert.ok(!stayViewStatuses.ready.includes("issue"));
});

test("actions, list and export read the lifecycle module instead of re-deriving it", () => {
  const actions = read("src/app/admin/guest-records/actions.ts");
  const list = read("src/app/admin/guest-records/page.tsx");
  const exportRoute = read("src/app/admin/guest-records/export/route.ts");
  const detail = read("src/app/admin/guest-records/[id]/page.tsx");

  assert.match(actions, /canTransitionStay\(record\.status, status\)/, "status action must check the transition table");
  assert.match(actions, /\.eq\("status", record\.status\)/, "status update must be conditional on the status that was read");
  assert.match(actions, /stay_status_changed/, "status changes must be audit logged");
  assert.match(actions, /cleaning_required/, "check-out must hand the unit to housekeeping");
  for (const source of [list, exportRoute]) {
    assert.match(source, /stayViewStatuses/, "list and export must share view rules");
    assert.match(source, /issuesViewFilter/, "list and export must share the Issues view rule");
  }
  assert.match(detail, /canTransitionStay\(record\.status, "checked_out"\)/, "detail page must read the transition table");
});

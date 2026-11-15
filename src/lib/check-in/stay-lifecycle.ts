// The Guest Stay lifecycle, in one place.
//
// Every screen and server action that asks "what can happen to this stay next?"
// reads this file. Do not re-derive these rules with inline status comparisons.
// See docs/codex-context/STATE_MACHINES.md for the full map of GreenLux state.
//
// Keep this file free of runtime imports so `node scripts/validate-stay-lifecycle.mjs`
// can load it directly.
import type { Database } from "@/types/database";

type CheckinStatus = Database["public"]["Enums"]["checkin_status"];
type GuestTag = Database["public"]["Enums"]["guest_tag"];

// from -> allowed next statuses for front-desk actions.
// Super Admin correction is a deliberate, audited escape hatch and is not bound by this table.
export const stayTransitions = {
  submitted: ["under_review", "approved", "checked_in", "issue"],
  under_review: ["approved", "checked_in", "issue"],
  approved: ["checked_in", "issue"],
  // An in-house guest stays in-house. Problems are flagged (guest_tag / issue_type), never a status change,
  // so the room stays occupied, check-out stays available, and occupied nights stay in reports.
  checked_in: ["checked_out"],
  // "issue" is a pre-arrival holding state. It can be resolved back to review or checked in.
  issue: ["under_review", "checked_in"],
  checked_out: [],
} as const satisfies Record<CheckinStatus, readonly CheckinStatus[]>;

export function canTransitionStay(from: CheckinStatus, to: CheckinStatus) {
  return (stayTransitions[from] as readonly CheckinStatus[]).includes(to);
}

// Can staff raise "Needs Attention" on this stay? In-house stays are flagged without leaving checked_in.
export function canFlagStay(status: CheckinStatus) {
  return status === "checked_in" || canTransitionStay(status, "issue");
}

// What "Needs Attention" does to the lifecycle status: only pre-arrival stays move to "issue".
export function statusAfterFlag(status: CheckinStatus): CheckinStatus {
  return canTransitionStay(status, "issue") ? "issue" : status;
}

export function canResolveStayIssue(status: CheckinStatus) {
  return status === "issue";
}

// Flagging overwrites guest_tag with "issue"; resolving restores the best tag we can still know.
export function guestTagAfterResolve(hasStayedBefore: boolean): GuestTag {
  return hasStayedBefore ? "repeat" : "new";
}

// A stay holds its unit (blocks assignment, shows on the Room Reality Board) until it is checked out.
export function isOpenStayStatus(status: CheckinStatus) {
  return status !== "checked_out";
}

// Guest Stays list views. The list page and the CSV export must agree, so both read this.
export type StayView = "all" | "needs_review" | "ready" | "active" | "completed" | "issues";

export const stayViews = ["all", "needs_review", "ready", "active", "completed", "issues"] as const satisfies readonly StayView[];

export const stayViewStatuses: Record<Exclude<StayView, "all" | "issues">, readonly CheckinStatus[]> = {
  needs_review: ["submitted"],
  ready: ["submitted", "under_review", "approved"],
  active: ["checked_in"],
  completed: ["checked_out"],
};

// PostgREST `or` filter: stays held in "issue", plus open stays that carry the Needs Attention flag
// (exception check-ins and flagged in-house guests).
export const issuesViewFilter = "status.eq.issue,and(guest_tag.eq.issue,status.neq.checked_out)";

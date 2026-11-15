# GreenLux State Machines

Every piece of state in GreenLux Ops that moves through stages, where its rules live, and what is still implicit. Read this before changing any status, verification, payment, cleaning, or maintenance behaviour.

Rule for new work: a transition rule belongs in one module that screens and actions import. Do not add inline `status === "..."` checks to pages or actions.

## 1. Guest Stay lifecycle — explicit

- State: `guest_checkins.status` (`submitted`, `under_review`, `approved`, `checked_in`, `checked_out`, `issue`).
- Source of truth: `src/lib/check-in/stay-lifecycle.ts` (`stayTransitions`).
- Check: `node scripts/validate-stay-lifecycle.mjs`.

```
submitted ──> under_review ──> approved ──> checked_in ──> checked_out (terminal)
    │              │              │             ▲
    └──────────────┴──────────────┴──> issue ───┘   (issue ──> under_review when resolved)
```

Rules that matter operationally:

- `issue` is a pre-arrival holding state. An in-house guest (`checked_in`) is never moved to `issue`; "Needs Attention" and a rejected document set `guest_tag = issue` and `issue_type` and leave the status alone. This keeps the room occupied, keeps Check-out available, and keeps the nights in occupancy reporting.
- `checked_out` is terminal for front-desk actions. Nothing reopens a completed stay except Super Admin correction, which is audited and deliberately not bound by the table.
- `issue` has an exit: "Needs Attention resolved" returns the stay to `under_review` and clears the flag.
- Approval and check-in keep their requirement guards (`getApprovalMissingRequirements`, `isReadyForCheckin` in `src/lib/check-in/options.ts`). Check-in without them needs an exception reason.
- The status update is conditional on the status that was read, so a double tap cannot apply two transitions.
- Every change writes `audit_logs` with action `stay_status_changed` (`from_status`, `to_status`, actor, time). This is the only record of when a guest actually arrived and left.
- Check-out of a current departure sets the unit to `cleaning_required` (see 4).

Writers of `guest_checkins.status`: `updateCheckinStatus`, `updateGuestRecord` (first review moves `submitted` to `under_review`), `updateGuestDocumentStatus` (rejection), `saveSuperAdminGuestCorrection` (unrestricted), `createManualGuest` (initial `submitted` or `under_review`), guest self check-in (always `submitted`, enforced by the `prevent_guest_internal_checkin_changes` trigger).

List views (`needs_review`, `ready`, `active`, `completed`, `issues`) are defined once in the same module and used by both the Guest Stays list and its CSV export.

## 2. Verification — implicit, two sources

- State: `guest_checkins.cnic_verified` / `payment_verified` (booleans) and `guest_documents.document_status` (`pending`, `verified`, `rejected`).
- Synced by hand in `updateGuestRecord`, `updateGuestDocumentStatus`, and `createManualGuest`. The boolean is what gates approval and check-in; the document rows are what the Room Reality Board reads for `rejected`.
- Known gap: the booleans can be ticked with no document on file (`payment_verified`), and `cnic_verified` is recomputed from documents only in some paths. Treat the booleans as the gate and the documents as evidence.

## 3. Payment — implicit, three fields

- State: `payment_status` (`pending`, `partial`, `paid`, `refunded`), the amounts (`total_expected_amount_pkr`, `amount_paid_pkr`), and `payment_verified`.
- `extendGuestStay` derives `payment_status` from the amounts. `updateGuestRecord` and Super Admin correction accept whatever staff select, so `paid` with a Balance Due is possible. Screens show Balance Due from the amounts (`getGuestFinancialSummary`), which is the figure to trust.
- Folio charges (`guest_charges.is_paid`) move one way, unpaid to paid, in `markGuestChargePaid`.
- Not changed in this pass: any rule here changes revenue reporting and needs the double-counting review in `AGENTS.md`.

## 4. Unit readiness — partly explicit

- Stored: `rooms.status` (`active`, `inactive`, `maintenance`), `rooms.cleaning_status` (`ready`, `cleaning_required`, `cleaning_in_progress`, `maintenance_blocked`), open `room_maintenance_logs`.
- Derived on every read in `src/lib/occupancy/snapshot.ts`: `OccupancyStatus` (`vacant`, `occupied`, `due_out_today`, `reserved_upcoming`, `needs_attention`, `maintenance`) and `effectiveCleaningStatus`.
- Check-out now writes `cleaning_required` on the unit when it was `ready` and the departure is current (check-out date is yesterday or later). Staff clear it with Mark Ready on the Room Reality Board. The same-day inferred turnover remains as a fallback for stays closed another way.
- "Marked ready today" is compared in Asia/Karachi time (`getBusinessDate`), not by slicing the UTC timestamp.
- Still implicit: "this unit is under maintenance" can be said three ways (`rooms.status = maintenance`, `cleaning_status = maintenance_blocked`, an open maintenance log) and nothing keeps them in step. The board treats any of them as blocking.

## 5. Maintenance issue — implicit, low risk

- State: `room_maintenance_logs.status` (`reported`, `in_progress`, `resolved`), free selection in `src/app/admin/maintenance/actions.ts`. `resolved` fills `resolved_date` if empty. A linked expense is created once, by a super admin, when an actual cost is entered.

## 6. Other state

- Guest tag (`new`, `repeat`, `vip`, `issue`, `do_not_host`): one field carries both guest type and the attention flag, so flagging overwrites `repeat`/`vip`. Resolving restores `repeat` or `new` from `has_stayed_before`; `vip` has to be reselected.
- Booking group: no status. Lead context only; never revenue truth.
- Roles (`guest`, `manager`, `admin`, `super_admin`): `src/lib/auth/roles.ts`, enforced by `requireRole` and RLS.
- Public site inquiry: no stored state. A visitor's inquiry exists only as a WhatsApp message.

## Not modelled

There is no `cancelled` or `no_show` status. A booking that never arrives stays open until someone closes it, and closing it as `checked_out` counts its nights as occupied. Adding these statuses needs a schema change and a reporting review; see the owner decisions list in the handover.

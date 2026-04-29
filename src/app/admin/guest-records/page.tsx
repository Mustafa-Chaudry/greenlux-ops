import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, LogIn, LogOut, Search } from "lucide-react";
import { updateCheckinStatus } from "@/app/admin/guest-records/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import {
  bookingSourceOptions,
  checkinStatusTone,
  formatEnumLabel,
  formatPkr,
  getActionRequiredLabel,
  getBalanceDue,
  getCheckinStatusLabel,
  getExpectedAmount,
  isReadyToApprove,
  paymentStatusOptions,
} from "@/lib/check-in/options";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Guest Records",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    payment_status?: string;
    booking_source?: string;
    date_from?: string;
    date_to?: string;
    verification?: string;
    view?: string;
    message?: string;
  }>;
};

type Checkin = Database["public"]["Tables"]["guest_checkins"]["Row"];
type OperatorView = "all" | "needs_review" | "ready" | "active" | "completed" | "issues";

const operatorViews: Array<{ value: OperatorView; label: string }> = [
  { value: "all", label: "All" },
  { value: "needs_review", label: "Needs Review" },
  { value: "ready", label: "Ready" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "issues", label: "Issues" },
];

function paymentBadge(status: string) {
  const tone = status === "paid" ? "success" : status === "partial" ? "warning" : status === "refunded" ? "info" : "neutral";
  return <Badge tone={tone}>{formatEnumLabel(status)}</Badge>;
}

function verifiedBadge(verified: boolean) {
  return <Badge tone={verified ? "success" : "warning"}>{verified ? "Yes" : "Pending"}</Badge>;
}

function statusBadge(status: Checkin["status"]) {
  return <Badge tone={checkinStatusTone[status]}>{getCheckinStatusLabel(status)}</Badge>;
}

function getActiveView(value?: string): OperatorView {
  return operatorViews.some((view) => view.value === value) ? (value as OperatorView) : "all";
}

function getViewHref(params: Awaited<PageProps["searchParams"]>, view: OperatorView) {
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value || key === "message" || key === "view") {
      return;
    }

    nextParams.set(key, value);
  });

  if (view !== "all") {
    nextParams.set("view", view);
  }

  const query = nextParams.toString();
  return `/admin/guest-records${query ? `?${query}` : ""}`;
}

function getReturnTo(params: Awaited<PageProps["searchParams"]>) {
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "message") {
      nextParams.set(key, value);
    }
  });

  const query = nextParams.toString();
  return `/admin/guest-records${query ? `?${query}` : ""}`;
}

function getExportHref(params: Awaited<PageProps["searchParams"]>) {
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "message") {
      nextParams.set(key, value);
    }
  });

  const query = nextParams.toString();
  return `/admin/guest-records/export${query ? `?${query}` : ""}`;
}

function QuickStatusButton({
  id,
  returnTo,
  status,
  children,
}: {
  id: string;
  returnTo: string;
  status: Checkin["status"];
  children: React.ReactNode;
}) {
  return (
    <form action={updateCheckinStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="return_to" value={returnTo} />
      <Button type="submit" size="sm" variant="secondary">
        {children}
      </Button>
    </form>
  );
}

export default async function GuestRecordsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { supabase } = await requireRole(managementRoles);
  const activeView = getActiveView(params.view);
  const returnTo = getReturnTo(params);

  let query = supabase.from("guest_checkins").select("*").order("created_at", { ascending: false });

  if (activeView === "needs_review") {
    query = query.eq("status", "submitted");
  } else if (activeView === "ready") {
    query = query.in("status", ["submitted", "under_review"]);
  } else if (activeView === "active") {
    query = query.eq("status", "checked_in");
  } else if (activeView === "completed") {
    query = query.eq("status", "checked_out");
  } else if (activeView === "issues") {
    query = query.eq("status", "issue");
  }

  if (params.q?.trim()) {
    const search = params.q.trim().replace(/,/g, " ");
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (params.payment_status) {
    query = query.eq("payment_status", params.payment_status as Checkin["payment_status"]);
  }

  if (params.booking_source) {
    query = query.eq("booking_source", params.booking_source as Checkin["booking_source"]);
  }

  if (params.date_from) {
    query = query.gte("check_in_date", params.date_from);
  }

  if (params.date_to) {
    query = query.lte("check_in_date", params.date_to);
  }

  if (params.verification === "cnic") {
    query = query.eq("cnic_verified", false);
  } else if (params.verification === "payment") {
    query = query.eq("payment_verified", false);
  } else if (params.verification === "any") {
    query = query.or("cnic_verified.eq.false,payment_verified.eq.false");
  }

  const { data: records, error } = await query;
  const visibleRecords = activeView === "ready" ? (records ?? []).filter(isReadyToApprove) : records ?? [];
  const assignedRoomIds = Array.from(
    new Set(visibleRecords.map((record) => record.assigned_room_id).filter((id): id is string => Boolean(id))),
  );
  const { data: rooms } = assignedRoomIds.length
    ? await supabase.from("rooms").select("id,name").in("id", assignedRoomIds)
    : { data: [] };
  const roomNames = new Map((rooms ?? []).map((room) => [room.id, room.name]));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Operations</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">Guest Records</h1>
            <p className="mt-2 text-sm text-slate-600">Search check-ins, review payments, and verify documents.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to admin</Link>
          </Button>
          <Button asChild>
            <Link href={getExportHref(params)}>Export CSV</Link>
          </Button>
        </header>

        {params.message ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">{params.message}</div>
        ) : null}

        <nav className="flex gap-2 overflow-x-auto rounded-xl border border-brand-sage bg-white/85 p-2 shadow-sm" aria-label="Guest record views">
          {operatorViews.map((view) => (
            <Button
              key={view.value}
              asChild
              size="sm"
              variant={activeView === view.value ? "default" : "ghost"}
              className="whitespace-nowrap"
            >
              <Link href={getViewHref(params, view.value)}>{view.label}</Link>
            </Button>
          ))}
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <div className="md:col-span-2 xl:col-span-2">
                <label className="sr-only" htmlFor="q">Search</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
                  <Input id="q" name="q" defaultValue={params.q ?? ""} placeholder="Search name, phone, email" className="pl-9" />
                </div>
              </div>
              <Select name="payment_status" defaultValue={params.payment_status ?? ""} aria-label="Payment status">
                <option value="">All payments</option>
                {paymentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select name="booking_source" defaultValue={params.booking_source ?? ""} aria-label="Booking source">
                <option value="">All sources</option>
                {bookingSourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Input name="date_from" type="date" defaultValue={params.date_from ?? ""} aria-label="Check-in date from" />
              <Input name="date_to" type="date" defaultValue={params.date_to ?? ""} aria-label="Check-in date to" />
              <Select name="verification" defaultValue={params.verification ?? ""} aria-label="Verification pending">
                <option value="">All verification</option>
                <option value="any">Any pending</option>
                <option value="cnic">CNIC pending</option>
                <option value="payment">Payment pending</option>
              </Select>
              <div className="flex gap-2 md:col-span-2 xl:col-span-5">
                <Button type="submit">Apply filters</Button>
                <Button asChild variant="outline">
                  <Link href="/admin/guest-records">Clear</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {error ? (
              <div className="p-5 text-sm text-red-700">{error.message}</div>
            ) : !visibleRecords.length ? (
              <div className="p-5 text-sm text-slate-600">No guest records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1700px] text-left text-sm">
                  <thead className="border-b border-brand-sage bg-brand-ivory text-xs uppercase tracking-[0.12em] text-brand-deep">
                    <tr>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action Required</th>
                      <th className="px-4 py-3">Guest</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Guests</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Expected</th>
                      <th className="px-4 py-3">Paid</th>
                      <th className="px-4 py-3">Balance</th>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3">CNIC</th>
                      <th className="px-4 py-3">Proof</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sage/70">
                    {visibleRecords.map((record) => (
                      <tr key={record.id} className="bg-white hover:bg-brand-ivory/70">
                        <td className="px-4 py-3">{statusBadge(record.status)}</td>
                        <td className="px-4 py-3">
                          <Badge tone={getActionRequiredLabel(record) === "Issue flagged" ? "danger" : "info"}>
                            {getActionRequiredLabel(record)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-brand-deep">{record.full_name}</div>
                          <div className="text-xs text-slate-500">{record.email}</div>
                        </td>
                        <td className="px-4 py-3">{record.phone}</td>
                        <td className="px-4 py-3">
                          <div>{record.check_in_date}</div>
                          <div className="text-xs text-slate-500">to {record.check_out_date}</div>
                        </td>
                        <td className="px-4 py-3">{record.number_of_guests}</td>
                        <td className="px-4 py-3">{formatEnumLabel(record.booking_source)}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div>{formatEnumLabel(record.payment_method)}</div>
                            {paymentBadge(record.payment_status)}
                          </div>
                        </td>
                        <td className="px-4 py-3">{formatPkr(getExpectedAmount(record))}</td>
                        <td className="px-4 py-3">{formatPkr(record.amount_paid_pkr)}</td>
                        <td className="px-4 py-3">{formatPkr(getBalanceDue(record))}</td>
                        <td className="px-4 py-3">{record.assigned_room_id ? roomNames.get(record.assigned_room_id) ?? "Assigned" : "Not assigned"}</td>
                        <td className="px-4 py-3">{verifiedBadge(record.cnic_verified)}</td>
                        <td className="px-4 py-3">{verifiedBadge(record.payment_verified)}</td>
                        <td className="px-4 py-3">{new Date(record.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/guest-records/${record.id}`}>Open</Link>
                          </Button>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {isReadyToApprove(record) ? (
                              <QuickStatusButton id={record.id} returnTo={returnTo} status="approved">
                                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                Approve
                              </QuickStatusButton>
                            ) : null}
                            {record.status === "approved" ? (
                              <QuickStatusButton id={record.id} returnTo={returnTo} status="checked_in">
                                <LogIn className="h-4 w-4" aria-hidden="true" />
                                Check-in
                              </QuickStatusButton>
                            ) : null}
                            {record.status === "checked_in" ? (
                              <QuickStatusButton id={record.id} returnTo={returnTo} status="checked_out">
                                <LogOut className="h-4 w-4" aria-hidden="true" />
                                Check-out
                              </QuickStatusButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

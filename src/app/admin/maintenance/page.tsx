import type { Metadata } from "next";
import Link from "next/link";
import { createMaintenanceLog, updateMaintenanceLog } from "@/app/admin/maintenance/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/guards";
import { hasAllowedRole, managementRoles, superAdminRoles } from "@/lib/auth/roles";
import {
  formatEnumLabel,
  formatPkr,
  formatUnitRoomLabel,
  getBusinessTodayDate,
  maintenanceStatusOptions,
  paymentMethodOptions,
} from "@/lib/check-in/options";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Maintenance",
};

type PageProps = {
  searchParams: Promise<{
    message?: string;
    error_id?: string;
    room_id_error?: string;
    issue_title_error?: string;
    status_error?: string;
    cost_pkr_error?: string;
    actual_cost_pkr_error?: string;
    vendor_paid_to_error?: string;
    payment_method_error?: string;
    reported_date_error?: string;
    resolved_date_error?: string;
  }>;
};

type MaintenanceLog = Database["public"]["Tables"]["room_maintenance_logs"]["Row"];

function maintenanceTone(status: MaintenanceLog["status"]) {
  if (status === "resolved") {
    return "success";
  }
  if (status === "in_progress") {
    return "warning";
  }
  return "neutral";
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm font-medium text-red-700">{message}</p>;
}

function fieldError(params: Awaited<PageProps["searchParams"]>, field: string, id?: string) {
  if (id && params.error_id !== id) {
    return undefined;
  }

  if (!id && params.error_id) {
    return undefined;
  }

  return params[`${field}_error` as keyof Awaited<PageProps["searchParams"]>];
}

export default async function MaintenancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const today = getBusinessTodayDate();
  const { supabase, profile } = await requireRole(managementRoles);
  const canLinkExpenses = hasAllowedRole(profile.role, superAdminRoles);
  const [{ data: logs, error }, { data: rooms }] = await Promise.all([
    supabase.from("room_maintenance_logs").select("*").order("reported_date", { ascending: false }),
    supabase.from("rooms").select("id,unit_number,name,status").order("unit_number", { nullsFirst: false }),
  ]);
  const roomNames = new Map((rooms ?? []).map((room) => [room.id, formatUnitRoomLabel(room)]));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Operations</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">Maintenance</h1>
            <p className="mt-2 text-sm text-slate-600">Track unit issues, repair status, costs, and resolution dates.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to admin</Link>
          </Button>
        </header>

        {params.message ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">{params.message}</div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Create maintenance issue</CardTitle>
            <CardDescription>
              Unit, issue title, reported date, and status are required. Estimated cost is not included in profit.
              Super admins can record an actual paid cost to create one linked expense.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createMaintenanceLog} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="room_id">Unit</Label>
                <Select id="room_id" name="room_id" required>
                  <option value="">Select room</option>
                  {(rooms ?? []).map((room) => (
                    <option key={room.id} value={room.id}>
                      {formatUnitRoomLabel(room)} ({formatEnumLabel(room.status)})
                    </option>
                  ))}
                </Select>
                <FieldError message={fieldError(params, "room_id")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue_title">Issue title</Label>
                <Input id="issue_title" name="issue_title" required />
                <FieldError message={fieldError(params, "issue_title")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reported_date">Reported date</Label>
                <Input id="reported_date" name="reported_date" type="date" defaultValue={today} required />
                <FieldError message={fieldError(params, "reported_date")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue="reported" required>
                  {maintenanceStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
                <FieldError message={fieldError(params, "status")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost_pkr">Estimated Cost (not included in profit)</Label>
                <Input id="cost_pkr" name="cost_pkr" type="number" min={0} />
                <p className="text-xs text-slate-500">Operational estimate only. Actual cash spent belongs in Expenses.</p>
                <FieldError message={fieldError(params, "cost_pkr")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolved_date">Resolved date</Label>
                <Input id="resolved_date" name="resolved_date" type="date" />
                <FieldError message={fieldError(params, "resolved_date")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual_cost_pkr">Actual Cost PKR (creates linked expense)</Label>
                <Input id="actual_cost_pkr" name="actual_cost_pkr" type="number" min={0} disabled={!canLinkExpenses} />
                <p className="text-xs text-slate-500">Super admin only. Counted in profit/loss through Expenses.</p>
                <FieldError message={fieldError(params, "actual_cost_pkr")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor_paid_to">Paid to</Label>
                <Input id="vendor_paid_to" name="vendor_paid_to" disabled={!canLinkExpenses} />
                <FieldError message={fieldError(params, "vendor_paid_to")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment method</Label>
                <Select id="payment_method" name="payment_method" defaultValue="" disabled={!canLinkExpenses}>
                  <option value="">Select if paid</option>
                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
                <FieldError message={fieldError(params, "payment_method")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt upload</Label>
                <Input id="receipt" name="receipt" type="file" accept=".jpg,.jpeg,.png,.pdf" disabled={!canLinkExpenses} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="issue_description">Issue description</Label>
                <Textarea id="issue_description" name="issue_description" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" />
              </div>
              <div className="flex items-end">
                <Button type="submit">Add issue</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <p className="text-sm text-red-700">{error.message}</p>
            ) : !logs?.length ? (
              <p className="text-sm text-slate-600">No maintenance issues recorded yet.</p>
            ) : (
              logs.map((log) => (
                <form key={log.id} action={updateMaintenanceLog} className="rounded-lg border border-brand-sage bg-white p-4">
                  <input type="hidden" name="id" value={log.id} />
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-semibold text-brand-deep">{log.issue_title}</h2>
                      <p className="text-sm text-slate-600">
                        {roomNames.get(log.room_id) ?? "Assigned unit"} - reported {log.reported_date}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={maintenanceTone(log.status)}>{formatEnumLabel(log.status)}</Badge>
                      {log.linked_expense_id ? <Badge tone="success">Linked expense</Badge> : <Badge tone="neutral">No linked expense</Badge>}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {!canLinkExpenses || log.linked_expense_id ? (
                      <>
                        <input type="hidden" name="actual_cost_pkr" value={log.actual_cost_pkr ?? ""} />
                        <input type="hidden" name="vendor_paid_to" value={log.vendor_paid_to ?? ""} />
                        <input type="hidden" name="payment_method" value={log.payment_method ?? ""} />
                      </>
                    ) : null}
                    <div>
                      <Select name="room_id" defaultValue={log.room_id} aria-label="Unit">
                        {(rooms ?? []).map((room) => (
                          <option key={room.id} value={room.id}>{formatUnitRoomLabel(room)}</option>
                        ))}
                      </Select>
                      <FieldError message={fieldError(params, "room_id", log.id)} />
                    </div>
                    <div>
                      <Input name="issue_title" defaultValue={log.issue_title} aria-label="Issue title" />
                      <FieldError message={fieldError(params, "issue_title", log.id)} />
                    </div>
                    <div>
                      <Select name="status" defaultValue={log.status} aria-label="Status">
                        {maintenanceStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Select>
                      <FieldError message={fieldError(params, "status", log.id)} />
                    </div>
                    <div>
                      <Input
                        name="cost_pkr"
                        type="number"
                        min={0}
                        defaultValue={log.cost_pkr ?? ""}
                        aria-label="Estimated cost not included in profit"
                      />
                      <FieldError message={fieldError(params, "cost_pkr", log.id)} />
                    </div>
                    <div>
                      <Input
                        name="actual_cost_pkr"
                        type="number"
                        min={0}
                        defaultValue={log.actual_cost_pkr ?? ""}
                        aria-label="Actual cost counted through linked expense"
                        disabled={!canLinkExpenses || Boolean(log.linked_expense_id)}
                      />
                      <FieldError message={fieldError(params, "actual_cost_pkr", log.id)} />
                    </div>
                    <div>
                      <Input
                        name="vendor_paid_to"
                        defaultValue={log.vendor_paid_to ?? ""}
                        aria-label="Paid to"
                        disabled={!canLinkExpenses || Boolean(log.linked_expense_id)}
                      />
                      <FieldError message={fieldError(params, "vendor_paid_to", log.id)} />
                    </div>
                    <div>
                      <Select
                        name="payment_method"
                        defaultValue={log.payment_method ?? ""}
                        aria-label="Payment method"
                        disabled={!canLinkExpenses || Boolean(log.linked_expense_id)}
                      >
                        <option value="">No actual payment</option>
                        {paymentMethodOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Select>
                      <FieldError message={fieldError(params, "payment_method", log.id)} />
                    </div>
                    <div>
                      <Input
                        name="receipt"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        aria-label="Receipt upload"
                        disabled={!canLinkExpenses || Boolean(log.linked_expense_id)}
                      />
                    </div>
                    <div>
                      <Input name="reported_date" type="date" defaultValue={log.reported_date} aria-label="Reported date" />
                      <FieldError message={fieldError(params, "reported_date", log.id)} />
                    </div>
                    <div>
                      <Input name="resolved_date" type="date" defaultValue={log.resolved_date ?? ""} aria-label="Resolved date" />
                      <FieldError message={fieldError(params, "resolved_date", log.id)} />
                    </div>
                    <Textarea name="issue_description" defaultValue={log.issue_description ?? ""} aria-label="Issue description" />
                    <Textarea name="notes" defaultValue={log.notes ?? ""} aria-label="Notes" />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Estimated maintenance cost: {formatPkr(log.cost_pkr)}. Actual expense: {formatPkr(log.actual_cost_pkr)}.
                    Profit/loss uses the linked Expenses row only.
                  </p>
                  <div className="mt-4">
                    <Button type="submit" size="sm">Save issue</Button>
                  </div>
                </form>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

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
import { managementRoles } from "@/lib/auth/roles";
import { formatEnumLabel, formatPkr, getBusinessTodayDate, maintenanceStatusOptions } from "@/lib/check-in/options";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Maintenance",
};

type PageProps = {
  searchParams: Promise<{ message?: string }>;
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

export default async function MaintenancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const today = getBusinessTodayDate();
  const { supabase } = await requireRole(managementRoles);
  const [{ data: logs, error }, { data: rooms }] = await Promise.all([
    supabase.from("room_maintenance_logs").select("*").order("reported_date", { ascending: false }),
    supabase.from("rooms").select("id,name,status").order("name"),
  ]);
  const roomNames = new Map((rooms ?? []).map((room) => [room.id, room.name]));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Operations</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">Maintenance</h1>
            <p className="mt-2 text-sm text-slate-600">Track room issues, repair status, costs, and resolution dates.</p>
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
            <CardDescription>Attach each issue to a room so repair costs can be reviewed later.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createMaintenanceLog} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="room_id">Room</Label>
                <Select id="room_id" name="room_id" required>
                  <option value="">Select room</option>
                  {(rooms ?? []).map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({formatEnumLabel(room.status)})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue_title">Issue title</Label>
                <Input id="issue_title" name="issue_title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reported_date">Reported date</Label>
                <Input id="reported_date" name="reported_date" type="date" defaultValue={today} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue="reported" required>
                  {maintenanceStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost_pkr">Cost PKR</Label>
                <Input id="cost_pkr" name="cost_pkr" type="number" min={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolved_date">Resolved date</Label>
                <Input id="resolved_date" name="resolved_date" type="date" />
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
                        {roomNames.get(log.room_id) ?? "Assigned room"} - reported {log.reported_date}
                      </p>
                    </div>
                    <Badge tone={maintenanceTone(log.status)}>{formatEnumLabel(log.status)}</Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Select name="room_id" defaultValue={log.room_id} aria-label="Room">
                      {(rooms ?? []).map((room) => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </Select>
                    <Input name="issue_title" defaultValue={log.issue_title} aria-label="Issue title" />
                    <Select name="status" defaultValue={log.status} aria-label="Status">
                      {maintenanceStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                    <Input name="cost_pkr" type="number" min={0} defaultValue={log.cost_pkr ?? ""} aria-label="Cost PKR" />
                    <Input name="reported_date" type="date" defaultValue={log.reported_date} aria-label="Reported date" />
                    <Input name="resolved_date" type="date" defaultValue={log.resolved_date ?? ""} aria-label="Resolved date" />
                    <Textarea name="issue_description" defaultValue={log.issue_description ?? ""} aria-label="Issue description" />
                    <Textarea name="notes" defaultValue={log.notes ?? ""} aria-label="Notes" />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Cost: {formatPkr(log.cost_pkr)}</p>
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

import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Hotel, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import { formatEnumLabel, formatPkr } from "@/lib/check-in/options";
import { fetchOccupancySnapshot, occupancyStatusLabels, occupancyStatusTone } from "@/lib/occupancy/snapshot";

export const metadata: Metadata = {
  title: "Occupancy Board",
};

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-brand-sage bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold text-brand-deep">{value}</p>
    </div>
  );
}

export default async function OccupancyPage() {
  const { supabase } = await requireRole(managementRoles);
  const snapshot = await fetchOccupancySnapshot(supabase);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Live operations</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">Occupancy Board</h1>
            <p className="mt-2 text-sm text-slate-600">
              Live 11-unit view for {snapshot.today}. This shows operational visibility only, not a booking engine.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to admin</Link>
          </Button>
        </header>

        {snapshot.errors.length > 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {snapshot.errors.join(" ")}
          </div>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7" aria-label="Occupancy summary">
          <SummaryMetric label="Total units" value={snapshot.summary.totalUnits} />
          <SummaryMetric label="Occupied" value={snapshot.summary.occupiedUnits} />
          <SummaryMetric label="Vacant" value={snapshot.summary.vacantUnits} />
          <SummaryMetric label="Due out today" value={snapshot.summary.dueOutToday} />
          <SummaryMetric label="Upcoming" value={snapshot.summary.upcomingArrivals} />
          <SummaryMetric label="Needs attention" value={snapshot.summary.needsAttentionUnits} />
          <SummaryMetric label="Occupancy" value={`${snapshot.summary.occupancyPercentage}%`} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.units.map((unit) => {
            const stay = unit.currentStay ?? unit.upcomingStay;

            return (
              <Card key={unit.room.id} className="overflow-hidden">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardDescription>Unit {unit.room.unit_number ?? "-"}</CardDescription>
                      <CardTitle>{unit.room.name}</CardTitle>
                    </div>
                    <Badge tone={occupancyStatusTone[unit.status]}>{occupancyStatusLabels[unit.status]}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{formatEnumLabel(unit.room.type)}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unit.currentStay ? (
                    <div className="rounded-lg bg-brand-ivory p-3 text-sm">
                      <p className="font-semibold text-brand-deep">{unit.currentStay.full_name}</p>
                      <p className="mt-1 flex items-center gap-2 text-slate-600">
                        <CalendarDays className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                        {unit.currentStay.check_in_date} to {unit.currentStay.check_out_date || "No checkout date"}
                      </p>
                    </div>
                  ) : unit.upcomingStay ? (
                    <div className="rounded-lg bg-brand-ivory p-3 text-sm">
                      <p className="font-semibold text-brand-deep">Upcoming: {unit.upcomingStay.full_name}</p>
                      <p className="mt-1 flex items-center gap-2 text-slate-600">
                        <CalendarDays className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                        {unit.upcomingStay.check_in_date} to {unit.upcomingStay.check_out_date || "No checkout date"}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-brand-ivory p-3 text-sm text-slate-600">
                      No current or upcoming guest assigned.
                    </div>
                  )}

                  {stay ? (
                    <div className="grid gap-2 text-sm">
                      <p>Outstanding balance: <span className="font-semibold text-brand-deep">{formatPkr(unit.outstandingBalance)}</span></p>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={stay.cnic_verified ? "success" : "warning"}>CNIC {stay.cnic_verified ? "verified" : "pending"}</Badge>
                        <Badge tone={stay.payment_verified ? "success" : "warning"}>Payment {stay.payment_verified ? "verified" : "pending"}</Badge>
                        {stay.issue_type ? <Badge tone="danger">{formatEnumLabel(stay.issue_type)}</Badge> : null}
                      </div>
                    </div>
                  ) : null}

                  {unit.openMaintenance ? (
                    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <Wrench className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{unit.openMaintenance.issue_title}</span>
                    </div>
                  ) : null}

                  {unit.attentionReasons.length > 0 ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                      <p className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        Needs attention
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {unit.attentionReasons.map((reason) => (
                          <Badge key={reason} tone="danger">{reason}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {stay ? (
                      <Button asChild size="sm">
                        <Link href={`/admin/guest-records/${stay.id}`}>Open guest record</Link>
                      </Button>
                    ) : null}
                    <Button asChild size="sm" variant="outline">
                      <Link href="/admin/rooms">
                        <Hotel className="h-4 w-4" aria-hidden="true" />
                        Unit settings
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}

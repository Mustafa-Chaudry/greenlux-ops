import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth/guards";
import { superAdminRoles } from "@/lib/auth/roles";
import { formatPkr } from "@/lib/check-in/options";
import {
  buildBusinessReport,
  fetchReportInputs,
  formatPercent,
  getReportDateRange,
  reportPresetOptions,
  type ReportDateRange,
  type ReportDateRangePreset,
} from "@/lib/reports/analytics";
import { fetchOccupancySnapshot } from "@/lib/occupancy/snapshot";

export const metadata: Metadata = {
  title: "Business Reports",
};

type PageProps = {
  searchParams: Promise<{
    range?: string;
    start?: string;
    end?: string;
  }>;
};

function presetHref(preset: ReportDateRangePreset) {
  return `/admin/reports?range=${preset}`;
}

function exportHref(range: ReportDateRange) {
  const params = new URLSearchParams({ range: range.preset });

  if (range.preset === "custom") {
    params.set("start", range.startDate);
    params.set("end", range.endDate);
  }

  return `/admin/reports/export?${params.toString()}`;
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-serif text-3xl text-brand-deep">{value}</CardTitle>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

function DataTable({
  title,
  description,
  headers,
  minWidth = 720,
  children,
}: {
  title: string;
  description?: string;
  headers: string[];
  minWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ minWidth }}>
            <thead className="border-b border-brand-sage bg-brand-ivory text-xs uppercase tracking-[0.12em] text-brand-deep">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sage/70">{children}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-sage bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 font-serif text-2xl font-semibold text-brand-deep">{value}</p>
    </div>
  );
}

function CountRows({ rows }: { rows: Array<{ key: string; label: string; count: number }> }) {
  return (
    <>
      {rows.map((row) => (
        <tr key={row.key} className="bg-white">
          <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
          <td className="px-4 py-3">{row.count}</td>
        </tr>
      ))}
    </>
  );
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = getReportDateRange(params);
  const { supabase } = await requireRole(superAdminRoles);
  const reportInputs = await fetchReportInputs(supabase, range);
  const report = buildBusinessReport(reportInputs);
  const occupancy = await fetchOccupancySnapshot(supabase);
  const hasNoActivity =
    report.kpis.totalBookings === 0 &&
    report.kpis.totalRevenue === 0 &&
    report.kpis.guestChargesTotal === 0 &&
    report.kpis.totalExpenses === 0 &&
    report.maintenance.openIssues === 0 &&
    report.maintenance.inProgressIssues === 0 &&
    report.maintenance.resolvedIssues === 0;

  const kpiCards = [
    { label: "Total Revenue", value: formatPkr(report.kpis.totalRevenue), hint: "Base stay paid + paid guest charges" },
    { label: "Guest Charges", value: formatPkr(report.kpis.guestChargesTotal), hint: "Additional services and folio items" },
    { label: "Paid Guest Charges", value: formatPkr(report.kpis.paidGuestCharges), hint: "Paid breakfast, laundry, late checkout, and other folio items" },
    { label: "Unpaid Guest Charges", value: formatPkr(report.kpis.unpaidGuestCharges), hint: "Outstanding folio items" },
    { label: "Total Expenses", value: formatPkr(report.kpis.totalExpenses), hint: "Recorded operating spend" },
    { label: "Net Profit", value: formatPkr(report.kpis.netProfit), hint: "Revenue minus recorded expenses" },
    { label: "Outstanding Balance", value: formatPkr(report.kpis.outstandingTotal), hint: "Expected minus paid" },
    { label: "Total Bookings", value: String(report.kpis.totalBookings), hint: "Check-ins in date range" },
    { label: "Active Stays", value: String(report.kpis.activeStays), hint: "Status marked checked-in" },
    { label: "Direct Booking Revenue", value: formatPkr(report.kpis.directBookingRevenue), hint: "Direct WhatsApp / call" },
    { label: "Platform Booking Revenue", value: formatPkr(report.kpis.platformBookingRevenue), hint: "Booking.com and Airbnb" },
  ];

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Business owner reports</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">GreenLux business analytics</h1>
            <p className="mt-2 text-sm text-slate-600">
              Read-only reporting for {range.startDate} to {range.endDate}. No guest identity documents or sensitive ID
              fields are included.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin">Back to admin</Link>
            </Button>
            <Button asChild>
              <Link href={exportHref(range)}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export Report CSV
              </Link>
            </Button>
          </div>
        </header>

        {reportInputs.errors.length > 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {reportInputs.errors.join(" ")}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Date range</CardTitle>
            <CardDescription>Default reporting uses the current Asia/Karachi business month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {reportPresetOptions.map((option) => (
                <Button
                  key={option.value}
                  asChild
                  size="sm"
                  variant={range.preset === option.value ? "default" : "outline"}
                >
                  <Link href={presetHref(option.value)}>{option.label}</Link>
                </Button>
              ))}
            </div>
            <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <input type="hidden" name="range" value="custom" />
              <div className="space-y-2">
                <Label htmlFor="start">Custom start</Label>
                <Input id="start" name="start" type="date" defaultValue={range.startDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Custom end</Label>
                <Input id="end" name="end" type="date" defaultValue={range.endDate} />
              </div>
              <Button type="submit" variant={range.preset === "custom" ? "default" : "secondary"}>
                Apply custom range
              </Button>
            </form>
          </CardContent>
        </Card>

        {hasNoActivity ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">
            No bookings, expenses, or maintenance activity were found for this date range.
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Executive KPIs">
          {kpiCards.map((card) => (
            <KpiCard key={card.label} {...card} />
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Live Occupancy Summary</CardTitle>
            <CardDescription>Current 11-unit operational position for {occupancy.today}.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <MiniMetric label="Total units" value={String(occupancy.summary.totalUnits)} />
            <MiniMetric label="Occupied" value={String(occupancy.summary.occupiedUnits)} />
            <MiniMetric label="Vacant" value={String(occupancy.summary.vacantUnits)} />
            <MiniMetric label="Due out today" value={String(occupancy.summary.dueOutToday)} />
            <MiniMetric label="Upcoming" value={String(occupancy.summary.upcomingArrivals)} />
            <MiniMetric label="Needs attention" value={String(occupancy.summary.needsAttentionUnits)} />
            <MiniMetric label="Occupancy" value={`${occupancy.summary.occupancyPercentage}%`} />
          </CardContent>
        </Card>

        <DataTable
          title="Booking Source Breakdown"
          description="Compares platform dependency against direct and referral bookings."
          headers={["Booking source", "Bookings", "Expected revenue", "Paid revenue", "Outstanding"]}
        >
          {report.bookingSourceRows.map((row) => (
            <tr key={row.key} className="bg-white">
              <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
              <td className="px-4 py-3">{row.bookings}</td>
              <td className="px-4 py-3">{formatPkr(row.expectedRevenue)}</td>
              <td className="px-4 py-3">{formatPkr(row.paidRevenue)}</td>
              <td className="px-4 py-3">{formatPkr(row.outstandingBalance)}</td>
            </tr>
          ))}
        </DataTable>

        <DataTable
          title="Unit Performance"
          description="Shows which real units are earning, carrying balance, or currently occupied."
          headers={["Unit", "Bookings", "Expected revenue", "Paid revenue", "Outstanding", "Avg paid / booking", "Active stays"]}
        >
          {report.roomRows.map((row) => (
            <tr key={row.key} className="bg-white">
              <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
              <td className="px-4 py-3">{row.bookings}</td>
              <td className="px-4 py-3">{formatPkr(row.expectedRevenue)}</td>
              <td className="px-4 py-3">{formatPkr(row.paidRevenue)}</td>
              <td className="px-4 py-3">{formatPkr(row.outstandingBalance)}</td>
              <td className="px-4 py-3">{formatPkr(row.averagePaidPerBooking)}</td>
              <td className="px-4 py-3">{row.activeStays}</td>
            </tr>
          ))}
        </DataTable>

        <DataTable
          title="Category Summary"
          description="Groups unit performance by existing room category/tag after unit-level calculation."
          headers={["Category", "Bookings", "Expected revenue", "Paid revenue", "Outstanding", "Avg paid / booking", "Active stays"]}
        >
          {report.categoryRows.map((row) => (
            <tr key={row.key} className="bg-white">
              <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
              <td className="px-4 py-3">{row.bookings}</td>
              <td className="px-4 py-3">{formatPkr(row.expectedRevenue)}</td>
              <td className="px-4 py-3">{formatPkr(row.paidRevenue)}</td>
              <td className="px-4 py-3">{formatPkr(row.outstandingBalance)}</td>
              <td className="px-4 py-3">{formatPkr(row.averagePaidPerBooking)}</td>
              <td className="px-4 py-3">{row.activeStays}</td>
            </tr>
          ))}
        </DataTable>

        <DataTable
          title="Expense Breakdown"
          description="Tracks where operating cash is going in the selected range."
          headers={["Expense category", "Count", "Total amount", "% of expenses"]}
        >
          {report.expenseRows.map((row) => (
            <tr key={row.key} className="bg-white">
              <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
              <td className="px-4 py-3">{row.count}</td>
              <td className="px-4 py-3">{formatPkr(row.totalAmount)}</td>
              <td className="px-4 py-3">{formatPercent(row.percentageOfTotal)}</td>
            </tr>
          ))}
        </DataTable>

        <DataTable
          title="Guest Charges Breakdown"
          description="Additional guest services are revenue and are not mixed with expenses."
          headers={["Charge type", "Count", "Total", "Paid", "Unpaid"]}
        >
          {report.chargeRows.map((row) => (
            <tr key={row.key} className="bg-white">
              <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
              <td className="px-4 py-3">{row.count}</td>
              <td className="px-4 py-3">{formatPkr(row.totalAmount)}</td>
              <td className="px-4 py-3">{formatPkr(row.paidAmount)}</td>
              <td className="px-4 py-3">{formatPkr(row.unpaidAmount)}</td>
            </tr>
          ))}
        </DataTable>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Summary</CardTitle>
              <CardDescription>
                Open repair burden and expense-linked maintenance costs. Profit/loss uses Expenses only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <MiniMetric label="Open issues" value={String(report.maintenance.openIssues)} />
                <MiniMetric label="In progress" value={String(report.maintenance.inProgressIssues)} />
                <MiniMetric label="Resolved" value={String(report.maintenance.resolvedIssues)} />
                <MiniMetric label="Recorded maintenance expenses" value={formatPkr(report.maintenance.recordedExpenseTotal)} />
                <MiniMetric label="Maintenance log estimate" value={formatPkr(report.maintenance.costTotal)} />
              </div>
            </CardContent>
          </Card>

          <DataTable
            title="Maintenance Expenses by Unit"
            headers={["Unit", "Expense entries", "Recorded expenses"]}
            minWidth={480}
          >
            {report.maintenance.expenseByRoomRows.length ? (
              report.maintenance.expenseByRoomRows.map((row) => (
                <tr key={row.key} className="bg-white">
                  <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
                  <td className="px-4 py-3">{row.expenseCount}</td>
                  <td className="px-4 py-3">{formatPkr(row.totalCost)}</td>
                </tr>
              ))
            ) : (
              <tr className="bg-white">
                <td className="px-4 py-3 text-slate-600" colSpan={3}>No room-linked maintenance expenses recorded.</td>
              </tr>
            )}
          </DataTable>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          <DataTable title="New vs Repeat" headers={["Guest type", "Count"]} minWidth={280}>
            <CountRows rows={report.operations.repeatGuestRows} />
          </DataTable>
          <DataTable title="Guest Purpose" headers={["Purpose", "Count"]} minWidth={280}>
            <CountRows rows={report.operations.purposeRows} />
          </DataTable>
          <DataTable title="Check-in Status" headers={["Status", "Count"]} minWidth={280}>
            <CountRows rows={report.operations.checkinStatusRows} />
          </DataTable>
          <DataTable title="Payment Status" headers={["Payment", "Count"]} minWidth={280}>
            <CountRows rows={report.operations.paymentStatusRows} />
          </DataTable>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Simple Insights</CardTitle>
            <CardDescription>Deterministic notes generated from this date range.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {report.insights.map((insight) => (
                <div key={insight} className="rounded-lg border border-brand-sage bg-brand-ivory p-3 text-sm text-brand-deep">
                  <Badge tone="info" className="mb-2">Insight</Badge>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

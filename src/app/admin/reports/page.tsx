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
  reportModeOptions,
  type ReportDateRange,
  type ReportMode,
} from "@/lib/reports/analytics";

export const metadata: Metadata = {
  title: "Business Analytics",
};

type PageProps = {
  searchParams: Promise<{
    mode?: string;
    range?: string;
    date?: string;
    month?: string;
    start?: string;
    end?: string;
  }>;
};

function modeHref(mode: ReportMode, range: ReportDateRange) {
  const params = new URLSearchParams({ mode });

  if (mode === "daily") {
    params.set("date", range.anchorDate || range.startDate);
  } else if (mode === "weekly") {
    params.set("date", range.anchorDate || range.startDate);
  } else if (mode === "monthly") {
    params.set("month", range.month || range.startDate.slice(0, 7));
  } else {
    params.set("start", range.startDate);
    params.set("end", range.endDate);
  }

  return `/admin/reports?${params.toString()}`;
}

function exportHref(range: ReportDateRange) {
  const params = new URLSearchParams({
    range: "custom",
    start: range.startDate,
    end: range.endDate,
  });

  return `/admin/reports/export?${params.toString()}`;
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function reportingPeriodLabel(range: ReportDateRange) {
  if (range.startDate === range.endDate) {
    return formatDisplayDate(range.startDate);
  }

  return `${formatDisplayDate(range.startDate)} - ${formatDisplayDate(range.endDate)}`;
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-serif text-3xl text-brand-deep">{value}</CardTitle>
        <p className="text-xs text-slate-500">{hint}</p>
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
                  <th key={header} className="px-4 py-3">
                    {header}
                  </th>
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

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr className="bg-white">
      <td className="px-4 py-3 text-slate-600" colSpan={colSpan}>
        {message}
      </td>
    </tr>
  );
}

function MiniMetric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-brand-sage bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 font-serif text-2xl font-semibold text-brand-deep">{value}</p>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
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

function percentOf(value: number, max: number) {
  if (value <= 0 || max <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(4, (value / max) * 100));
}

function BarRow({
  label,
  value,
  max,
  meta,
  tone = "fresh",
}: {
  label: string;
  value: number;
  max: number;
  meta: string;
  tone?: "fresh" | "deep" | "warning";
}) {
  const toneClass =
    tone === "warning" ? "bg-amber-500" : tone === "deep" ? "bg-brand-deep" : "bg-brand-fresh";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-brand-deep">{label}</span>
        <span className="text-xs text-slate-500">{meta}</span>
      </div>
      <div className="h-2 rounded-full bg-brand-ivory">
        <div className={`h-2 rounded-full ${toneClass}`} style={{ width: `${percentOf(value, max)}%` }} />
      </div>
    </div>
  );
}

function performanceRowsWithActivity<T extends { bookedRoomNights: number; expectedRevenue: number; paidRevenue: number }>(rows: T[]) {
  return rows.filter((row) => row.bookedRoomNights > 0 || row.expectedRevenue > 0 || row.paidRevenue > 0);
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = getReportDateRange(params);
  const { supabase } = await requireRole(superAdminRoles);
  const reportInputs = await fetchReportInputs(supabase, range);
  const report = buildBusinessReport(reportInputs);
  const periodLabel = reportingPeriodLabel(range);
  const activeSourceRows = performanceRowsWithActivity(report.bookingSourceRows);
  const activeUnitTypeRows = performanceRowsWithActivity(report.unitTypeRows);
  const activeUnitRows = performanceRowsWithActivity(report.roomRows);
  const activeExpenseRows = report.expenseRows.filter((row) => row.totalAmount > 0);
  const activeChargeRows = report.chargeRows.filter((row) => row.totalAmount > 0);
  const maxSourceRevenue = Math.max(...activeSourceRows.map((row) => row.paidRevenue), 1);
  const maxUnitTypeRevenue = Math.max(...activeUnitTypeRows.map((row) => row.paidRevenue), 1);
  const maxExpenseAmount = Math.max(...activeExpenseRows.map((row) => row.totalAmount), 1);
  const maxDailyRevenue = Math.max(...report.dailyRows.map((row) => row.expectedRevenue), 1);
  const highestBalanceRisk = report.attentionRows.find((row) => row.balanceDue > 0);
  const bestUnitType = [...activeUnitTypeRows].sort((a, b) => b.averageRatePerNight - a.averageRatePerNight)[0];
  const underperformingUnit = [...activeUnitRows]
    .filter((row) => row.bookings > 0)
    .sort((a, b) => a.paidRevenue - b.paidRevenue || b.balanceDue - a.balanceDue)[0];
  const topExpenseCategory = [...activeExpenseRows].sort((a, b) => b.totalAmount - a.totalAmount)[0];
  const hasNoActivity =
    report.kpis.bookedRoomNights === 0 &&
    report.kpis.totalRevenue === 0 &&
    report.kpis.guestChargesTotal === 0 &&
    report.kpis.totalExpenses === 0 &&
    report.maintenance.openIssues === 0 &&
    report.maintenance.inProgressIssues === 0 &&
    report.maintenance.resolvedIssues === 0;

  const kpiCards = [
    {
      label: "Expected Revenue",
      value: formatPkr(report.kpis.expectedTotal),
      hint: "Room-night allocated revenue plus additional charges.",
    },
    {
      label: "Paid Revenue Recorded",
      value: formatPkr(report.kpis.paidRevenue),
      hint: "Paid amounts recorded on included Guest Stays.",
    },
    {
      label: "Balance Due",
      value: formatPkr(report.kpis.outstandingTotal),
      hint: "Expected revenue not yet covered by recorded payment.",
    },
    {
      label: "Expenses",
      value: formatPkr(report.kpis.totalExpenses),
      hint: "Operating spend recorded in this report period.",
    },
    {
      label: "Net Profit",
      value: formatPkr(report.kpis.netProfit),
      hint: "Paid Revenue Recorded minus recorded expenses.",
    },
    {
      label: "Booked Room Nights",
      value: String(report.kpis.bookedRoomNights),
      hint: "Stay nights clipped to this report period.",
    },
    {
      label: "Occupancy",
      value: formatPercent(report.kpis.occupancyPercentage),
      hint: "Booked room nights divided by available room nights.",
    },
    {
      label: "Average Rate / Night",
      value: formatPkr(report.kpis.averageRatePerNight),
      hint: "Expected room revenue divided by booked room nights.",
    },
  ];

  const steeringNotes = [
    {
      title: "Highest revenue unit",
      body: activeUnitRows[0]
        ? [...activeUnitRows].sort((a, b) => b.paidRevenue - a.paidRevenue)[0].label
        : "No unit revenue recorded in this period.",
    },
    {
      title: "Top booking source",
      body: activeSourceRows[0]
        ? [...activeSourceRows].sort((a, b) => b.paidRevenue - a.paidRevenue || b.bookings - a.bookings)[0].label
        : "No booking source activity in this period.",
    },
    {
      title: "Highest Balance Due risk",
      body: highestBalanceRisk
        ? `${highestBalanceRisk.guestName} - ${formatPkr(highestBalanceRisk.balanceDue)} due`
        : "No Guest Stay with Balance Due in this period.",
    },
    {
      title: "Best average rate/night",
      body: bestUnitType
        ? `${bestUnitType.label} at ${formatPkr(bestUnitType.averageRatePerNight)}`
        : "Average rate/night is not available yet.",
    },
    {
      title: "Underperforming unit to review",
      body: underperformingUnit
        ? `${underperformingUnit.label} has ${formatPkr(underperformingUnit.paidRevenue)} recorded paid revenue.`
        : "No underperforming unit is identifiable from this period.",
    },
    {
      title: "Expense watch",
      body: topExpenseCategory
        ? `${topExpenseCategory.label} is the largest expense category.`
        : "No expenses recorded in this period.",
    },
  ];

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Owner-grade reporting</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">GreenLux Business Analytics v2</h1>
            <p className="mt-2 text-sm text-slate-600">
              Reporting period: <span className="font-medium text-brand-deep">{periodLabel}</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Stays are included when their stay period overlaps this range. Revenue is allocated by overlapping room
              nights.
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
            <CardTitle>Report Mode</CardTitle>
            <CardDescription>
              Choose Daily, Weekly, Monthly, or Custom mode. The final reporting period is shown above.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-4">
              {reportModeOptions.map((option) => (
                <Button key={option.value} asChild variant={range.mode === option.value ? "default" : "outline"}>
                  <Link href={modeHref(option.value, range)}>{option.label}</Link>
                </Button>
              ))}
            </div>

            {range.mode === "daily" ? (
              <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <input type="hidden" name="mode" value="daily" />
                <div className="space-y-2">
                  <Label htmlFor="date">Daily date</Label>
                  <Input id="date" name="date" type="date" defaultValue={range.anchorDate} />
                </div>
                <Button type="submit">View day</Button>
              </form>
            ) : null}

            {range.mode === "weekly" ? (
              <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <input type="hidden" name="mode" value="weekly" />
                <div className="space-y-2">
                  <Label htmlFor="week-date">Week anchor date</Label>
                  <Input id="week-date" name="date" type="date" defaultValue={range.anchorDate} />
                </div>
                <Button type="submit">View week</Button>
              </form>
            ) : null}

            {range.mode === "monthly" ? (
              <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <input type="hidden" name="mode" value="monthly" />
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Input id="month" name="month" type="month" defaultValue={range.month} />
                </div>
                <Button type="submit">View month</Button>
              </form>
            ) : null}

            {range.mode === "custom" ? (
              <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <input type="hidden" name="mode" value="custom" />
                <div className="space-y-2">
                  <Label htmlFor="start">Custom start</Label>
                  <Input id="start" name="start" type="date" defaultValue={range.startDate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">Custom end</Label>
                  <Input id="end" name="end" type="date" defaultValue={range.endDate} />
                </div>
                <Button type="submit">Apply custom range</Button>
              </form>
            ) : null}
          </CardContent>
        </Card>

        {hasNoActivity ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">
            No bookings, expenses, or maintenance activity were found for this reporting period.
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Owner Command Summary">
          {kpiCards.map((card) => (
            <KpiCard key={card.label} {...card} />
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Strategic Steering</CardTitle>
            <CardDescription>What the owner should notice before reading the proof tables.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {steeringNotes.map((note) => (
              <div key={note.title} className="rounded-lg border border-brand-sage bg-brand-ivory p-4">
                <Badge tone="info" className="mb-2">
                  Owner note
                </Badge>
                <p className="text-sm font-semibold text-brand-deep">{note.title}</p>
                <p className="mt-1 text-sm text-slate-600">{note.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <section className="grid gap-4 xl:grid-cols-2" aria-label="Visual Breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Visual Breakdown</CardTitle>
              <CardDescription>Paid Revenue Recorded, Balance Due, booked nights, and expenses at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <BarRow
                label="Paid Revenue Recorded"
                value={report.kpis.paidRevenue}
                max={Math.max(report.kpis.paidRevenue, report.kpis.outstandingTotal, 1)}
                meta={formatPkr(report.kpis.paidRevenue)}
                tone="deep"
              />
              <BarRow
                label="Balance Due"
                value={report.kpis.outstandingTotal}
                max={Math.max(report.kpis.paidRevenue, report.kpis.outstandingTotal, 1)}
                meta={formatPkr(report.kpis.outstandingTotal)}
                tone="warning"
              />
              <div className="rounded-lg border border-brand-sage bg-white p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-brand-deep">Occupancy / Booked Nights Overview</span>
                  <span className="text-xs text-slate-500">
                    {report.kpis.bookedRoomNights} of {report.kpis.availableRoomNights} available nights
                  </span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-brand-ivory">
                  <div className="h-3 rounded-full bg-brand-fresh" style={{ width: `${percentOf(report.kpis.bookedRoomNights, report.kpis.availableRoomNights)}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatPercent(report.kpis.occupancyPercentage)} occupancy for this period.</p>
              </div>
              {activeExpenseRows.length ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-brand-deep">Expenses by Category</p>
                  {activeExpenseRows.map((row) => (
                    <BarRow
                      key={row.key}
                      label={row.label}
                      value={row.totalAmount}
                      max={maxExpenseAmount}
                      meta={formatPkr(row.totalAmount)}
                      tone="warning"
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-brand-sage bg-white p-3 text-sm text-slate-600">
                  No expenses were recorded in this period.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Map</CardTitle>
              <CardDescription>Simple bars show where money came from without adding chart dependencies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-brand-deep">Revenue by Booking Source</p>
                {activeSourceRows.length ? (
                  activeSourceRows.map((row) => (
                    <BarRow
                      key={row.key}
                      label={row.label}
                      value={row.paidRevenue}
                      max={maxSourceRevenue}
                      meta={`${formatPkr(row.paidRevenue)} recorded`}
                      tone="deep"
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No booking source revenue recorded.</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-brand-deep">Revenue by Unit Type</p>
                {activeUnitTypeRows.length ? (
                  activeUnitTypeRows.map((row) => (
                    <BarRow
                      key={row.key}
                      label={row.label}
                      value={row.paidRevenue}
                      max={maxUnitTypeRevenue}
                      meta={`${formatPkr(row.paidRevenue)} - ${formatPkr(row.averageRatePerNight)} avg/night`}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No unit type revenue recorded.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Daily Performance</CardTitle>
            <CardDescription>
              Daily booked nights, daily revenue, and daily occupancy show which days were strong, weak, or risky.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {report.dailyRows.map((row) => (
                <div key={row.date} className="grid gap-2 rounded-lg border border-brand-sage bg-white p-3 md:grid-cols-[9rem_1fr_8rem] md:items-center">
                  <div>
                    <p className="text-sm font-semibold text-brand-deep">{formatDisplayDate(row.date)}</p>
                    <p className="text-xs text-slate-500">
                      {row.arrivals} arrivals / {row.departures} departures
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-brand-ivory">
                      <div className="h-2 rounded-full bg-brand-deep" style={{ width: `${percentOf(row.expectedRevenue, maxDailyRevenue)}%` }} />
                    </div>
                    <div className="h-2 rounded-full bg-brand-ivory">
                      <div className="h-2 rounded-full bg-brand-fresh" style={{ width: `${percentOf(row.paidRevenue, maxDailyRevenue)}%` }} />
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 md:text-right">
                    <p className="font-medium text-brand-deep">{formatPkr(row.expectedRevenue)}</p>
                    <p>{formatPercent(row.occupancyPercentage)} occupancy</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-h-[520px] overflow-auto rounded-lg border border-brand-sage">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="sticky top-0 border-b border-brand-sage bg-brand-ivory text-xs uppercase tracking-[0.12em] text-brand-deep">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Booked nights</th>
                    <th className="px-4 py-3">Occupied nights</th>
                    <th className="px-4 py-3">Occupancy</th>
                    <th className="px-4 py-3">Expected revenue</th>
                    <th className="px-4 py-3">Paid Revenue Recorded</th>
                    <th className="px-4 py-3">Balance Due</th>
                    <th className="px-4 py-3">Average rate/night</th>
                    <th className="px-4 py-3">Arrivals</th>
                    <th className="px-4 py-3">Departures</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-sage/70 bg-white">
                  {report.dailyRows.map((row) => (
                    <tr key={row.date}>
                      <td className="px-4 py-3 font-medium text-brand-deep">{formatDisplayDate(row.date)}</td>
                      <td className="px-4 py-3">{row.bookedRoomNights}</td>
                      <td className="px-4 py-3">{row.occupiedNights}</td>
                      <td className="px-4 py-3">{formatPercent(row.occupancyPercentage)}</td>
                      <td className="px-4 py-3">{formatPkr(row.expectedRevenue)}</td>
                      <td className="px-4 py-3">{formatPkr(row.paidRevenue)}</td>
                      <td className="px-4 py-3">{formatPkr(row.balanceDue)}</td>
                      <td className="px-4 py-3">{formatPkr(row.averageRatePerNight)}</td>
                      <td className="px-4 py-3">{row.arrivals}</td>
                      <td className="px-4 py-3">{row.departures}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <DataTable
          title="Unit Type Performance"
          description="Comparison by unit type after room-night allocation."
          headers={["Unit type", "Bookings", "Booked nights", "Expected revenue", "Paid Revenue Recorded", "Balance Due", "Average rate/night"]}
          minWidth={920}
        >
          {activeUnitTypeRows.length ? (
            activeUnitTypeRows.map((row) => (
              <tr key={row.key} className="bg-white">
                <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
                <td className="px-4 py-3">{row.bookings}</td>
                <td className="px-4 py-3">{row.bookedRoomNights}</td>
                <td className="px-4 py-3">{formatPkr(row.expectedRevenue)}</td>
                <td className="px-4 py-3">{formatPkr(row.paidRevenue)}</td>
                <td className="px-4 py-3">{formatPkr(row.balanceDue)}</td>
                <td className="px-4 py-3">{formatPkr(row.averageRatePerNight)}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={7} message="No unit type performance in this period." />
          )}
        </DataTable>

        <DataTable
          title="Unit Performance"
          description="Each room remains its own operational and financial truth."
          headers={["Unit", "Bookings", "Booked nights", "Expected revenue", "Paid Revenue Recorded", "Balance Due", "Average rate/night"]}
          minWidth={920}
        >
          {activeUnitRows.length ? (
            activeUnitRows.map((row) => (
              <tr key={row.key} className="bg-white">
                <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
                <td className="px-4 py-3">{row.bookings}</td>
                <td className="px-4 py-3">{row.bookedRoomNights}</td>
                <td className="px-4 py-3">{formatPkr(row.expectedRevenue)}</td>
                <td className="px-4 py-3">{formatPkr(row.paidRevenue)}</td>
                <td className="px-4 py-3">{formatPkr(row.balanceDue)}</td>
                <td className="px-4 py-3">{formatPkr(row.averageRatePerNight)}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={7} message="No unit performance in this period." />
          )}
        </DataTable>

        <DataTable
          title="Booking Source Performance"
          description="Source quality by bookings, booked nights, revenue, and Balance Due."
          headers={["Booking source", "Bookings", "Booked nights", "Expected revenue", "Paid Revenue Recorded", "Balance Due", "Average rate/night"]}
          minWidth={920}
        >
          {activeSourceRows.length ? (
            activeSourceRows.map((row) => (
              <tr key={row.key} className="bg-white">
                <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
                <td className="px-4 py-3">{row.bookings}</td>
                <td className="px-4 py-3">{row.bookedRoomNights}</td>
                <td className="px-4 py-3">{formatPkr(row.expectedRevenue)}</td>
                <td className="px-4 py-3">{formatPkr(row.paidRevenue)}</td>
                <td className="px-4 py-3">{formatPkr(row.balanceDue)}</td>
                <td className="px-4 py-3">{formatPkr(row.averageRatePerNight)}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={7} message="No booking source performance in this period." />
          )}
        </DataTable>

        <DataTable
          title="Risk & Recovery"
          description="Guest Stays requiring action: Balance Due, Payment Confirmation, or cross-period review."
          headers={["Guest Stay", "Room / Suite", "Stay Period", "Booked nights in period", "Balance Due", "Crosses Period", "Payment Confirmation", "Action"]}
          minWidth={1060}
        >
          {report.attentionRows.length ? (
            report.attentionRows.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="px-4 py-3 font-medium text-brand-deep">{row.guestName}</td>
                <td className="px-4 py-3">{row.roomLabel}</td>
                <td className="px-4 py-3">{row.stayPeriod}</td>
                <td className="px-4 py-3">{row.bookedRoomNights}</td>
                <td className="px-4 py-3">{formatPkr(row.balanceDue)}</td>
                <td className="px-4 py-3">{row.crossesReportRange ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  {row.paymentConfirmationMissing ? (
                    <Badge tone="warning">Pending Team Review</Badge>
                  ) : (
                    <Badge tone="success">Confirmed</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/guest-records/${row.id}`} className="font-medium text-brand-deep underline-offset-2 hover:underline">
                    Open Guest Stay
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={8} message="No Balance Due, cross-period, or Payment Confirmation items need attention." />
          )}
        </DataTable>

        <section className="space-y-4" aria-label="Supporting Detail">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-brand-deep">Supporting Detail</h2>
            <p className="mt-1 text-sm text-slate-600">Lower-priority detail that supports the owner report.</p>
          </div>

          <section className="grid gap-4 lg:grid-cols-2">
            <DataTable
              title="Additional Charges"
              description="Included by charged date and kept separate from room rate metrics."
              headers={["Charge type", "Count", "Total", "Paid", "Unpaid"]}
              minWidth={560}
            >
              {activeChargeRows.length ? (
                activeChargeRows.map((row) => (
                  <tr key={row.key} className="bg-white">
                    <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
                    <td className="px-4 py-3">{row.count}</td>
                    <td className="px-4 py-3">{formatPkr(row.totalAmount)}</td>
                    <td className="px-4 py-3">{formatPkr(row.paidAmount)}</td>
                    <td className="px-4 py-3">{formatPkr(row.unpaidAmount)}</td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={5} message="No additional charges recorded in this period." />
              )}
            </DataTable>

            <DataTable
              title="Expense Detail"
              headers={["Expense category", "Count", "Total amount", "% of expenses"]}
              minWidth={560}
            >
              {activeExpenseRows.length ? (
                activeExpenseRows.map((row) => (
                  <tr key={row.key} className="bg-white">
                    <td className="px-4 py-3 font-medium text-brand-deep">{row.label}</td>
                    <td className="px-4 py-3">{row.count}</td>
                    <td className="px-4 py-3">{formatPkr(row.totalAmount)}</td>
                    <td className="px-4 py-3">{formatPercent(row.percentageOfTotal)}</td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={4} message="No expenses recorded in this period." />
              )}
            </DataTable>
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Summary</CardTitle>
                <CardDescription>Operational repair signals. Profit uses expenses, not maintenance log estimates.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <MiniMetric label="Open" value={String(report.maintenance.openIssues)} />
                <MiniMetric label="In progress" value={String(report.maintenance.inProgressIssues)} />
                <MiniMetric label="Resolved" value={String(report.maintenance.resolvedIssues)} />
                <MiniMetric label="Log estimate" value={formatPkr(report.maintenance.costTotal)} />
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
                <EmptyRow colSpan={3} message="No room-linked maintenance expenses recorded." />
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
            <DataTable title="Guest Stay Status" headers={["Status", "Count"]} minWidth={280}>
              <CountRows rows={report.operations.checkinStatusRows} />
            </DataTable>
            <DataTable title="Payment Status" headers={["Payment", "Count"]} minWidth={280}>
              <CountRows rows={report.operations.paymentStatusRows} />
            </DataTable>
          </section>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>How this report is calculated</CardTitle>
            <CardDescription>Definitions protect the story without crowding the top of the report.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
            <p>
              <span className="font-semibold text-brand-deep">Booked Room Nights:</span>{" "}
              {report.definitions.bookedRoomNights}
            </p>
            <p>
              <span className="font-semibold text-brand-deep">Paid Revenue Recorded:</span>{" "}
              {report.definitions.paidRevenue}
            </p>
            <p>
              <span className="font-semibold text-brand-deep">Average Rate / Night:</span> Expected room revenue divided
              by booked room nights. Additional charges are shown separately.
            </p>
            <p>
              <span className="font-semibold text-brand-deep">Daily Performance:</span> Each day is calculated from
              stay-night overlap for that day, not only from check-in dates.
            </p>
            <p>
              <span className="font-semibold text-brand-deep">Balance Due:</span> {report.definitions.balanceDue}
            </p>
            <p>
              <span className="font-semibold text-brand-deep">Multi-room bookings:</span> Lead Booking totals are
              treated as booking context only. Reports calculate revenue from individual Guest Stays to avoid
              double-counting.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

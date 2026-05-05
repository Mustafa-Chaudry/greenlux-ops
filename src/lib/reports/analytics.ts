import type { createClient } from "@/lib/supabase/server";
import {
  bookingSourceOptions,
  checkinStatusOptions,
  expenseCategoryOptions,
  formatEnumLabel,
  getBusinessTodayDate,
  getExpectedAmount,
  guestChargeOptions,
  formatUnitRoomLabel,
  paymentStatusOptions,
  purposeOptions,
} from "@/lib/check-in/options";
import type { Database } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type CheckinRow = Database["public"]["Tables"]["guest_checkins"]["Row"];
type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type ChargeRow = Database["public"]["Tables"]["guest_charges"]["Row"];
type MaintenanceRow = Database["public"]["Tables"]["room_maintenance_logs"]["Row"];
type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];

export type ReportCheckin = Pick<
  CheckinRow,
  | "id"
  | "assigned_room_id"
  | "booking_source"
  | "purpose_of_visit"
  | "payment_status"
  | "status"
  | "has_stayed_before"
  | "agreed_room_rate_pkr"
  | "total_expected_amount_pkr"
  | "amount_paid_pkr"
>;

export type ReportExpense = Pick<ExpenseRow, "id" | "category" | "amount_pkr" | "related_room_id">;
export type ReportCharge = Pick<ChargeRow, "id" | "guest_checkin_id" | "charge_type" | "total_amount_pkr" | "is_paid">;
export type ReportMaintenanceLog = Pick<MaintenanceRow, "id" | "room_id" | "status" | "cost_pkr">;
export type ReportRoom = Pick<RoomRow, "id" | "unit_number" | "name" | "type">;

export type ReportDateRangePreset = "this_month" | "last_month" | "last_7_days" | "last_30_days" | "custom";

export type ReportDateRange = {
  preset: ReportDateRangePreset;
  startDate: string;
  endDate: string;
  label: string;
};

type MoneyRow = {
  key: string;
  label: string;
  bookings: number;
  expectedRevenue: number;
  paidRevenue: number;
  outstandingBalance: number;
};

type ChargeSummary = {
  total: number;
  paid: number;
};

export const reportPresetOptions: Array<{ value: ReportDateRangePreset; label: string }> = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
];

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(value: string) {
  if (!isoDatePattern.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatIsoDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthEnd(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function formatDateLabel(startDate: string, endDate: string) {
  return `${startDate} to ${endDate}`;
}

export function getReportDateRange(params: { range?: string; start?: string; end?: string }): ReportDateRange {
  const today = parseIsoDate(getBusinessTodayDate()) ?? new Date();
  const requestedPreset = reportPresetOptions.some((option) => option.value === params.range) ? params.range : "this_month";

  if (params.range === "custom") {
    const start = params.start ? parseIsoDate(params.start) : null;
    const end = params.end ? parseIsoDate(params.end) : null;

    if (start && end && start <= end) {
      const startDate = formatIsoDate(start);
      const endDate = formatIsoDate(end);
      return { preset: "custom", startDate, endDate, label: formatDateLabel(startDate, endDate) };
    }
  }

  if (requestedPreset === "last_month") {
    const previousMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
    const startDate = formatIsoDate(monthStart(previousMonth));
    const endDate = formatIsoDate(monthEnd(previousMonth));
    return { preset: "last_month", startDate, endDate, label: "Last month" };
  }

  if (requestedPreset === "last_7_days") {
    const startDate = formatIsoDate(addDays(today, -6));
    const endDate = formatIsoDate(today);
    return { preset: "last_7_days", startDate, endDate, label: "Last 7 days" };
  }

  if (requestedPreset === "last_30_days") {
    const startDate = formatIsoDate(addDays(today, -29));
    const endDate = formatIsoDate(today);
    return { preset: "last_30_days", startDate, endDate, label: "Last 30 days" };
  }

  const startDate = formatIsoDate(monthStart(today));
  const endDate = formatIsoDate(today);
  return { preset: "this_month", startDate, endDate, label: "This month" };
}

export function percent(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return (part / total) * 100;
}

export function formatPercent(value: number) {
  return `${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 1 }).format(value)}%`;
}

function paidRevenue(checkin: ReportCheckin) {
  const paid = checkin.amount_paid_pkr ?? 0;

  if (checkin.payment_status === "paid" || checkin.payment_status === "partial" || paid > 0) {
    return paid;
  }

  return 0;
}

function expectedRevenue(checkin: ReportCheckin) {
  return getExpectedAmount(checkin) ?? 0;
}

function makeChargeSummary(): ChargeSummary {
  return { total: 0, paid: 0 };
}

function buildChargeSummaryByCheckin(charges: ReportCharge[]) {
  const summaries = new Map<string, ChargeSummary>();

  charges.forEach((charge) => {
    const summary = summaries.get(charge.guest_checkin_id) ?? makeChargeSummary();
    summary.total += charge.total_amount_pkr;

    if (charge.is_paid) {
      summary.paid += charge.total_amount_pkr;
    }

    summaries.set(charge.guest_checkin_id, summary);
  });

  return summaries;
}

function checkinExpectedWithCharges(checkin: ReportCheckin, charges: ChargeSummary) {
  return expectedRevenue(checkin) + charges.total;
}

function checkinPaidWithCharges(checkin: ReportCheckin, charges: ChargeSummary) {
  return paidRevenue(checkin) + charges.paid;
}

function checkinOutstandingWithCharges(checkin: ReportCheckin, charges: ChargeSummary) {
  return Math.max(checkinExpectedWithCharges(checkin, charges) - checkinPaidWithCharges(checkin, charges), 0);
}

function makeMoneyRow(key: string, label: string): MoneyRow {
  return {
    key,
    label,
    bookings: 0,
    expectedRevenue: 0,
    paidRevenue: 0,
    outstandingBalance: 0,
  };
}

function addCheckinToMoneyRow(row: MoneyRow, checkin: ReportCheckin, charges: ChargeSummary) {
  row.bookings += 1;
  row.expectedRevenue += checkinExpectedWithCharges(checkin, charges);
  row.paidRevenue += checkinPaidWithCharges(checkin, charges);
  row.outstandingBalance += checkinOutstandingWithCharges(checkin, charges);
}

export async function fetchReportInputs(supabase: SupabaseServerClient, range: ReportDateRange) {
  const [checkinsResult, expensesResult, maintenanceResult, roomsResult] = await Promise.all([
    supabase
      .from("guest_checkins")
      .select(
        "id,assigned_room_id,booking_source,purpose_of_visit,payment_status,status,has_stayed_before,agreed_room_rate_pkr,total_expected_amount_pkr,amount_paid_pkr",
      )
      .gte("check_in_date", range.startDate)
      .lte("check_in_date", range.endDate),
    supabase
      .from("expenses")
      .select("id,category,amount_pkr,related_room_id")
      .gte("expense_date", range.startDate)
      .lte("expense_date", range.endDate),
    supabase
      .from("room_maintenance_logs")
      .select("id,room_id,status,cost_pkr")
      .gte("reported_date", range.startDate)
      .lte("reported_date", range.endDate),
    supabase.from("rooms").select("id,unit_number,name,type").order("unit_number", { nullsFirst: false }),
  ]);
  const checkinIds = (checkinsResult.data ?? []).map((checkin) => checkin.id);
  const chargesResult = checkinIds.length
    ? await supabase
        .from("guest_charges")
        .select("id,guest_checkin_id,charge_type,total_amount_pkr,is_paid")
        .in("guest_checkin_id", checkinIds)
    : { data: [], error: null };

  return {
    checkins: (checkinsResult.data ?? []) as ReportCheckin[],
    expenses: (expensesResult.data ?? []) as ReportExpense[],
    guestCharges: (chargesResult.data ?? []) as ReportCharge[],
    maintenanceLogs: (maintenanceResult.data ?? []) as ReportMaintenanceLog[],
    rooms: (roomsResult.data ?? []) as ReportRoom[],
    errors: [checkinsResult.error, expensesResult.error, chargesResult.error, maintenanceResult.error, roomsResult.error]
      .filter((error): error is NonNullable<typeof error> => Boolean(error))
      .map((error) => error.message),
  };
}

export function buildBusinessReport({
  checkins,
  expenses,
  guestCharges,
  maintenanceLogs,
  rooms,
}: {
  checkins: ReportCheckin[];
  expenses: ReportExpense[];
  guestCharges: ReportCharge[];
  maintenanceLogs: ReportMaintenanceLog[];
  rooms: ReportRoom[];
}) {
  const roomLabels = new Map(rooms.map((room) => [room.id, formatUnitRoomLabel(room)]));
  const roomTypes = new Map(rooms.map((room) => [room.id, room.type]));
  const chargeSummaryByCheckin = buildChargeSummaryByCheckin(guestCharges);
  const getCheckinCharges = (checkin: ReportCheckin) => chargeSummaryByCheckin.get(checkin.id) ?? makeChargeSummary();
  const basePaidRevenue = checkins.reduce((sum, checkin) => sum + paidRevenue(checkin), 0);
  const baseExpectedRevenue = checkins.reduce((sum, checkin) => sum + expectedRevenue(checkin), 0);
  const guestChargesTotal = guestCharges.reduce((sum, charge) => sum + charge.total_amount_pkr, 0);
  const paidGuestCharges = guestCharges.reduce((sum, charge) => sum + (charge.is_paid ? charge.total_amount_pkr : 0), 0);
  const unpaidGuestCharges = Math.max(guestChargesTotal - paidGuestCharges, 0);
  const totalRevenue = basePaidRevenue + paidGuestCharges;
  const expectedTotal = baseExpectedRevenue + guestChargesTotal;
  const outstandingTotal = Math.max(expectedTotal - totalRevenue, 0);
  // Financial source of truth: net profit subtracts only rows from expenses.
  // room_maintenance_logs.cost_pkr is operational tracking and must not be double-counted as cash spend.
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount_pkr, 0);
  const directBookingRevenue = checkins
    .filter((checkin) => checkin.booking_source === "direct_whatsapp_call")
    .reduce((sum, checkin) => sum + checkinPaidWithCharges(checkin, getCheckinCharges(checkin)), 0);
  const platformBookingRevenue = checkins
    .filter((checkin) => checkin.booking_source === "booking_com" || checkin.booking_source === "airbnb")
    .reduce((sum, checkin) => sum + checkinPaidWithCharges(checkin, getCheckinCharges(checkin)), 0);

  const bookingSourceRows = bookingSourceOptions.map((option) => makeMoneyRow(option.value, option.label));
  const bookingSourceMap = new Map(bookingSourceRows.map((row) => [row.key, row]));
  checkins.forEach((checkin) => {
    const row = bookingSourceMap.get(checkin.booking_source) ?? makeMoneyRow(checkin.booking_source, formatEnumLabel(checkin.booking_source));
    addCheckinToMoneyRow(row, checkin, getCheckinCharges(checkin));

    if (!bookingSourceMap.has(checkin.booking_source)) {
      bookingSourceMap.set(checkin.booking_source, row);
      bookingSourceRows.push(row);
    }
  });

  const roomRows = rooms.map((room) => ({
    ...makeMoneyRow(room.id, formatUnitRoomLabel(room)),
    activeStays: 0,
    averagePaidPerBooking: 0,
  }));
  const roomMap = new Map(roomRows.map((row) => [row.key, row]));
  const unassignedRoomRow = {
    ...makeMoneyRow("unassigned", "Unassigned"),
    activeStays: 0,
    averagePaidPerBooking: 0,
  };
  checkins.forEach((checkin) => {
    const key = checkin.assigned_room_id ?? "unassigned";
    let row = key === "unassigned" ? unassignedRoomRow : roomMap.get(key);

    if (!row) {
      row = {
        ...makeMoneyRow(key, roomLabels.get(key) ?? "Assigned unit"),
        activeStays: 0,
        averagePaidPerBooking: 0,
      };
      roomMap.set(key, row);
      roomRows.push(row);
    }

    addCheckinToMoneyRow(row, checkin, getCheckinCharges(checkin));

    if (checkin.status === "checked_in") {
      row.activeStays += 1;
    }
  });

  if (unassignedRoomRow.bookings > 0) {
    roomRows.push(unassignedRoomRow);
  }

  roomRows.forEach((row) => {
    row.averagePaidPerBooking = row.bookings > 0 ? row.paidRevenue / row.bookings : 0;
  });

  const categoryRows: Array<MoneyRow & { activeStays: number; averagePaidPerBooking: number }> = [];
  const categoryMap = new Map<string, MoneyRow & { activeStays: number; averagePaidPerBooking: number }>();
  checkins.forEach((checkin) => {
    const key = checkin.assigned_room_id ? roomTypes.get(checkin.assigned_room_id) ?? "assigned_unit" : "unassigned";
    let row = categoryMap.get(key);

    if (!row) {
      row = {
        ...makeMoneyRow(key, key === "unassigned" ? "Unassigned" : formatEnumLabel(key)),
        activeStays: 0,
        averagePaidPerBooking: 0,
      };
      categoryMap.set(key, row);
      categoryRows.push(row);
    }

    addCheckinToMoneyRow(row, checkin, getCheckinCharges(checkin));

    if (checkin.status === "checked_in") {
      row.activeStays += 1;
    }
  });
  categoryRows.forEach((row) => {
    row.averagePaidPerBooking = row.bookings > 0 ? row.paidRevenue / row.bookings : 0;
  });

  const expenseRows = expenseCategoryOptions.map((option) => ({
    key: option.value,
    label: option.label,
    count: 0,
    totalAmount: 0,
    percentageOfTotal: 0,
  }));
  const expenseMap = new Map(expenseRows.map((row) => [row.key, row]));
  expenses.forEach((expense) => {
    const row =
      expenseMap.get(expense.category) ??
      {
        key: expense.category,
        label: formatEnumLabel(expense.category),
        count: 0,
        totalAmount: 0,
        percentageOfTotal: 0,
      };

    row.count += 1;
    row.totalAmount += expense.amount_pkr;

    if (!expenseMap.has(expense.category)) {
      expenseMap.set(expense.category, row);
      expenseRows.push(row);
    }
  });
  expenseRows.forEach((row) => {
    row.percentageOfTotal = percent(row.totalAmount, totalExpenses);
  });

  const chargeRows: Array<{
    key: string;
    label: string;
    count: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
  }> = guestChargeOptions.map((option) => ({
    key: option.value,
    label: option.label,
    count: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
  }));
  const chargeMap = new Map(chargeRows.map((row) => [row.key, row]));
  guestCharges.forEach((charge) => {
    const row =
      chargeMap.get(charge.charge_type) ??
      {
        key: charge.charge_type,
        label: formatEnumLabel(charge.charge_type),
        count: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
      };

    row.count += 1;
    row.totalAmount += charge.total_amount_pkr;

    if (charge.is_paid) {
      row.paidAmount += charge.total_amount_pkr;
    } else {
      row.unpaidAmount += charge.total_amount_pkr;
    }

    if (!chargeMap.has(charge.charge_type)) {
      chargeMap.set(charge.charge_type, row);
      chargeRows.push(row);
    }
  });

  const maintenanceCostByRoom = new Map<string, { key: string; label: string; totalCost: number; issueCount: number }>();
  maintenanceLogs.forEach((log) => {
    const row =
      maintenanceCostByRoom.get(log.room_id) ??
      {
        key: log.room_id,
        label: roomLabels.get(log.room_id) ?? "Assigned unit",
        totalCost: 0,
        issueCount: 0,
      };

    row.issueCount += 1;
    row.totalCost += log.cost_pkr ?? 0;
    maintenanceCostByRoom.set(log.room_id, row);
  });
  const maintenanceExpenseTotal = expenses
    .filter((expense) => expense.category === "maintenance" || expense.category === "repairs")
    .reduce((sum, expense) => sum + expense.amount_pkr, 0);
  const maintenanceExpenseByRoom = new Map<string, { key: string; label: string; totalCost: number; expenseCount: number }>();
  expenses
    .filter((expense) => (expense.category === "maintenance" || expense.category === "repairs") && expense.related_room_id)
    .forEach((expense) => {
      const roomId = expense.related_room_id as string;
      const row =
        maintenanceExpenseByRoom.get(roomId) ??
        {
          key: roomId,
          label: roomLabels.get(roomId) ?? "Assigned unit",
          totalCost: 0,
          expenseCount: 0,
        };

      row.expenseCount += 1;
      row.totalCost += expense.amount_pkr;
      maintenanceExpenseByRoom.set(roomId, row);
    });

  const repeatGuestRows = [
    { key: "new", label: "New guests", count: checkins.filter((checkin) => !checkin.has_stayed_before).length },
    { key: "repeat", label: "Repeat guests", count: checkins.filter((checkin) => checkin.has_stayed_before).length },
  ];

  const purposeRows = purposeOptions.map((option) => ({
    key: option.value,
    label: option.label,
    count: checkins.filter((checkin) => checkin.purpose_of_visit === option.value).length,
  }));

  const checkinStatusRows = checkinStatusOptions.map((option) => ({
    key: option.value,
    label: option.label,
    count: checkins.filter((checkin) => checkin.status === option.value).length,
  }));

  const paymentStatusRows = paymentStatusOptions.map((option) => ({
    key: option.value,
    label: option.label,
    count: checkins.filter((checkin) => checkin.payment_status === option.value).length,
  }));

  const highestRevenueUnit = roomRows
    .filter((row) => row.paidRevenue > 0)
    .sort((a, b) => b.paidRevenue - a.paidRevenue)[0];
  const topBookingSource = bookingSourceRows
    .filter((row) => row.paidRevenue > 0 || row.bookings > 0)
    .sort((a, b) => b.paidRevenue - a.paidRevenue || b.bookings - a.bookings)[0];
  const largestExpenseCategory = expenseRows
    .filter((row) => row.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)[0];
  const directRevenueShare = percent(directBookingRevenue, totalRevenue);

  return {
    kpis: {
      totalRevenue,
      expectedTotal,
      basePaidRevenue,
      baseExpectedRevenue,
      guestChargesTotal,
      paidGuestCharges,
      unpaidGuestCharges,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      outstandingTotal,
      totalBookings: checkins.length,
      activeStays: checkins.filter((checkin) => checkin.status === "checked_in").length,
      directBookingRevenue,
      platformBookingRevenue,
    },
    bookingSourceRows,
    roomRows,
    categoryRows,
    expenseRows,
    chargeRows,
    maintenance: {
      openIssues: maintenanceLogs.filter((log) => log.status === "reported").length,
      inProgressIssues: maintenanceLogs.filter((log) => log.status === "in_progress").length,
      resolvedIssues: maintenanceLogs.filter((log) => log.status === "resolved").length,
      recordedExpenseTotal: maintenanceExpenseTotal,
      // Operational estimate/repair tracking only. Actual profit/loss impact comes from expenses.
      costTotal: maintenanceLogs.reduce((sum, log) => sum + (log.cost_pkr ?? 0), 0),
      costByRoomRows: Array.from(maintenanceCostByRoom.values()).sort((a, b) => b.totalCost - a.totalCost),
      expenseByRoomRows: Array.from(maintenanceExpenseByRoom.values()).sort((a, b) => b.totalCost - a.totalCost),
    },
    operations: {
      repeatGuestRows,
      purposeRows,
      checkinStatusRows,
      paymentStatusRows,
    },
    insights: [
      highestRevenueUnit
        ? `Highest revenue unit: ${highestRevenueUnit.label} (${highestRevenueUnit.bookings} bookings).`
        : "Highest revenue unit: no paid unit revenue in this range.",
      topBookingSource
        ? `Top booking source: ${topBookingSource.label} (${topBookingSource.bookings} bookings).`
        : "Top booking source: no bookings in this range.",
      largestExpenseCategory
        ? `Largest expense category: ${largestExpenseCategory.label}.`
        : "Largest expense category: no expenses recorded in this range.",
      `Outstanding balance: PKR ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(outstandingTotal)}.`,
      `Direct bookings account for ${formatPercent(directRevenueShare)} of paid revenue.`,
    ],
  };
}

function csvEscape(value: string | number | boolean | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function createBusinessReportCsv({
  report,
  range,
}: {
  report: ReturnType<typeof buildBusinessReport>;
  range: ReportDateRange;
}) {
  const rows: Array<Array<string | number>> = [
    ["GreenLux Residency Business Report"],
    ["Date range", range.startDate, range.endDate, range.label],
    [],
    ["KPI", "Value"],
    ["Total Revenue", report.kpis.totalRevenue],
    ["Base Stay Paid Revenue", report.kpis.basePaidRevenue],
    ["Paid Guest Charges", report.kpis.paidGuestCharges],
    ["Total Expected Revenue", report.kpis.expectedTotal],
    ["Guest Charges Total", report.kpis.guestChargesTotal],
    ["Unpaid Guest Charges", report.kpis.unpaidGuestCharges],
    ["Total Expenses", report.kpis.totalExpenses],
    ["Net Profit", report.kpis.netProfit],
    ["Outstanding Balance", report.kpis.outstandingTotal],
    ["Total Bookings", report.kpis.totalBookings],
    ["Active Stays", report.kpis.activeStays],
    ["Direct Booking Revenue", report.kpis.directBookingRevenue],
    ["Platform Booking Revenue", report.kpis.platformBookingRevenue],
    [],
    ["Booking Source Breakdown"],
    ["Booking source", "Bookings", "Expected revenue", "Paid revenue", "Outstanding balance"],
    ...report.bookingSourceRows.map((row) => [row.label, row.bookings, row.expectedRevenue, row.paidRevenue, row.outstandingBalance]),
    [],
    ["Unit Performance"],
    ["Unit", "Bookings", "Expected revenue", "Paid revenue", "Outstanding balance", "Average paid per booking", "Active stays"],
    ...report.roomRows.map((row) => [
      row.label,
      row.bookings,
      row.expectedRevenue,
      row.paidRevenue,
      row.outstandingBalance,
      row.averagePaidPerBooking,
      row.activeStays,
    ]),
    [],
    ["Category Summary"],
    ["Category", "Bookings", "Expected revenue", "Paid revenue", "Outstanding balance", "Average paid per booking", "Active stays"],
    ...report.categoryRows.map((row) => [
      row.label,
      row.bookings,
      row.expectedRevenue,
      row.paidRevenue,
      row.outstandingBalance,
      row.averagePaidPerBooking,
      row.activeStays,
    ]),
    [],
    ["Expense Breakdown"],
    ["Expense category", "Count", "Total amount", "Percent of expenses"],
    ...report.expenseRows.map((row) => [row.label, row.count, row.totalAmount, formatPercent(row.percentageOfTotal)]),
    [],
    ["Guest Charges Breakdown"],
    ["Charge type", "Count", "Total amount", "Paid amount", "Unpaid amount"],
    ...report.chargeRows.map((row) => [row.label, row.count, row.totalAmount, row.paidAmount, row.unpaidAmount]),
    [],
    ["Maintenance Expenses by Unit"],
    ["Unit", "Expense entries", "Recorded expenses"],
    ...report.maintenance.expenseByRoomRows.map((row) => [row.label, row.expenseCount, row.totalCost]),
  ];

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

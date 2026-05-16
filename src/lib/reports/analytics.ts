import type { createClient } from "@/lib/supabase/server";
import {
  bookingSourceOptions,
  checkinStatusOptions,
  expenseCategoryOptions,
  formatEnumLabel,
  formatUnitRoomLabel,
  getBusinessTodayDate,
  getExpectedAmount,
  guestChargeOptions,
  paymentStatusOptions,
  purposeOptions,
} from "@/lib/check-in/options";
import {
  addReportDays,
  allocateAmountByNights,
  formatReportDate,
  getReportRangeNights,
  getStayOverlapAllocation,
  parseReportDate,
  type NightlyAllocation,
} from "@/lib/reports/nightly-allocation";
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
  | "full_name"
  | "assigned_room_id"
  | "booking_source"
  | "purpose_of_visit"
  | "payment_status"
  | "status"
  | "has_stayed_before"
  | "agreed_room_rate_pkr"
  | "total_expected_amount_pkr"
  | "amount_paid_pkr"
  | "check_in_date"
  | "check_out_date"
  | "payment_verified"
  | "cnic_verified"
  | "booking_group_id"
>;

export type ReportExpense = Pick<ExpenseRow, "id" | "category" | "amount_pkr" | "related_room_id">;
export type ReportCharge = Pick<ChargeRow, "id" | "guest_checkin_id" | "charge_type" | "total_amount_pkr" | "is_paid" | "charged_at">;
export type ReportMaintenanceLog = Pick<MaintenanceRow, "id" | "room_id" | "status" | "cost_pkr">;
export type ReportRoom = Pick<RoomRow, "id" | "unit_number" | "name" | "type" | "status">;

export type ReportMode = "daily" | "weekly" | "monthly" | "custom";
export type ReportDateRangePreset =
  | ReportMode
  | "this_month"
  | "last_month"
  | "last_7_days"
  | "last_30_days";

export type ReportDateRange = {
  preset: ReportDateRangePreset;
  mode?: ReportMode;
  startDate: string;
  endDate: string;
  label: string;
  anchorDate?: string;
  month?: string;
};

type ChargeSummary = {
  total: number;
  paid: number;
};

type AllocatedStay = {
  checkin: ReportCheckin;
  allocation: NightlyAllocation;
  roomExpectedRevenue: number;
  roomPaidRevenue: number;
  additionalCharges: number;
  paidAdditionalCharges: number;
  expectedRevenue: number;
  paidRevenue: number;
  balanceDue: number;
  fullStayBalanceDue: number;
  ratePerNight: number | null;
  roomLabel: string;
  unitType: string;
  isOccupiedStatus: boolean;
};

type PerformanceRow = {
  key: string;
  label: string;
  bookings: number;
  bookedRoomNights: number;
  occupiedNights: number;
  expectedRevenue: number;
  paidRevenue: number;
  additionalCharges: number;
  paidAdditionalCharges: number;
  balanceDue: number;
  averageRatePerNight: number;
  paidAverageRatePerNight: number;
};

type DailyPerformanceRow = {
  date: string;
  bookedRoomNights: number;
  occupiedNights: number;
  occupancyPercentage: number;
  expectedRevenue: number;
  paidRevenue: number;
  balanceDue: number;
  averageRatePerNight: number;
  arrivals: number;
  departures: number;
};

export const reportModeOptions: Array<{ value: ReportMode; label: string }> = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

export const reportPresetOptions: Array<{ value: ReportDateRangePreset; label: string }> = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
];

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthEnd(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function formatDateLabel(startDate: string, endDate: string) {
  return `${startDate} to ${endDate}`;
}

function monthValue(date: Date) {
  return formatReportDate(date).slice(0, 7);
}

function dateRange({
  preset,
  mode,
  startDate,
  endDate,
  label,
  anchorDate = startDate,
  month = startDate.slice(0, 7),
}: {
  preset: ReportDateRangePreset;
  mode: ReportMode;
  startDate: string;
  endDate: string;
  label: string;
  anchorDate?: string;
  month?: string;
}): ReportDateRange {
  return { preset, mode, startDate, endDate, label, anchorDate, month };
}

function weekStart(date: Date) {
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addReportDays(date, mondayOffset);
}

function monthFromValue(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  return parseReportDate(`${value}-01`);
}

export function getReportDateRange(params: { mode?: string; range?: string; date?: string; month?: string; start?: string; end?: string }): ReportDateRange {
  const today = parseReportDate(getBusinessTodayDate()) ?? new Date();
  const todayDate = formatReportDate(today);
  const requestedMode = reportModeOptions.some((option) => option.value === params.mode) ? (params.mode as ReportMode) : null;

  if (requestedMode === "daily") {
    const date = parseReportDate(params.date ?? params.start) ?? today;
    const reportDate = formatReportDate(date);
    return dateRange({
      preset: "daily",
      mode: "daily",
      startDate: reportDate,
      endDate: reportDate,
      label: reportDate,
      anchorDate: reportDate,
      month: reportDate.slice(0, 7),
    });
  }

  if (requestedMode === "weekly") {
    const anchor = parseReportDate(params.date ?? params.start) ?? today;
    const start = weekStart(anchor);
    const startDate = formatReportDate(start);
    const endDate = formatReportDate(addReportDays(start, 6));
    const anchorDate = formatReportDate(anchor);
    return dateRange({
      preset: "weekly",
      mode: "weekly",
      startDate,
      endDate,
      label: `Week of ${startDate}`,
      anchorDate,
      month: startDate.slice(0, 7),
    });
  }

  if (requestedMode === "monthly") {
    const monthDate = monthFromValue(params.month) ?? parseReportDate(params.date) ?? today;
    const startDate = formatReportDate(monthStart(monthDate));
    const endDate = formatReportDate(monthEnd(monthDate));
    return dateRange({
      preset: "monthly",
      mode: "monthly",
      startDate,
      endDate,
      label: monthValue(monthDate),
      anchorDate: startDate,
      month: monthValue(monthDate),
    });
  }

  if (requestedMode === "custom" || params.range === "custom") {
    const start = params.start ? parseReportDate(params.start) : null;
    const end = params.end ? parseReportDate(params.end) : null;

    if (start && end && start <= end) {
      const startDate = formatReportDate(start);
      const endDate = formatReportDate(end);
      return dateRange({
        preset: "custom",
        mode: "custom",
        startDate,
        endDate,
        label: formatDateLabel(startDate, endDate),
        anchorDate: startDate,
        month: startDate.slice(0, 7),
      });
    }
  }

  const requestedPreset = reportPresetOptions.some((option) => option.value === params.range) ? params.range : "this_month";

  if (requestedPreset === "last_month") {
    const previousMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
    const startDate = formatReportDate(monthStart(previousMonth));
    const endDate = formatReportDate(monthEnd(previousMonth));
    return dateRange({
      preset: "last_month",
      mode: "monthly",
      startDate,
      endDate,
      label: "Last month",
      anchorDate: startDate,
      month: monthValue(previousMonth),
    });
  }

  if (requestedPreset === "last_7_days") {
    const startDate = formatReportDate(addReportDays(today, -6));
    return dateRange({
      preset: "last_7_days",
      mode: "custom",
      startDate,
      endDate: todayDate,
      label: "Last 7 days",
      anchorDate: todayDate,
      month: startDate.slice(0, 7),
    });
  }

  if (requestedPreset === "last_30_days") {
    const startDate = formatReportDate(addReportDays(today, -29));
    return dateRange({
      preset: "last_30_days",
      mode: "custom",
      startDate,
      endDate: todayDate,
      label: "Last 30 days",
      anchorDate: todayDate,
      month: startDate.slice(0, 7),
    });
  }

  const startDate = formatReportDate(monthStart(today));
  const endDate = formatReportDate(monthEnd(today));
  return dateRange({
    preset: "this_month",
    mode: "monthly",
    startDate,
    endDate,
    label: "This month",
    anchorDate: todayDate,
    month: monthValue(today),
  });
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

function chargeInRange(charge: ReportCharge, range: ReportDateRange) {
  const chargedDate = charge.charged_at.slice(0, 10);
  return chargedDate >= range.startDate && chargedDate <= range.endDate;
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

function makePerformanceRow(key: string, label: string): PerformanceRow {
  return {
    key,
    label,
    bookings: 0,
    bookedRoomNights: 0,
    occupiedNights: 0,
    expectedRevenue: 0,
    paidRevenue: 0,
    additionalCharges: 0,
    paidAdditionalCharges: 0,
    balanceDue: 0,
    averageRatePerNight: 0,
    paidAverageRatePerNight: 0,
  };
}

function addAllocatedStayToPerformanceRow(row: PerformanceRow, stay: AllocatedStay) {
  row.bookings += 1;
  row.bookedRoomNights += stay.allocation.overlappingNights;
  row.occupiedNights += stay.isOccupiedStatus ? stay.allocation.overlappingNights : 0;
  row.expectedRevenue += stay.expectedRevenue;
  row.paidRevenue += stay.paidRevenue;
  row.additionalCharges += stay.additionalCharges;
  row.paidAdditionalCharges += stay.paidAdditionalCharges;
  row.balanceDue += stay.balanceDue;
}

function finalizePerformanceRow(row: PerformanceRow) {
  const expectedRoomRevenue = Math.max(row.expectedRevenue - row.additionalCharges, 0);
  const paidRoomRevenue = Math.max(row.paidRevenue - row.paidAdditionalCharges, 0);

  row.averageRatePerNight = row.bookedRoomNights > 0 ? Math.round(expectedRoomRevenue / row.bookedRoomNights) : 0;
  row.paidAverageRatePerNight = row.bookedRoomNights > 0 ? Math.round(paidRoomRevenue / row.bookedRoomNights) : 0;
  return row;
}

function fullStayBalanceDue(checkin: ReportCheckin, charges: ChargeSummary) {
  return Math.max(expectedRevenue(checkin) + charges.total - paidRevenue(checkin) - charges.paid, 0);
}

function reportDateList(startDate: string, endDate: string) {
  const start = parseReportDate(startDate);
  const end = parseReportDate(endDate);

  if (!start || !end || start > end) {
    return [];
  }

  const dates: string[] = [];
  let cursor = start;

  while (cursor <= end) {
    dates.push(formatReportDate(cursor));
    cursor = addReportDays(cursor, 1);
  }

  return dates;
}

export async function fetchReportInputs(supabase: SupabaseServerClient, range: ReportDateRange) {
  const [checkinsResult, expensesResult, maintenanceResult, roomsResult] = await Promise.all([
    supabase
      .from("guest_checkins")
      .select(
        "id,full_name,assigned_room_id,booking_source,purpose_of_visit,payment_status,status,has_stayed_before,agreed_room_rate_pkr,total_expected_amount_pkr,amount_paid_pkr,check_in_date,check_out_date,payment_verified,cnic_verified,booking_group_id",
      )
      .lte("check_in_date", range.endDate)
      .gt("check_out_date", range.startDate),
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
    supabase.from("rooms").select("id,unit_number,name,type,status").order("unit_number", { nullsFirst: false }),
  ]);
  const checkinIds = (checkinsResult.data ?? []).map((checkin) => checkin.id);
  const chargesResult = checkinIds.length
    ? await supabase
        .from("guest_charges")
        .select("id,guest_checkin_id,charge_type,total_amount_pkr,is_paid,charged_at")
        .in("guest_checkin_id", checkinIds)
    : { data: [], error: null };

  return {
    range,
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
  range,
  checkins,
  expenses,
  guestCharges,
  maintenanceLogs,
  rooms,
}: {
  range: ReportDateRange;
  checkins: ReportCheckin[];
  expenses: ReportExpense[];
  guestCharges: ReportCharge[];
  maintenanceLogs: ReportMaintenanceLog[];
  rooms: ReportRoom[];
}) {
  const roomLabels = new Map(rooms.map((room) => [room.id, formatUnitRoomLabel(room)]));
  const roomTypes = new Map(rooms.map((room) => [room.id, room.type]));
  const inRangeCharges = guestCharges.filter((charge) => chargeInRange(charge, range));
  const allChargesByCheckin = buildChargeSummaryByCheckin(guestCharges);
  const inRangeChargesByCheckin = buildChargeSummaryByCheckin(inRangeCharges);
  const allocatedStays = checkins
    .map((checkin): AllocatedStay => {
      const allocation = getStayOverlapAllocation({
        checkInDate: checkin.check_in_date,
        checkOutDate: checkin.check_out_date,
        rangeStartDate: range.startDate,
        rangeEndDate: range.endDate,
      });
      const periodCharges = inRangeChargesByCheckin.get(checkin.id) ?? makeChargeSummary();
      const allCharges = allChargesByCheckin.get(checkin.id) ?? makeChargeSummary();
      const roomExpectedRevenue = allocateAmountByNights(expectedRevenue(checkin), allocation);
      const roomPaidRevenue = allocateAmountByNights(paidRevenue(checkin), allocation);
      const expectedWithCharges = roomExpectedRevenue + periodCharges.total;
      const paidWithCharges = roomPaidRevenue + periodCharges.paid;
      const assignedRoomType = checkin.assigned_room_id ? roomTypes.get(checkin.assigned_room_id) ?? "assigned_unit" : "unassigned";

      return {
        checkin,
        allocation,
        roomExpectedRevenue,
        roomPaidRevenue,
        additionalCharges: periodCharges.total,
        paidAdditionalCharges: periodCharges.paid,
        expectedRevenue: expectedWithCharges,
        paidRevenue: paidWithCharges,
        balanceDue: Math.max(expectedWithCharges - paidWithCharges, 0),
        fullStayBalanceDue: fullStayBalanceDue(checkin, allCharges),
        ratePerNight: allocation.overlappingNights > 0 ? Math.round(roomExpectedRevenue / allocation.overlappingNights) : null,
        roomLabel: checkin.assigned_room_id ? roomLabels.get(checkin.assigned_room_id) ?? "Assigned unit" : "Unassigned",
        unitType: assignedRoomType,
        isOccupiedStatus: checkin.status === "checked_in" || checkin.status === "checked_out",
      };
    })
    .filter((stay) => stay.allocation.overlappingNights > 0);
  const totalAvailableUnits = rooms.filter((room) => room.status === "active").length || rooms.length;
  const reportRangeNights = getReportRangeNights(range.startDate, range.endDate);
  const availableRoomNights = totalAvailableUnits * reportRangeNights;
  const bookedRoomNights = allocatedStays.reduce((sum, stay) => sum + stay.allocation.overlappingNights, 0);
  const occupiedNights = allocatedStays.reduce((sum, stay) => sum + (stay.isOccupiedStatus ? stay.allocation.overlappingNights : 0), 0);
  const expectedRoomRevenue = allocatedStays.reduce((sum, stay) => sum + stay.roomExpectedRevenue, 0);
  const paidRoomRevenue = allocatedStays.reduce((sum, stay) => sum + stay.roomPaidRevenue, 0);
  const guestChargesTotal = inRangeCharges.reduce((sum, charge) => sum + charge.total_amount_pkr, 0);
  const paidGuestCharges = inRangeCharges.reduce((sum, charge) => sum + (charge.is_paid ? charge.total_amount_pkr : 0), 0);
  const unpaidGuestCharges = Math.max(guestChargesTotal - paidGuestCharges, 0);
  const expectedTotal = allocatedStays.reduce((sum, stay) => sum + stay.expectedRevenue, 0);
  const totalRevenue = allocatedStays.reduce((sum, stay) => sum + stay.paidRevenue, 0);
  const outstandingTotal = allocatedStays.reduce((sum, stay) => sum + stay.balanceDue, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount_pkr, 0);
  const directBookingRevenue = allocatedStays
    .filter((stay) => stay.checkin.booking_source === "direct_whatsapp_call")
    .reduce((sum, stay) => sum + stay.paidRevenue, 0);
  const platformBookingRevenue = allocatedStays
    .filter((stay) => stay.checkin.booking_source === "booking_com" || stay.checkin.booking_source === "airbnb" || stay.checkin.booking_source === "agoda")
    .reduce((sum, stay) => sum + stay.paidRevenue, 0);
  const dailyRows: DailyPerformanceRow[] = reportDateList(range.startDate, range.endDate).map((date) => {
    const dayRoomTotals = allocatedStays.reduce(
      (totals, stay) => {
        const dayAllocation = getStayOverlapAllocation({
          checkInDate: stay.checkin.check_in_date,
          checkOutDate: stay.checkin.check_out_date,
          rangeStartDate: date,
          rangeEndDate: date,
        });
        const dayExpectedRoomRevenue = allocateAmountByNights(expectedRevenue(stay.checkin), dayAllocation);
        const dayPaidRoomRevenue = allocateAmountByNights(paidRevenue(stay.checkin), dayAllocation);

        totals.bookedRoomNights += dayAllocation.overlappingNights;
        totals.occupiedNights += stay.isOccupiedStatus ? dayAllocation.overlappingNights : 0;
        totals.expectedRoomRevenue += dayExpectedRoomRevenue;
        totals.paidRoomRevenue += dayPaidRoomRevenue;
        totals.arrivals += stay.checkin.check_in_date === date ? 1 : 0;
        totals.departures += stay.checkin.check_out_date === date ? 1 : 0;

        return totals;
      },
      {
        bookedRoomNights: 0,
        occupiedNights: 0,
        expectedRoomRevenue: 0,
        paidRoomRevenue: 0,
        arrivals: 0,
        departures: 0,
      },
    );
    const dayCharges = inRangeCharges.filter((charge) => charge.charged_at.slice(0, 10) === date);
    const dayAdditionalCharges = dayCharges.reduce((sum, charge) => sum + charge.total_amount_pkr, 0);
    const dayPaidAdditionalCharges = dayCharges.reduce((sum, charge) => sum + (charge.is_paid ? charge.total_amount_pkr : 0), 0);
    const expectedForDay = dayRoomTotals.expectedRoomRevenue + dayAdditionalCharges;
    const paidForDay = dayRoomTotals.paidRoomRevenue + dayPaidAdditionalCharges;

    return {
      date,
      bookedRoomNights: dayRoomTotals.bookedRoomNights,
      occupiedNights: dayRoomTotals.occupiedNights,
      occupancyPercentage: percent(dayRoomTotals.bookedRoomNights, totalAvailableUnits),
      expectedRevenue: expectedForDay,
      paidRevenue: paidForDay,
      balanceDue: Math.max(expectedForDay - paidForDay, 0),
      averageRatePerNight:
        dayRoomTotals.bookedRoomNights > 0 ? Math.round(dayRoomTotals.expectedRoomRevenue / dayRoomTotals.bookedRoomNights) : 0,
      arrivals: dayRoomTotals.arrivals,
      departures: dayRoomTotals.departures,
    };
  });

  const bookingSourceRows = bookingSourceOptions.map((option) => makePerformanceRow(option.value, option.label));
  const bookingSourceMap = new Map(bookingSourceRows.map((row) => [row.key, row]));
  allocatedStays.forEach((stay) => {
    const key = stay.checkin.booking_source;
    const row = bookingSourceMap.get(key) ?? makePerformanceRow(key, formatEnumLabel(key));
    addAllocatedStayToPerformanceRow(row, stay);

    if (!bookingSourceMap.has(key)) {
      bookingSourceMap.set(key, row);
      bookingSourceRows.push(row);
    }
  });
  bookingSourceRows.forEach(finalizePerformanceRow);

  const roomRows = rooms.map((room) => makePerformanceRow(room.id, formatUnitRoomLabel(room)));
  const roomMap = new Map(roomRows.map((row) => [row.key, row]));
  const unassignedRoomRow = makePerformanceRow("unassigned", "Unassigned");
  allocatedStays.forEach((stay) => {
    const key = stay.checkin.assigned_room_id ?? "unassigned";
    let row = key === "unassigned" ? unassignedRoomRow : roomMap.get(key);

    if (!row) {
      row = makePerformanceRow(key, stay.roomLabel);
      roomMap.set(key, row);
      roomRows.push(row);
    }

    addAllocatedStayToPerformanceRow(row, stay);
  });

  if (unassignedRoomRow.bookings > 0) {
    roomRows.push(unassignedRoomRow);
  }

  roomRows.forEach(finalizePerformanceRow);

  const unitTypeRows: PerformanceRow[] = [];
  const unitTypeMap = new Map<string, PerformanceRow>();
  allocatedStays.forEach((stay) => {
    const key = stay.unitType;
    const label = key === "unassigned" ? "Unassigned" : formatEnumLabel(key);
    let row = unitTypeMap.get(key);

    if (!row) {
      row = makePerformanceRow(key, label);
      unitTypeMap.set(key, row);
      unitTypeRows.push(row);
    }

    addAllocatedStayToPerformanceRow(row, stay);
  });
  unitTypeRows.forEach(finalizePerformanceRow);

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
  inRangeCharges.forEach((charge) => {
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
    { key: "new", label: "New guests", count: allocatedStays.filter((stay) => !stay.checkin.has_stayed_before).length },
    { key: "repeat", label: "Repeat guests", count: allocatedStays.filter((stay) => stay.checkin.has_stayed_before).length },
  ];

  const purposeRows = purposeOptions.map((option) => ({
    key: option.value,
    label: option.label,
    count: allocatedStays.filter((stay) => stay.checkin.purpose_of_visit === option.value).length,
  }));

  const checkinStatusRows = checkinStatusOptions.map((option) => ({
    key: option.value,
    label: option.label,
    count: allocatedStays.filter((stay) => stay.checkin.status === option.value).length,
  }));

  const paymentStatusRows = paymentStatusOptions.map((option) => ({
    key: option.value,
    label: option.label,
    count: allocatedStays.filter((stay) => stay.checkin.payment_status === option.value).length,
  }));

  const attentionRows = allocatedStays
    .filter((stay) => stay.fullStayBalanceDue > 0 || stay.allocation.crossesReportRange || !stay.checkin.payment_verified)
    .map((stay) => ({
      id: stay.checkin.id,
      guestName: stay.checkin.full_name,
      roomLabel: stay.roomLabel,
      stayPeriod: `${stay.checkin.check_in_date} to ${stay.checkin.check_out_date}`,
      bookedRoomNights: stay.allocation.overlappingNights,
      balanceDue: stay.fullStayBalanceDue,
      crossesReportRange: stay.allocation.crossesReportRange,
      paymentConfirmationMissing: !stay.checkin.payment_verified,
    }))
    .sort((a, b) => b.balanceDue - a.balanceDue || Number(b.paymentConfirmationMissing) - Number(a.paymentConfirmationMissing));

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
    definitions: {
      bookedRoomNights: "Nights from stays that overlap the selected date range, clipped to the range.",
      nightsStayed: "Occupied nights are overlapping nights from checked-in or checked-out stays; other booked statuses remain Booked Room Nights.",
      expectedRevenue: "Expected room revenue is allocated by overlapping booked nights; additional charges are included by charged_at date.",
      paidRevenue: "Paid Revenue Recorded is allocated from paid amounts on included stays because payment-date accounting is not available.",
      balanceDue: "Balance Due is expected room revenue plus additional charges minus paid room revenue and paid charges.",
    },
    kpis: {
      totalRevenue,
      paidRevenue: totalRevenue,
      expectedTotal,
      expectedRoomRevenue,
      basePaidRevenue: paidRoomRevenue,
      baseExpectedRevenue: expectedRoomRevenue,
      guestChargesTotal,
      paidGuestCharges,
      unpaidGuestCharges,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      outstandingTotal,
      totalBookings: allocatedStays.length,
      activeStays: allocatedStays.filter((stay) => stay.checkin.status === "checked_in").length,
      directBookingRevenue,
      platformBookingRevenue,
      bookedRoomNights,
      occupiedNights,
      availableRoomNights,
      occupancyPercentage: percent(bookedRoomNights, availableRoomNights),
      averageRatePerNight: bookedRoomNights > 0 ? Math.round(expectedRoomRevenue / bookedRoomNights) : 0,
      paidAverageRatePerNight: bookedRoomNights > 0 ? Math.round(paidRoomRevenue / bookedRoomNights) : 0,
      reportRangeNights,
      totalAvailableUnits,
    },
    bookingSourceRows,
    roomRows,
    unitTypeRows,
    categoryRows: unitTypeRows,
    expenseRows,
    chargeRows,
    attentionRows,
    maintenance: {
      openIssues: maintenanceLogs.filter((log) => log.status === "reported").length,
      inProgressIssues: maintenanceLogs.filter((log) => log.status === "in_progress").length,
      resolvedIssues: maintenanceLogs.filter((log) => log.status === "resolved").length,
      recordedExpenseTotal: maintenanceExpenseTotal,
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
        ? `Highest revenue unit: ${highestRevenueUnit.label} (${highestRevenueUnit.bookedRoomNights} booked room nights).`
        : "Highest revenue unit: no paid unit revenue in this range.",
      topBookingSource
        ? `Top booking source: ${topBookingSource.label} (${topBookingSource.bookedRoomNights} booked room nights).`
        : "Top booking source: no bookings in this range.",
      largestExpenseCategory
        ? `Largest expense category: ${largestExpenseCategory.label}.`
        : "Largest expense category: no expenses recorded in this range.",
      `Balance Due: PKR ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(outstandingTotal)}.`,
      `Direct bookings account for ${formatPercent(directRevenueShare)} of paid revenue.`,
    ],
    dailyRows,
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
  const rows: Array<Array<string | number | boolean>> = [
    ["GreenLux Residency Business Analytics v2"],
    ["Date range", range.startDate, range.endDate, range.label],
    [],
    ["Definitions"],
    ["Booked Room Nights", report.definitions.bookedRoomNights],
    ["Nights Stayed / Occupied Nights", report.definitions.nightsStayed],
    ["Expected Room Revenue", report.definitions.expectedRevenue],
    ["Paid Revenue Recorded", report.definitions.paidRevenue],
    ["Balance Due", report.definitions.balanceDue],
    [],
    ["Executive Summary"],
    ["Metric", "Value"],
    ["Expected Revenue", report.kpis.expectedTotal],
    ["Paid Revenue Recorded", report.kpis.totalRevenue],
    ["Balance Due", report.kpis.outstandingTotal],
    ["Expenses", report.kpis.totalExpenses],
    ["Net Profit", report.kpis.netProfit],
    ["Booked Room Nights", report.kpis.bookedRoomNights],
    ["Nights Stayed / Occupied Nights", report.kpis.occupiedNights],
    ["Occupancy %", formatPercent(report.kpis.occupancyPercentage)],
    ["Average Rate / Night", report.kpis.averageRatePerNight],
    ["Paid Average Rate / Night", report.kpis.paidAverageRatePerNight],
    ["Additional Charges", report.kpis.guestChargesTotal],
    ["Paid Additional Charges", report.kpis.paidGuestCharges],
    [],
    ["Daily Performance"],
    ["Date", "Booked nights", "Occupied nights", "Occupancy %", "Expected revenue", "Paid Revenue Recorded", "Balance Due", "Average rate/night", "Arrivals", "Departures"],
    ...report.dailyRows.map((row) => [
      row.date,
      row.bookedRoomNights,
      row.occupiedNights,
      formatPercent(row.occupancyPercentage),
      row.expectedRevenue,
      row.paidRevenue,
      row.balanceDue,
      row.averageRatePerNight,
      row.arrivals,
      row.departures,
    ]),
    [],
    ["Booking Source Performance"],
    ["Booking source", "Bookings", "Booked nights", "Expected revenue", "Paid revenue", "Average rate/night", "Paid average rate/night", "Balance Due", "Additional charges"],
    ...report.bookingSourceRows.map((row) => [
      row.label,
      row.bookings,
      row.bookedRoomNights,
      row.expectedRevenue,
      row.paidRevenue,
      row.averageRatePerNight,
      row.paidAverageRatePerNight,
      row.balanceDue,
      row.additionalCharges,
    ]),
    [],
    ["Unit Performance"],
    ["Unit", "Bookings", "Booked nights", "Occupied nights", "Expected revenue", "Paid revenue", "Average rate/night", "Paid average rate/night", "Balance Due", "Additional charges"],
    ...report.roomRows.map((row) => [
      row.label,
      row.bookings,
      row.bookedRoomNights,
      row.occupiedNights,
      row.expectedRevenue,
      row.paidRevenue,
      row.averageRatePerNight,
      row.paidAverageRatePerNight,
      row.balanceDue,
      row.additionalCharges,
    ]),
    [],
    ["Unit Type Performance"],
    ["Unit type", "Bookings", "Booked nights", "Occupied nights", "Expected revenue", "Paid revenue", "Average rate/night", "Paid average rate/night", "Balance Due", "Additional charges"],
    ...report.unitTypeRows.map((row) => [
      row.label,
      row.bookings,
      row.bookedRoomNights,
      row.occupiedNights,
      row.expectedRevenue,
      row.paidRevenue,
      row.averageRatePerNight,
      row.paidAverageRatePerNight,
      row.balanceDue,
      row.additionalCharges,
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
    ["Attention List"],
    ["Guest", "Room", "Stay period", "Booked nights in period", "Balance Due", "Crosses report period", "Payment Confirmation missing"],
    ...report.attentionRows.map((row) => [
      row.guestName,
      row.roomLabel,
      row.stayPeriod,
      row.bookedRoomNights,
      row.balanceDue,
      row.crossesReportRange,
      row.paymentConfirmationMissing,
    ]),
    [],
    ["Maintenance Expenses by Unit"],
    ["Unit", "Expense entries", "Recorded expenses"],
    ...report.maintenance.expenseByRoomRows.map((row) => [row.label, row.expenseCount, row.totalCost]),
  ];

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

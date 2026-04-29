import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildBusinessReport, createBusinessReportCsv, fetchReportInputs, getReportDateRange } from "@/lib/reports/analytics";

async function requireSuperAdminForExport() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: NextResponse.json({ error: "Unauthenticated" }, { status: 401 }) };
  }

  const { data: profile } = await supabase.from("users_profile").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "super_admin") {
    return { supabase, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, error: null };
}

export async function GET(request: NextRequest) {
  const { supabase, error } = await requireSuperAdminForExport();

  if (error) {
    return error;
  }

  const params = request.nextUrl.searchParams;
  const range = getReportDateRange({
    range: params.get("range") ?? undefined,
    start: params.get("start") ?? undefined,
    end: params.get("end") ?? undefined,
  });
  const reportInputs = await fetchReportInputs(supabase, range);

  if (reportInputs.errors.length > 0) {
    return NextResponse.json({ error: reportInputs.errors.join(" ") }, { status: 500 });
  }

  const report = buildBusinessReport(reportInputs);
  const csv = createBusinessReportCsv({ report, range });
  const filename = `greenlux-business-report-${range.startDate}-to-${range.endDate}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

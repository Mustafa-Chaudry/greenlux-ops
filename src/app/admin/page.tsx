import Link from "next/link";
import { BarChart3, CalendarDays, CheckCircle2, ClipboardList, Hotel, TriangleAlert, UserCheck, UserPlus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { hasAllowedRole, managementRoles, staffGuestCreationRoles, superAdminRoles } from "@/lib/auth/roles";
import { getBusinessTodayDate, isReadyForCheckin } from "@/lib/check-in/options";

const adminAreas = [
  {
    title: "Guest Records",
    description: "Search check-ins, review verification status, open records, and update operational fields.",
    href: "/admin/guest-records",
    icon: ClipboardList,
  },
  {
    title: "Units",
    description: "Review the 11-unit inventory, base prices, guest capacity, amenities, and operational status.",
    href: "/admin/rooms",
    icon: Hotel,
  },
  {
    title: "Expenses",
    description: "Record owner-level operating expenses, related units, payment method, and optional receipt uploads.",
    href: "/admin/expenses",
    icon: ClipboardList,
    ownerOnly: true,
  },
  {
    title: "Maintenance",
    description: "Log unit issues, repair costs, status, and resolution notes for daily operations.",
    href: "/admin/maintenance",
    icon: Wrench,
  },
  {
    title: "Reports",
    description: "Review revenue, expenses, maintenance, and operational business reports.",
    href: "/admin/reports",
    icon: BarChart3,
    ownerOnly: true,
  },
  {
    title: "Users / Roles",
    description: "Create staff users and manage manager, admin, and super admin access.",
    href: "/admin/users",
    icon: UserCheck,
    ownerOnly: true,
  },
];

export default async function AdminPage() {
  const { supabase, profile } = await requireRole(managementRoles);
  const canCreateGuests = hasAllowedRole(profile.role, staffGuestCreationRoles);
  const canAccessOwnerReports = hasAllowedRole(profile.role, superAdminRoles);
  const today = getBusinessTodayDate();
  const { data: records } = await supabase
    .from("guest_checkins")
    .select("status,assigned_room_id,cnic_verified,payment_status,payment_method,payment_verified,check_in_date");

  const checkins = records ?? [];
  const needsAttentionCount = checkins.filter(
    (record) => !record.cnic_verified || !record.payment_verified || record.status === "issue",
  ).length;
  const checkedInWithIssuesCount = checkins.filter(
    (record) => record.status === "checked_in" && (!record.cnic_verified || !record.payment_verified),
  ).length;
  const readyForCheckinCount = checkins.filter(isReadyForCheckin).length;
  const todaysCheckinsCount = checkins.filter((record) => record.check_in_date === today).length;

  const summaryCards = [
    {
      title: "Needs Attention",
      value: needsAttentionCount,
      description: "Missing ID, payment verification, or flagged issue",
      href: "/admin/guest-records?verification=any",
      icon: TriangleAlert,
    },
    {
      title: "Checked-in with Issues",
      value: checkedInWithIssuesCount,
      description: "Guests accommodated with pending verification",
      href: "/admin/guest-records?view=active&verification=any",
      icon: UserCheck,
    },
    {
      title: "Ready for Check-in",
      value: readyForCheckinCount,
      description: "Not yet checked in, with room, ID, and payment verified",
      href: "/admin/guest-records?view=ready",
      icon: CheckCircle2,
    },
    {
      title: "Today's Check-ins",
      value: todaysCheckinsCount,
      description: "Expected arrivals for today",
      href: `/admin/guest-records?date_from=${today}&date_to=${today}`,
      icon: CalendarDays,
    },
  ];

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Management foundation</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">Admin area</h1>
            <p className="mt-2 text-sm text-slate-600">
              Signed in as {profile.full_name || profile.email} with {profile.role.replace("_", " ")} access.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            {canCreateGuests ? (
              <Button asChild>
                <Link href="/admin/guests/new">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                Add Guest / Walk-in
                </Link>
              </Button>
            ) : null}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <Link key={card.title} href={card.href} className="group block">
              <Card className="h-full transition-shadow group-hover:shadow-soft">
                <CardHeader>
                  <card.icon className="h-5 w-5 text-brand-fresh" aria-hidden="true" />
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <p className="font-serif text-4xl font-semibold text-brand-deep">{card.value}</p>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {canCreateGuests ? (
            <Card>
              <CardHeader>
                <UserPlus className="h-5 w-5 text-brand-fresh" aria-hidden="true" />
                <CardTitle>Add Guest / Walk-in</CardTitle>
                <CardDescription>
                  Create a staff-managed guest record for WhatsApp bookings, walk-ins, VIPs, or non-email guests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary">
                  <Link href="/admin/guests/new">Open</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
          {adminAreas
            .filter((area) => !area.ownerOnly || canAccessOwnerReports)
            .map((area) => (
            <Card key={area.title}>
              <CardHeader>
                <area.icon className="h-5 w-5 text-brand-fresh" aria-hidden="true" />
                <CardTitle>{area.title}</CardTitle>
                <CardDescription>{area.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary">
                  <Link href={area.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";
import { CalendarDays, ClipboardCheck, Home, ShieldCheck, WalletCards } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth/guards";
import { canAccessManagement } from "@/lib/auth/roles";
import { checkinStatusTone, formatEnumLabel, guestCheckinStatusLabels } from "@/lib/check-in/options";

function verificationBadge(verified: boolean) {
  return <Badge tone={verified ? "success" : "warning"}>{verified ? "Verified" : "Pending"}</Badge>;
}

function paymentBadge(status: string) {
  const tone = status === "paid" ? "success" : status === "partial" ? "warning" : status === "refunded" ? "info" : "neutral";
  return <Badge tone={tone}>{formatEnumLabel(status)}</Badge>;
}

function guestStatusBadge(status: keyof typeof guestCheckinStatusLabels) {
  return <Badge tone={checkinStatusTone[status]}>{guestCheckinStatusLabels[status]}</Badge>;
}

export default async function DashboardPage() {
  const { supabase, profile } = await requireUserProfile();
  const managementAccess = canAccessManagement(profile.role);
  const { data: checkins } = await supabase
    .from("guest_checkins_guest_view")
    .select("*")
    .order("created_at", { ascending: false });

  const assignedRoomIds = Array.from(
    new Set((checkins ?? []).map((checkin) => checkin.assigned_room_id).filter((id): id is string => Boolean(id))),
  );
  const { data: rooms } = assignedRoomIds.length
    ? await supabase.from("rooms").select("id,name").in("id", assignedRoomIds)
    : { data: [] };
  const roomNames = new Map((rooms ?? []).map((room) => [room.id, room.name]));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Secure account</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">
              Welcome{profile.full_name ? `, ${profile.full_name}` : ""}
            </h1>
            <p className="mt-2 text-sm text-slate-600">Current role: {profile.role.replace("_", " ")}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline">Sign out</Button>
          </form>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile summary</CardTitle>
              <CardDescription>
                Your saved account details are used to pre-fill the GreenLux check-in form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-2 rounded-lg bg-brand-ivory p-4">
                <p><span className="font-semibold text-brand-deep">Name:</span> {profile.full_name || "Not set"}</p>
                <p><span className="font-semibold text-brand-deep">Phone:</span> {profile.phone || "Not set"}</p>
                <p><span className="font-semibold text-brand-deep">Email:</span> {profile.email || "Not set"}</p>
              </div>
              <Button asChild>
                <Link href="/dashboard/check-in">
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  Complete check-in
                </Link>
              </Button>
            </CardContent>
          </Card>

          {managementAccess ? (
            <Card>
              <CardHeader>
                <CardTitle>Management access</CardTitle>
                <CardDescription>
                  Your role can access operational management routes. Analytics and finance routes require super
                  admin permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin">Open admin area</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-fresh">Your stays</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-brand-deep">Submitted check-ins</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/rooms">View rooms</Link>
            </Button>
          </div>

          {!checkins?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>No check-ins yet</CardTitle>
                <CardDescription>Complete your check-in before arrival so management can verify your stay.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/dashboard/check-in">Start check-in</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {checkins.map((checkin) => (
                <Card key={checkin.id}>
                  <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr_1fr] lg:items-center">
                    <div>
                      <h3 className="font-semibold text-brand-deep">{checkin.full_name}</h3>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                        {checkin.check_in_date} to {checkin.check_out_date}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{checkin.number_of_guests} guest(s)</p>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <p className="flex flex-wrap items-center gap-2 text-slate-600">
                        Your check-in status: {guestStatusBadge(checkin.status)}
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <WalletCards className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                        Payment {paymentBadge(checkin.payment_status)}
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <Home className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                        Room {checkin.assigned_room_id ? roomNames.get(checkin.assigned_room_id) ?? "Assigned" : "Not assigned yet"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                        <ShieldCheck className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                        CNIC {verificationBadge(checkin.cnic_verified)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                        Payment {verificationBadge(checkin.payment_verified)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

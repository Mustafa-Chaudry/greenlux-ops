import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { createManualGuest } from "@/app/admin/guests/new/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/guards";
import { staffGuestCreationRoles } from "@/lib/auth/roles";
import { formatEnumLabel, getBusinessTodayDate, paymentStatusOptions } from "@/lib/check-in/options";

export const metadata: Metadata = {
  title: "Add Guest",
};

type PageProps = {
  searchParams: Promise<{ message?: string }>;
};

function addDaysIso(dateValue: string, days: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function NewGuestPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { supabase } = await requireRole(staffGuestCreationRoles);
  const today = getBusinessTodayDate();
  const tomorrow = addDaysIso(today, 1);
  const { data: rooms } = await supabase.from("rooms").select("id,name,status,base_price_pkr").order("name");
  const paymentOptions = paymentStatusOptions.filter((option) => option.value !== "refunded");

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to admin
          </Link>
        </Button>

        <header className="rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-fresh">Front desk entry</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-deep sm:text-4xl">Add guest manually</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Create a staff-managed guest record without requiring the guest to register, confirm email, or touch the
            check-in portal.
          </p>
        </header>

        {params.message ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">{params.message}</div>
        ) : null}

        <form action={createManualGuest} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guest details</CardTitle>
              <CardDescription>Only name and phone are required for a quick front desk record.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" autoComplete="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile / WhatsApp</Label>
                <Input id="phone" name="phone" autoComplete="tel" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email optional</Label>
                <Input id="email" name="email" type="email" autoComplete="email" />
                <p className="text-xs text-slate-500">
                  If configured, GreenLux will create an email-confirmed Supabase auth user for this guest.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC / passport optional</Label>
                <Input id="cnic" name="cnic" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stay and payment</CardTitle>
              <CardDescription>Dates are prefilled so staff can save quickly and adjust later if needed.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="check_in_date">Check-in date</Label>
                <Input id="check_in_date" name="check_in_date" type="date" defaultValue={today} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out_date">Check-out date</Label>
                <Input id="check_out_date" name="check_out_date" type="date" defaultValue={tomorrow} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_status">Payment status</Label>
                <Select id="payment_status" name="payment_status" defaultValue="pending">
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_room_id">Assign room optional</Label>
                <Select id="assigned_room_id" name="assigned_room_id">
                  <option value="">Assign later</option>
                  {(rooms ?? []).map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({formatEnumLabel(room.status)})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agreed_room_rate_pkr">Agreed rate optional</Label>
                <Input id="agreed_room_rate_pkr" name="agreed_room_rate_pkr" type="number" min={0} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_expected_amount_pkr">Expected total optional</Label>
                <Input id="total_expected_amount_pkr" name="total_expected_amount_pkr" type="number" min={0} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount_paid_pkr">Paid amount optional</Label>
                <Input id="amount_paid_pkr" name="amount_paid_pkr" type="number" min={0} inputMode="numeric" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Internal notes are visible only to management.</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={4} className="mt-2" />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" size="lg">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Create guest record
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin/guest-records">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

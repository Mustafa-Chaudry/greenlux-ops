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
import {
  bookingSourceOptions,
  checkinStatusOptions,
  formatEnumLabel,
  formatPkr,
  getBusinessTodayDate,
  guestTagOptions,
  paymentMethodOptions,
  paymentStatusOptions,
  purposeOptions,
} from "@/lib/check-in/options";

export const metadata: Metadata = {
  title: "Add Guest / Walk-in",
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
  const initialStatusOptions = checkinStatusOptions.filter(
    (option) => option.value === "submitted" || option.value === "under_review",
  );

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to admin
          </Link>
        </Button>

        <header className="rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-fresh">Front desk entry</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-deep sm:text-4xl">Add Guest / Walk-in</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Create a staff-managed guest record for WhatsApp bookings, walk-ins, VIPs, or non-email guests. Only the
            quick-entry fields are required; staff can add documents and payment details when available.
          </p>
        </header>

        {params.message ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">{params.message}</div>
        ) : null}

        <form action={createManualGuest} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick entry required</CardTitle>
              <CardDescription>Name, phone, dates, and guest count are enough to create a front desk record.</CardDescription>
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
                <Label htmlFor="check_in_date">Check-in date</Label>
                <Input id="check_in_date" name="check_in_date" type="date" defaultValue={today} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out_date">Check-out date</Label>
                <Input id="check_out_date" name="check_out_date" type="date" defaultValue={tomorrow} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number_of_guests">Number of guests</Label>
                <Input id="number_of_guests" name="number_of_guests" type="number" min={1} defaultValue={1} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial status</Label>
                <Select id="status" name="status" defaultValue="under_review">
                  {initialStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optional guest details</CardTitle>
              <CardDescription>Use these fields when staff has the same details normally collected from the guest form.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email optional</Label>
                <Input id="email" name="email" type="email" autoComplete="email" />
                <p className="text-xs text-slate-500">
                  If service-role auth is configured, an email-confirmed Supabase user can be created automatically.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic_passport_number">CNIC / passport optional</Label>
                <Input id="cnic_passport_number" name="cnic_passport_number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address optional</Label>
                <Input id="address" name="address" autoComplete="street-address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city_country_from">City/country travelling from optional</Label>
                <Input id="city_country_from" name="city_country_from" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_arrival_time">Estimated arrival time optional</Label>
                <Input id="estimated_arrival_time" name="estimated_arrival_time" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose_of_visit">Purpose of visit</Label>
                <Select id="purpose_of_visit" name="purpose_of_visit" defaultValue="other">
                  {purposeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking_source">Booking source</Label>
                <Select id="booking_source" name="booking_source" defaultValue="direct_whatsapp_call">
                  {bookingSourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest_tag">Guest tag</Label>
                <Select id="guest_tag" name="guest_tag" defaultValue="new">
                  {guestTagOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Room and payment optional</CardTitle>
              <CardDescription>Staff can assign a room and add rates now, or finish these from the record detail page.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assigned_room_id">Assign room optional</Label>
                <Select id="assigned_room_id" name="assigned_room_id">
                  <option value="">Assign later</option>
                  {(rooms ?? []).map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {formatEnumLabel(room.status)} - {formatPkr(room.base_price_pkr)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment method</Label>
                <Select id="payment_method" name="payment_method" defaultValue="cash">
                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
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
                <Label htmlFor="agreed_room_rate_pkr">Agreed rate optional</Label>
                <Input id="agreed_room_rate_pkr" name="agreed_room_rate_pkr" type="number" min={0} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance_paid_amount_pkr">Advance paid optional</Label>
                <Input id="advance_paid_amount_pkr" name="advance_paid_amount_pkr" type="number" min={0} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_expected_amount_pkr">Expected total optional</Label>
                <Input id="total_expected_amount_pkr" name="total_expected_amount_pkr" type="number" min={0} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount_paid_pkr">Paid amount optional</Label>
                <Input id="amount_paid_pkr" name="amount_paid_pkr" type="number" min={0} inputMode="numeric" />
              </div>
              <div className="grid gap-3 rounded-lg border border-brand-sage bg-brand-ivory p-4 md:col-span-2">
                <label className="flex items-center gap-3 text-sm font-medium text-brand-deep">
                  <input type="checkbox" name="cnic_verified" className="h-4 w-4 accent-brand-fresh" />
                  CNIC/passport received and verified
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-brand-deep">
                  <input type="checkbox" name="payment_verified" className="h-4 w-4 accent-brand-fresh" />
                  Payment proof verified
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optional documents</CardTitle>
              <CardDescription>
                Upload documents if they are available now. Staff can still create the guest record without files.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primary_document">Primary CNIC/passport upload optional</Label>
                <Input id="primary_document" name="primary_document" type="file" accept=".jpg,.jpeg,.png,.pdf" />
                <p className="text-xs text-slate-500">JPG, PNG, or PDF up to 10 MB.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional_documents">Additional guest CNIC/passport uploads optional</Label>
                <Input id="additional_documents" name="additional_documents" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple />
                <p className="text-xs text-slate-500">Optional. Multiple files allowed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_proof">Payment proof upload optional</Label>
                <Input id="payment_proof" name="payment_proof" type="file" accept=".jpg,.jpeg,.png,.pdf" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes optional</CardTitle>
              <CardDescription>Guest comments and internal notes can be expanded later on the detail page.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="special_requests">Special requests</Label>
                <Textarea id="special_requests" name="special_requests" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internal_notes">Internal notes</Label>
                <Textarea id="internal_notes" name="internal_notes" rows={4} />
              </div>
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

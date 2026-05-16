import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { createManualGuest } from "@/app/admin/guests/new/actions";
import { Badge } from "@/components/ui/badge";
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
  formatUnitRoomLabel,
  getBalanceDue,
  getBusinessTodayDate,
  guestTagOptions,
  paymentMethodOptions,
  paymentStatusOptions,
  purposeOptions,
  roomCleaningStatusLabels,
} from "@/lib/check-in/options";
import { formatStayRangeWithNights, getStayNights } from "@/lib/check-in/stay-dates";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Add Guest Stay",
};

type PageProps = {
  searchParams: Promise<{ message?: string; repeat_q?: string; repeat_guest_id?: string; bookingGroupId?: string }>;
};

type RepeatStay = Pick<
  Database["public"]["Tables"]["guest_checkins"]["Row"],
  | "id"
  | "full_name"
  | "phone"
  | "email"
  | "cnic_passport_number"
  | "address"
  | "city_country_from"
  | "purpose_of_visit"
  | "check_in_date"
  | "check_out_date"
  | "booking_source"
  | "assigned_room_id"
  | "agreed_room_rate_pkr"
  | "total_expected_amount_pkr"
  | "amount_paid_pkr"
  | "payment_status"
>;

function addDaysIso(dateValue: string, days: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function sameGuestIdentity(candidate: RepeatStay, stay: RepeatStay) {
  const phoneMatch = Boolean(candidate.phone && stay.phone && candidate.phone === stay.phone);
  const emailMatch = Boolean(candidate.email && stay.email && candidate.email.toLowerCase() === stay.email.toLowerCase());
  const idMatch = Boolean(
    candidate.cnic_passport_number &&
      stay.cnic_passport_number &&
      candidate.cnic_passport_number.toLowerCase() === stay.cnic_passport_number.toLowerCase(),
  );

  return phoneMatch || emailMatch || idMatch;
}

function getRepeatRateLabel(stay: RepeatStay) {
  if (stay.agreed_room_rate_pkr && stay.agreed_room_rate_pkr > 0) {
    return `${formatPkr(stay.agreed_room_rate_pkr)} / night`;
  }

  const nights = getStayNights(stay.check_in_date, stay.check_out_date);
  if (nights && stay.total_expected_amount_pkr && stay.total_expected_amount_pkr > 0) {
    return `${formatPkr(Math.round(stay.total_expected_amount_pkr / nights))} / night`;
  }

  return "Not available";
}

export default async function NewGuestPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { supabase } = await requireRole(staffGuestCreationRoles);
  const today = getBusinessTodayDate();
  const tomorrow = addDaysIso(today, 1);
  const repeatSearch = params.repeat_q?.trim() ?? "";
  const repeatSearchTerm = repeatSearch.replace(/,/g, " ");
  const [{ data: rooms }, { data: bookingGroups }, { data: selectedRepeatStay }, repeatSearchResult, { data: selectedBookingGroup }] = await Promise.all([
    supabase
      .from("rooms")
      .select("id,unit_number,name,status,cleaning_status,base_price_pkr")
      .order("unit_number", { nullsFirst: false }),
    supabase
      .from("booking_groups")
      .select("id,lead_guest_name,lead_guest_phone,booking_source,check_in_date,check_out_date,expected_total_amount,paid_total_amount")
      .order("created_at", { ascending: false })
      .limit(50),
    params.repeat_guest_id
      ? supabase
          .from("guest_checkins")
          .select(
            "id,full_name,phone,email,cnic_passport_number,address,city_country_from,purpose_of_visit,check_in_date,check_out_date,booking_source,assigned_room_id,agreed_room_rate_pkr,total_expected_amount_pkr,amount_paid_pkr,payment_status",
          )
          .eq("id", params.repeat_guest_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    repeatSearchTerm.length >= 2
      ? supabase
          .from("guest_checkins")
          .select(
            "id,full_name,phone,email,cnic_passport_number,address,city_country_from,purpose_of_visit,check_in_date,check_out_date,booking_source,assigned_room_id,agreed_room_rate_pkr,total_expected_amount_pkr,amount_paid_pkr,payment_status",
          )
          .or(
            `full_name.ilike.%${repeatSearchTerm}%,phone.ilike.%${repeatSearchTerm}%,cnic_passport_number.ilike.%${repeatSearchTerm}%,email.ilike.%${repeatSearchTerm}%`,
          )
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [], error: null }),
    params.bookingGroupId
      ? supabase
          .from("booking_groups")
          .select("id,lead_guest_name,lead_guest_phone,booking_source,check_in_date,check_out_date,expected_total_amount,paid_total_amount")
          .eq("id", params.bookingGroupId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  const repeatMatches = (repeatSearchResult.data ?? []) as RepeatStay[];
  const repeatMatchIds = repeatMatches.map((stay) => stay.id);
  const { data: repeatDocuments } = repeatMatchIds.length
    ? await supabase
        .from("guest_documents")
        .select("checkin_id,document_type,document_status")
        .in("checkin_id", repeatMatchIds)
        .in("document_type", ["primary_cnic", "additional_guest_cnic", "supporting_document"])
    : { data: [] };
  const repeatDocumentsByStay = new Map<string, Array<{ document_type: string; document_status: string }>>();
  (repeatDocuments ?? []).forEach((document) => {
    const documentsForStay = repeatDocumentsByStay.get(document.checkin_id) ?? [];
    documentsForStay.push({ document_type: document.document_type, document_status: document.document_status });
    repeatDocumentsByStay.set(document.checkin_id, documentsForStay);
  });
  const hasRoomsNotReady = Boolean(rooms?.some((room) => room.cleaning_status !== "ready"));
  const roomById = new Map((rooms ?? []).map((room) => [room.id, room]));
  const bookingGroupsForSelect = selectedBookingGroup && !(bookingGroups ?? []).some((group) => group.id === selectedBookingGroup.id)
    ? [selectedBookingGroup, ...(bookingGroups ?? [])]
    : bookingGroups ?? [];
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
          <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-deep sm:text-4xl">Add Guest Stay</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Create a staff-managed guest stay for WhatsApp bookings, walk-ins, VIPs, or non-email guests. Only the
            quick-entry fields are required; staff can add documents and payment details when available.
          </p>
        </header>

        {params.message ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">{params.message}</div>
        ) : null}

        <Card>
            <CardHeader>
              <CardTitle>Repeat Guest Autofill</CardTitle>
              <CardDescription>
                Previous guest details can be reused, but stay dates, room, payment, and documents must be reviewed for this stay.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Label htmlFor="repeat_q" className="sr-only">Search previous guests</Label>
                <Input id="repeat_q" name="repeat_q" defaultValue={repeatSearch} placeholder="Search previous guest by name, phone, ID/passport, or email" />
                <Button type="submit" variant="secondary">Search Previous Stays</Button>
              </form>

              {selectedRepeatStay ? (
                <div className="rounded-lg border border-brand-sage bg-green-50 p-4 text-sm text-green-900">
                  Reusing safe details from {selectedRepeatStay.full_name}. Dates, unit, payment, and documents remain blank for this new Guest Stay.
                  Previous ID/supporting documents can be added for review after save; current stay verification still needs staff confirmation.
                </div>
              ) : null}

              {repeatMatches.length ? (
                <div className="grid gap-2">
                  {repeatMatches.map((stay) => {
                    const matchingStays = repeatMatches.filter((match) => sameGuestIdentity(stay, match));
                    const lastStay = matchingStays[0] ?? stay;
                    const lastRoom = lastStay.assigned_room_id ? roomById.get(lastStay.assigned_room_id) : null;
                    const documentsForStay = repeatDocumentsByStay.get(stay.id) ?? [];
                    const hasIdentityDocuments = documentsForStay.some((document) => document.document_type === "primary_cnic" || document.document_type === "additional_guest_cnic");
                    const hasSupportingDocuments = documentsForStay.some((document) => document.document_type === "supporting_document");
                    const previousBalanceDue = getBalanceDue(stay) ?? 0;

                    return (
                      <div key={stay.id} className="flex flex-col gap-3 rounded-lg border border-brand-sage bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                          <div>
                            <p className="font-semibold text-brand-deep">{stay.full_name}</p>
                            <p className="text-sm text-slate-600">
                              {stay.phone} {stay.email ? `- ${stay.email}` : ""} {stay.cnic_passport_number ? `- ${stay.cnic_passport_number}` : ""}
                            </p>
                          </div>
                          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                            <span>Previous stay count: {matchingStays.length}</span>
                            <span>Last stay: {formatStayRangeWithNights(lastStay.check_in_date, lastStay.check_out_date)}</span>
                            <span>Last room/unit: {lastRoom ? formatUnitRoomLabel(lastRoom) : "Not assigned"}</span>
                            <span>Last booking source: {bookingSourceOptions.find((option) => option.value === lastStay.booking_source)?.label ?? formatEnumLabel(lastStay.booking_source)}</span>
                            <span>Last rate/night: {getRepeatRateLabel(lastStay)}</span>
                            <span>Previous documents: {hasIdentityDocuments || hasSupportingDocuments ? "ID/supporting documents on file" : "None found"}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {hasIdentityDocuments ? <Badge tone="info">Previous ID on file</Badge> : null}
                            {hasSupportingDocuments ? <Badge tone="info">Supporting Documents on file</Badge> : null}
                            {previousBalanceDue > 0 ? <Badge tone="warning">Previous stay had Balance Due</Badge> : null}
                            {stay.payment_status !== "paid" ? <Badge tone="warning">Review previous payment follow-up</Badge> : null}
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/guests/new?repeat_guest_id=${stay.id}${repeatSearch ? `&repeat_q=${encodeURIComponent(repeatSearch)}` : ""}`}>
                            Use these details
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : repeatSearch.length >= 2 ? (
                <p className="rounded-lg bg-brand-ivory p-3 text-sm text-slate-600">No previous stays matched this search.</p>
              ) : null}
            </CardContent>
        </Card>

        <form action={createManualGuest} className="space-y-6">
          <input type="hidden" name="repeat_source_checkin_id" value={selectedRepeatStay?.id ?? ""} />
          <Card>
            <CardHeader>
              <CardTitle>Quick entry required</CardTitle>
              <CardDescription>Name, phone, dates, and guest count are enough to create a front desk record.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" autoComplete="name" defaultValue={selectedRepeatStay?.full_name ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile / WhatsApp</Label>
                <Input id="phone" name="phone" autoComplete="tel" defaultValue={selectedRepeatStay?.phone ?? ""} required />
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
                <Input id="email" name="email" type="email" autoComplete="email" defaultValue={selectedRepeatStay?.email ?? ""} />
                <p className="text-xs text-slate-500">
                  If service-role auth is configured, an email-confirmed Supabase user can be created automatically.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic_passport_number">CNIC / passport optional</Label>
                <Input id="cnic_passport_number" name="cnic_passport_number" defaultValue={selectedRepeatStay?.cnic_passport_number ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address optional</Label>
                <Input id="address" name="address" autoComplete="street-address" defaultValue={selectedRepeatStay?.address ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city_country_from">City/country travelling from optional</Label>
                <Input id="city_country_from" name="city_country_from" defaultValue={selectedRepeatStay?.city_country_from ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_arrival_time">Estimated arrival time optional</Label>
                <Input id="estimated_arrival_time" name="estimated_arrival_time" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose_of_visit">Purpose of visit</Label>
                <Select id="purpose_of_visit" name="purpose_of_visit" defaultValue={selectedRepeatStay?.purpose_of_visit ?? "other"}>
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
                <Select id="guest_tag" name="guest_tag" defaultValue={selectedRepeatStay ? "repeat" : "new"}>
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
              <CardTitle>Unit and payment optional</CardTitle>
              <CardDescription>Staff can assign a unit and add rates now, or finish these from the record detail page.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assigned_room_id">Assign unit optional</Label>
                <Select id="assigned_room_id" name="assigned_room_id">
                  <option value="">Assign later</option>
                  {(rooms ?? []).map((room) => (
                    <option key={room.id} value={room.id}>
                      {formatUnitRoomLabel(room)} - {formatEnumLabel(room.status)}
                      {room.cleaning_status !== "ready" ? ` - ${roomCleaningStatusLabels[room.cleaning_status]}` : ""} -{" "}
                      {formatPkr(room.base_price_pkr)}
                    </option>
                  ))}
                </Select>
                {hasRoomsNotReady ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    Rooms labelled Cleaning Required, Cleaning In Progress, or Maintenance Blocked are not ready. Warning:
                    this room is not marked ready. You may continue if management has approved this.
                  </p>
                ) : null}
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
                <Label htmlFor="total_expected_amount_pkr">Expected total optional</Label>
                <Input id="total_expected_amount_pkr" name="total_expected_amount_pkr" type="number" min={0} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount_paid_pkr">Paid amount optional</Label>
                <Input id="amount_paid_pkr" name="amount_paid_pkr" type="number" min={0} inputMode="numeric" />
              </div>
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 md:col-span-2">
                For multi-room bookings, enter the amount for this room/stay only. Do not enter the full group total on every room.
              </p>
              <div className="grid gap-3 rounded-lg border border-brand-sage bg-brand-ivory p-4 md:col-span-2">
                <label className="flex items-center gap-3 text-sm font-medium text-brand-deep">
                  <input type="checkbox" name="cnic_verified" className="h-4 w-4 accent-brand-fresh" />
                  ID/passport received and verified
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-brand-deep">
                  <input type="checkbox" name="payment_verified" className="h-4 w-4 accent-brand-fresh" />
                  Payment Confirmation verified
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Multi-room booking</CardTitle>
              <CardDescription>
                Keep this empty for normal single-room stays. Use it when one lead guest is booking more than one unit.
                Lead booking totals are for management reference. Reports currently calculate revenue from individual room stays to avoid double-counting.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {selectedBookingGroup ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 md:col-span-2">
                  Adding another room to Lead Booking for {selectedBookingGroup.lead_guest_name}. Stay dates, room assignment, payment, and documents remain individual to this new Guest Stay.
                </div>
              ) : null}

              <label className="flex gap-3 rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm font-medium text-brand-deep md:col-span-2">
                <input type="checkbox" name="create_new_booking_group" className="mt-1 h-4 w-4 accent-brand-fresh" />
                <span>
                  Create new lead booking from this stay
                  <span className="mt-1 block text-sm font-normal text-slate-600">
                    Use this for the first room in a multi-room booking. The guest name, phone, booking source, and dates above become the lead booking details.
                  </span>
                </span>
              </label>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="booking_group_id">Attach to existing lead booking</Label>
                <Select id="booking_group_id" name="booking_group_id" defaultValue={params.bookingGroupId ?? ""}>
                  <option value="">No multi-room booking</option>
                  {bookingGroupsForSelect.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.lead_guest_name} - {group.lead_guest_phone} - {formatStayRangeWithNights(group.check_in_date, group.check_out_date)} -{" "}
                      {formatEnumLabel(group.booking_source)}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-slate-500">
                  Select this for the second or later room under the same lead guest booking.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_group_expected_total">Lead booking expected total optional</Label>
                <Input id="booking_group_expected_total" name="booking_group_expected_total" type="number" min={0} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking_group_paid_total">Lead booking paid total optional</Label>
                <Input id="booking_group_paid_total" name="booking_group_paid_total" type="number" min={0} inputMode="numeric" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="booking_group_notes">Lead booking notes optional</Label>
                <Textarea id="booking_group_notes" name="booking_group_notes" rows={3} />
              </div>

              {bookingGroupsForSelect.length ? (
                <div className="rounded-lg border border-brand-sage bg-white p-4 text-sm md:col-span-2">
                  <p className="font-semibold text-brand-deep">Recent lead bookings</p>
                  <div className="mt-3 grid gap-2">
                    {bookingGroupsForSelect.slice(0, 5).map((group) => (
                      <div key={group.id} className="flex flex-col gap-1 rounded-lg bg-brand-ivory p-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-brand-deep">{group.lead_guest_name}</span>
                        <span className="text-slate-600">{formatStayRangeWithNights(group.check_in_date, group.check_out_date)}</span>
                        <span className="text-slate-600">
                          {formatPkr(group.paid_total_amount)} paid / {formatPkr(group.expected_total_amount)} expected
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optional documents</CardTitle>
              <CardDescription>
                Upload documents if they are available now. Staff can still create the guest stay without files.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primary_document">Primary guest ID/passport</Label>
                <Input id="primary_document" name="primary_document" type="file" accept="image/*,.pdf" capture="environment" multiple />
                <p className="text-xs text-slate-500">
                  Upload one or more images/files for the primary guest ID or passport. You can upload files or take a photo from a supported device.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional_documents">Additional guest ID/passports</Label>
                <Input id="additional_documents" name="additional_documents" type="file" accept="image/*,.pdf" capture="environment" multiple />
                <p className="text-xs text-slate-500">
                  Upload ID/passport files for additional guests. You can upload files or take a photo from a supported device.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_proof">Payment Confirmation</Label>
                <Input id="payment_proof" name="payment_proof" type="file" accept="image/*,.pdf" capture="environment" />
                <p className="text-xs text-slate-500">You can upload files or take a photo from a supported device.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supporting_documents">Supporting Documents</Label>
                <Input id="supporting_documents" name="supporting_documents" type="file" accept="image/*,.pdf" capture="environment" multiple />
                <p className="text-xs text-slate-500">
                  Marriage certificate, authorization letter, company letter, or other supporting document. You can upload files or take a photo from a supported device.
                </p>
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
              Add Guest Stay
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

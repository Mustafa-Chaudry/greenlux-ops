import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, LogIn, LogOut, MessageCircle, TriangleAlert } from "lucide-react";
import { updateCheckinStatus, updateGuestRecord } from "@/app/admin/guest-records/actions";
import { PrintButton } from "@/components/admin/print-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import {
  bookingSourceOptions,
  checkinStatusTone,
  formatEnumLabel,
  formatPkr,
  getApprovalMissingRequirements,
  getBalanceDue,
  getCheckinStatusLabel,
  getExpectedAmount,
  getWhatsAppGuestHref,
  guestTagOptions,
  guestTypeOptions,
  isPaymentConfirmed,
  isReadyToApprove,
  maskSensitiveId,
  paymentMethodOptions,
  paymentStatusOptions,
  purposeOptions,
} from "@/lib/check-in/options";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Guest Record Detail",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

type GuestDocument = Database["public"]["Tables"]["guest_documents"]["Row"] & {
  signedUrl: string | null;
};

function findLabel<T extends string>(options: Array<{ value: T; label: string }>, value: T) {
  return options.find((option) => option.value === value)?.label ?? formatEnumLabel(value);
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-brand-ivory p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-brand-deep">{value || "Not provided"}</dd>
    </div>
  );
}

function DocumentGroup({ title, documents }: { title: string; documents: GuestDocument[] }) {
  return (
    <div className="rounded-lg border border-brand-sage bg-white p-4">
      <h3 className="font-semibold text-brand-deep">{title}</h3>
      {!documents.length ? (
        <p className="mt-3 text-sm text-slate-500">No document uploaded.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {documents.map((document) => (
            <div key={document.id} className="flex flex-col gap-2 rounded-lg bg-brand-ivory p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-brand-deep">{document.file_path.split("/").pop()}</p>
                <p className="text-xs text-slate-500">{document.mime_type}</p>
              </div>
              {document.signedUrl ? (
                <Button asChild size="sm" variant="outline">
                  <a href={document.signedUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    View
                  </a>
                </Button>
              ) : (
                <Badge tone="warning">Signed URL unavailable</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function GuestRecordDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const queryParams = await searchParams;
  const { supabase } = await requireRole(managementRoles);

  const [{ data: record, error: recordError }, { data: rooms }, { data: documents }] = await Promise.all([
    supabase.from("guest_checkins").select("*").eq("id", id).single(),
    supabase.from("rooms").select("id,name,status,base_price_pkr").order("name"),
    supabase.from("guest_documents").select("*").eq("checkin_id", id).order("created_at", { ascending: true }),
  ]);

  if (recordError || !record) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Guest record not found</CardTitle>
              <CardDescription>{recordError?.message ?? "The record may have been removed."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/guest-records">Back to guest records</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const documentsWithUrls: GuestDocument[] = await Promise.all(
    (documents ?? []).map(async (document) => {
      const { data } = await supabase.storage.from("guest-documents").createSignedUrl(document.file_path, 60 * 10);
      return { ...document, signedUrl: data?.signedUrl ?? null };
    }),
  );

  const primaryDocuments = documentsWithUrls.filter((document) => document.document_type === "primary_cnic");
  const additionalDocuments = documentsWithUrls.filter((document) => document.document_type === "additional_guest_cnic");
  const paymentDocuments = documentsWithUrls.filter((document) => document.document_type === "payment_proof");
  const guestTypeLabel = guestTypeOptions.find((option) => option.value === record.guest_type)?.label ?? formatEnumLabel(record.guest_type);
  const missingApprovalRequirements = getApprovalMissingRequirements(record);
  const canApprove = isReadyToApprove(record);
  const showApproveAction = record.status === "submitted" || record.status === "under_review";
  const showCheckInAction = record.status === "approved";
  const showCheckOutAction = record.status === "checked_in";
  const isCompleted = record.status === "checked_out";
  const assignedRoom = record.assigned_room_id ? rooms?.find((room) => room.id === record.assigned_room_id) : null;
  const roomName = assignedRoom?.name ?? "To be assigned";
  const expectedAmount = getExpectedAmount(record);
  const balanceDue = getBalanceDue(record);
  const requirements = [
    { label: "Room assigned", complete: Boolean(record.assigned_room_id), missing: "Room not assigned" },
    { label: "CNIC verified", complete: record.cnic_verified, missing: "CNIC not verified" },
    { label: "Payment confirmed", complete: isPaymentConfirmed(record), missing: "Payment not confirmed" },
  ];
  const whatsappActions = [
    {
      label: "Confirm check-in",
      message: `Hello ${record.full_name}, your GreenLux Residency check-in is approved. Room: ${roomName}. Dates: ${record.check_in_date} to ${record.check_out_date}. Thank you.`,
    },
    {
      label: "Request payment proof",
      message: `Hello ${record.full_name}, please share/upload your payment proof for your GreenLux Residency booking so we can complete verification. Thank you.`,
    },
    {
      label: "Request CNIC verification",
      message: `Hello ${record.full_name}, please upload or share your CNIC/passport document for GreenLux Residency check-in verification. Thank you.`,
    },
    {
      label: "Send checkout thanks",
      message: `Hello ${record.full_name}, thank you for staying with GreenLux Residency. We hope you had a comfortable stay and wish you safe travels.`,
    },
  ];

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin/guest-records">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to guest records
          </Link>
        </Button>

        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Guest record</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">{record.full_name}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {record.check_in_date} to {record.check_out_date} - {record.number_of_guests} guest(s)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={checkinStatusTone[record.status]}>{getCheckinStatusLabel(record.status)}</Badge>
            <Badge tone={record.guest_type === "admin_created" ? "info" : "neutral"}>{guestTypeLabel}</Badge>
            <Badge tone={record.cnic_verified ? "success" : "warning"}>CNIC {record.cnic_verified ? "verified" : "pending"}</Badge>
            <Badge tone={record.payment_verified ? "success" : "warning"}>
              Payment proof {record.payment_verified ? "verified" : "pending"}
            </Badge>
            <Badge tone="info">{formatEnumLabel(record.payment_status)}</Badge>
          </div>
        </header>

        {queryParams.message ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">{queryParams.message}</div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <Card className="print-summary">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Printable guest summary</CardTitle>
                  <CardDescription>Admin-only operational summary for front desk or stay records.</CardDescription>
                </div>
                <div className="no-print">
                  <PrintButton />
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Guest" value={record.full_name} />
                  <InfoRow label="Phone" value={record.phone} />
                  <InfoRow label="CNIC / passport" value={maskSensitiveId(record.cnic_passport_number)} />
                  <InfoRow label="Stay dates" value={`${record.check_in_date} to ${record.check_out_date}`} />
                  <InfoRow label="Room" value={roomName} />
                  <InfoRow label="Expected total" value={formatPkr(expectedAmount)} />
                  <InfoRow label="Paid amount" value={formatPkr(record.amount_paid_pkr)} />
                  <InfoRow label="Balance due" value={formatPkr(balanceDue)} />
                  <InfoRow label="CNIC verified" value={record.cnic_verified ? "Yes" : "No"} />
                  <InfoRow label="Payment verified" value={record.payment_verified ? "Yes" : "No"} />
                </dl>
                <div className="mt-3 rounded-lg bg-brand-ivory p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Internal notes</dt>
                  <dd className="mt-1 text-sm leading-6 text-brand-deep">{record.internal_notes || "None"}</dd>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Guest information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoRow label="Full name" value={record.full_name} />
                  <InfoRow label="Phone" value={record.phone} />
                  <InfoRow label="Email" value={record.email} />
                  <InfoRow label="Guest type" value={guestTypeLabel} />
                  <InfoRow label="CNIC / passport" value={record.cnic_passport_number} />
                  <InfoRow label="Address" value={record.address} />
                  <InfoRow label="Travelling from" value={record.city_country_from} />
                  <InfoRow label="Arrival time" value={record.estimated_arrival_time} />
                  <InfoRow label="Purpose" value={findLabel(purposeOptions, record.purpose_of_visit)} />
                  <InfoRow label="Booking source" value={findLabel(bookingSourceOptions, record.booking_source)} />
                  <InfoRow label="Stayed before" value={record.has_stayed_before ? "Yes" : "No"} />
                  <InfoRow label="Payment method" value={findLabel(paymentMethodOptions, record.payment_method)} />
                  <InfoRow label="Advance claimed" value={formatPkr(record.advance_paid_amount_pkr)} />
                </dl>
                <div className="mt-3 rounded-lg bg-brand-ivory p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Special requests</dt>
                  <dd className="mt-1 text-sm leading-6 text-brand-deep">{record.special_requests || "None"}</dd>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WhatsApp quick actions</CardTitle>
                <CardDescription>Open WhatsApp with a prefilled message to the guest.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {whatsappActions.map((action) => (
                  <Button key={action.label} asChild variant="outline">
                    <a href={getWhatsAppGuestHref(record.phone, action.message)} target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      {action.label}
                    </a>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Links are short-lived signed URLs from the private storage bucket.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <DocumentGroup title="Primary CNIC / passport" documents={primaryDocuments} />
                <DocumentGroup title="Additional guest CNIC/passports" documents={additionalDocuments} />
                <DocumentGroup title="Payment proof" documents={paymentDocuments} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Admin actions</CardTitle>
              <CardDescription>Assign room, confirm payment, verify documents, and add internal notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-5 grid gap-3 rounded-lg border border-brand-sage bg-white p-4 sm:grid-cols-3">
                <InfoRow label="Expected total" value={formatPkr(expectedAmount)} />
                <InfoRow label="Paid amount" value={formatPkr(record.amount_paid_pkr)} />
                <InfoRow label="Balance due" value={formatPkr(balanceDue)} />
              </div>

              <div className="mb-5 space-y-4 rounded-lg border border-brand-sage bg-brand-ivory p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-deep">Check-in status</p>
                    <div className="mt-2">
                      <Badge tone={checkinStatusTone[record.status]}>{getCheckinStatusLabel(record.status)}</Badge>
                    </div>
                  </div>
                  {showApproveAction ? (
                    <form action={updateCheckinStatus}>
                      <input type="hidden" name="id" value={record.id} />
                      <input type="hidden" name="status" value="approved" />
                      <Button type="submit" disabled={!canApprove}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Approve Check-in
                      </Button>
                    </form>
                  ) : null}
                </div>

                {isCompleted ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
                    This guest has been checked out. The stay is complete.
                  </div>
                ) : null}

                <div className="rounded-lg border border-brand-sage bg-white p-3">
                  <p className="text-sm font-semibold text-brand-deep">Requirements Checklist</p>
                  <div className="mt-3 grid gap-2">
                    {requirements.map((requirement) => (
                      <div key={requirement.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-700">{requirement.label}</span>
                        <Badge tone={requirement.complete ? "success" : "warning"}>
                          {requirement.complete ? "Complete" : requirement.missing}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {missingApprovalRequirements.length > 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                      Missing before approval
                    </p>
                    <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
                      {missingApprovalRequirements.map((requirement) => (
                        <li key={requirement}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-green-700">All approval requirements are complete.</p>
                )}

                {!isCompleted && (showCheckInAction || showCheckOutAction) ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {showCheckInAction ? (
                      <form action={updateCheckinStatus}>
                        <input type="hidden" name="id" value={record.id} />
                        <input type="hidden" name="status" value="checked_in" />
                        <Button type="submit" variant="outline" className="w-full">
                          <LogIn className="h-4 w-4" aria-hidden="true" />
                          Mark as Checked-in
                        </Button>
                      </form>
                    ) : null}
                    {showCheckOutAction ? (
                      <form action={updateCheckinStatus}>
                        <input type="hidden" name="id" value={record.id} />
                        <input type="hidden" name="status" value="checked_out" />
                        <Button type="submit" variant="outline" className="w-full">
                          <LogOut className="h-4 w-4" aria-hidden="true" />
                          Mark as Checked-out
                        </Button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <form action={updateGuestRecord} className="space-y-4">
                <input type="hidden" name="id" value={record.id} />

                <div className="space-y-2">
                  <Label htmlFor="assigned_room_id">Assigned room</Label>
                  <Select id="assigned_room_id" name="assigned_room_id" defaultValue={record.assigned_room_id ?? ""}>
                    <option value="">Not assigned</option>
                    {(rooms ?? []).map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({formatEnumLabel(room.status)})
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="agreed_room_rate_pkr">Agreed room rate</Label>
                    <Input id="agreed_room_rate_pkr" name="agreed_room_rate_pkr" type="number" min={0} defaultValue={record.agreed_room_rate_pkr ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advance_paid_amount_pkr">Advance paid</Label>
                    <Input id="advance_paid_amount_pkr" name="advance_paid_amount_pkr" type="number" min={0} defaultValue={record.advance_paid_amount_pkr ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_expected_amount_pkr">Total expected</Label>
                    <Input id="total_expected_amount_pkr" name="total_expected_amount_pkr" type="number" min={0} defaultValue={record.total_expected_amount_pkr ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount_paid_pkr">Amount paid</Label>
                    <Input id="amount_paid_pkr" name="amount_paid_pkr" type="number" min={0} defaultValue={record.amount_paid_pkr ?? ""} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payment_status">Payment status</Label>
                    <Select id="payment_status" name="payment_status" defaultValue={record.payment_status}>
                      {paymentStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest_tag">Guest tag</Label>
                    <Select id="guest_tag" name="guest_tag" defaultValue={record.guest_tag}>
                      {guestTagOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 rounded-lg border border-brand-sage bg-brand-ivory p-4">
                  <label className="flex items-center gap-3 text-sm font-medium text-brand-deep">
                    <input type="checkbox" name="cnic_verified" defaultChecked={record.cnic_verified} className="h-4 w-4 accent-brand-fresh" />
                    CNIC/passport received and verified
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium text-brand-deep">
                    <input type="checkbox" name="payment_verified" defaultChecked={record.payment_verified} className="h-4 w-4 accent-brand-fresh" />
                    Payment proof verified
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internal_notes">Internal notes</Label>
                  <Textarea id="internal_notes" name="internal_notes" defaultValue={record.internal_notes ?? ""} rows={6} />
                </div>

                <Button type="submit" className="w-full">Save admin changes</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

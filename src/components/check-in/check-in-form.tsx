"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Home,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UploadCloud,
  WalletCards,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bankTransferDetails, bookingSourceOptions, paymentMethodOptions, purposeOptions } from "@/lib/check-in/options";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";
import { createClient } from "@/lib/supabase/browser";
import { checkInFormSchema, type CheckInFormInput, type CheckInFormValues } from "@/lib/validation/check-in";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["users_profile"]["Row"];
type DocumentType = Database["public"]["Enums"]["document_type"];

type CheckInFormProps = {
  profile: Profile;
};

type SubmittedStay = {
  guestName: string;
  paymentProofReceived: boolean;
};

const conciergeSteps = [
  "Guest details",
  "ID/payment upload",
  "Arrival details",
  "Review/submission",
  "Welcome / next steps",
];

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-medium text-red-700">{message}</p>;
}

function sanitizeFileName(fileName: string) {
  const cleaned = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return cleaned || "document";
}

function getWifiAccessMessage(guestName?: string) {
  const trimmedName = guestName?.trim();

  if (!trimmedName) {
    return "Hello GreenLux team, I have completed my check-in and would like Wi-Fi access.";
  }

  return `Hello GreenLux team, I have completed my check-in and would like Wi-Fi access. My name is ${trimmedName}.`;
}

function StatusPill({
  icon: Icon,
  label,
  value,
  tone = "info",
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "blue";
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-brand-sage bg-white p-3">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-ivory text-brand-fresh">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-brand-deep">{label}</p>
        <Badge tone={tone} className="mt-1">{value}</Badge>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-brand-sage/70 bg-white/90">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-deep text-sm font-semibold text-white">
            {step}
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

async function uploadDocument({
  checkinId,
  documentType,
  file,
  userId,
}: {
  checkinId: string;
  documentType: DocumentType;
  file: File;
  userId: string;
}) {
  const supabase = createClient();
  const filePath = `${userId}/${checkinId}/${documentType}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from("guest-documents").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: documentError } = await supabase.from("guest_documents").insert({
    checkin_id: checkinId,
    uploaded_by: userId,
    document_type: documentType,
    document_status: "pending",
    file_path: filePath,
    file_url: null,
    mime_type: file.type,
  });

  if (documentError) {
    throw new Error(documentError.message);
  }
}

export function CheckInForm({ profile }: CheckInFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedStay, setSubmittedStay] = useState<SubmittedStay | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckInFormInput, unknown, CheckInFormValues>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      email: profile.email ?? "",
      number_of_guests: 1,
      has_stayed_before: "no",
      payment_method: "cash",
      purpose_of_visit: "",
      booking_source: "direct_whatsapp_call",
      consent: false,
    },
  });

  const paymentMethod = useWatch({ control, name: "payment_method" });
  const paymentProofRequired = paymentMethod === "bank_transfer" || paymentMethod === "online_payment";

  async function onSubmit(values: CheckInFormValues) {
    setSubmitError(null);
    const checkinId = crypto.randomUUID();

    const { error: insertError } = await supabase.from("guest_checkins").insert({
      id: checkinId,
      guest_user_id: profile.id,
      full_name: values.full_name,
      phone: values.phone,
      email: values.email,
      cnic_passport_number: values.cnic_passport_number,
      address: values.address,
      city_country_from: values.city_country_from,
      check_in_date: values.check_in_date,
      check_out_date: values.check_out_date,
      estimated_arrival_time: values.estimated_arrival_time || null,
      number_of_guests: values.number_of_guests,
      purpose_of_visit: values.purpose_of_visit,
      booking_source: values.booking_source,
      has_stayed_before: values.has_stayed_before === "yes",
      payment_method: values.payment_method,
      advance_paid_amount_pkr: values.advance_paid_amount_pkr ?? null,
      special_requests: values.special_requests || null,
    });

    if (insertError) {
      setSubmitError(insertError.message);
      return;
    }

    try {
      const primaryFile = values.primary_document.item(0);
      if (!primaryFile) {
        throw new Error("Primary CNIC/passport upload is required.");
      }

      await uploadDocument({
        checkinId,
        documentType: "primary_cnic",
        file: primaryFile,
        userId: profile.id,
      });

      const additionalFiles = values.additional_documents ? Array.from(values.additional_documents) : [];
      for (const file of additionalFiles) {
        await uploadDocument({
          checkinId,
          documentType: "additional_guest_cnic",
          file,
          userId: profile.id,
        });
      }

      const paymentProof = values.payment_proof?.item(0);
      if (paymentProof) {
        await uploadDocument({
          checkinId,
          documentType: "payment_proof",
          file: paymentProof,
          userId: profile.id,
        });
      }

      setSubmittedStay({
        guestName: values.full_name,
        paymentProofReceived: Boolean(paymentProof),
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Check-in was saved, but an upload failed.");
    }
  }

  if (submittedStay) {
    const wifiHref = getWhatsAppHref(getWifiAccessMessage(submittedStay.guestName));
    const contactHref = getWhatsAppHref(
      `Hello GreenLux team, I have completed my check-in. My name is ${submittedStay.guestName}.`,
    );

    return (
      <div className="grid gap-5">
        <Card className="overflow-hidden border-green-200 bg-white shadow-soft">
          <CardHeader className="bg-green-50/80">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white">
              <CheckCircle2 className="h-7 w-7 text-green-700" aria-hidden="true" />
            </div>
            <CardTitle>Welcome to GreenLux, {submittedStay.guestName}</CardTitle>
            <CardDescription>
              Your check-in details have been received. Our staff will review your documents and payment information
              before updating your stay record.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
            <StatusPill icon={ShieldCheck} label="ID received" value="Pending review" tone="warning" />
            <StatusPill
              icon={WalletCards}
              label={submittedStay.paymentProofReceived ? "Payment proof received" : "Payment proof"}
              value={submittedStay.paymentProofReceived ? "Pending review" : "Not uploaded"}
              tone={submittedStay.paymentProofReceived ? "warning" : "neutral"}
            />
            <StatusPill icon={Home} label="Room assigned" value="Pending staff update" tone="neutral" />
            <StatusPill icon={Clock3} label="Arrival information received" value="Received" tone="success" />
          </CardContent>
        </Card>

        <Card className="border-brand-gold/40 bg-white">
          <CardHeader>
            <CardTitle>Arrival Guide</CardTitle>
            <CardDescription>
              These are the next helpful links for your stay. Private access details are shared by staff directly.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild className="justify-start">
              <a href={contactHref} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp manager
              </a>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <a href={siteConfig.googleMapsHref} target="_blank" rel="noreferrer">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Directions to GreenLux
              </a>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <a href={wifiHref} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Request Wi-Fi Access
              </a>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <a href="/terms">
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                House rules
              </a>
            </Button>
            <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm sm:col-span-2">
              <p className="font-semibold text-brand-deep">Contact details</p>
              <p className="mt-1 text-slate-600">{siteConfig.phoneDisplay}</p>
              <p className="text-slate-600">{siteConfig.shortAddress}</p>
            </div>
            <Button asChild variant="secondary" className="sm:col-span-2">
              <a href="/dashboard">
                Back to dashboard
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-brand-gold/40 bg-brand-deep text-white">
        <CardContent className="grid gap-3 p-5 sm:grid-cols-5">
          {conciergeSteps.map((step, index) => (
            <div key={step} className="rounded-lg border border-white/20 bg-white/10 p-3">
              <p className="text-xs font-semibold uppercase text-brand-gold">Step {index + 1}</p>
              <p className="mt-1 text-sm font-semibold">{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {submitError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</div>
      ) : null}

      <StepCard
        step={1}
        title="Guest details"
        description="Use the same name and contact details you used for your booking."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...register("full_name")} />
            <FieldError message={errors.full_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile / WhatsApp</Label>
            <Input id="phone" {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
            <FieldError message={errors.address?.message} />
          </div>
        </div>
      </StepCard>

      <StepCard
        step={2}
        title="ID/payment upload"
        description="Upload your ID and, if you paid by transfer or online payment, attach payment proof for staff review."
      >
        <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="cnic_passport_number">CNIC / passport number</Label>
            <Input id="cnic_passport_number" {...register("cnic_passport_number")} />
            <FieldError message={errors.cnic_passport_number?.message} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary_document">Primary CNIC/passport upload</Label>
              <Input id="primary_document" type="file" accept=".jpg,.jpeg,.png,.pdf" {...register("primary_document")} />
              <p className="text-xs text-slate-500">JPG, PNG, or PDF up to 10 MB.</p>
              <FieldError message={errors.primary_document?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additional_documents">Additional guest CNIC/passport uploads</Label>
              <Input
                id="additional_documents"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                multiple
                {...register("additional_documents")}
              />
              <p className="text-xs text-slate-500">Optional. Upload multiple files if needed.</p>
              <FieldError message={errors.additional_documents?.message} />
            </div>
          </div>

          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone="info">Bank transfer details</Badge>
              <span className="text-xs text-slate-500">Upload proof if you pay by bank transfer or online payment.</span>
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Account Name</dt>
                <dd className="font-semibold text-brand-deep">{bankTransferDetails.accountName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Bank</dt>
                <dd className="font-semibold text-brand-deep">{bankTransferDetails.bank}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Account Number</dt>
                <dd className="font-semibold text-brand-deep">{bankTransferDetails.accountNumber}</dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment method</Label>
              <Select id="payment_method" {...register("payment_method")}>
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance_paid_amount_pkr">Advance paid amount, if already paid</Label>
              <Input id="advance_paid_amount_pkr" type="number" min={0} step="1" {...register("advance_paid_amount_pkr")} />
              <FieldError message={errors.advance_paid_amount_pkr?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_proof">Proof of payment {paymentProofRequired ? "(required)" : "(optional)"}</Label>
            <Input id="payment_proof" type="file" accept=".jpg,.jpeg,.png,.pdf" {...register("payment_proof")} />
            <p className="text-xs text-slate-500">
              Staff will review uploaded proof. This screen does not mark payment as confirmed.
            </p>
            <FieldError message={errors.payment_proof?.message} />
          </div>
        </div>
      </StepCard>

      <StepCard
        step={3}
        title="Arrival details"
        description="Tell us when you are arriving, who is travelling, and how your booking was made."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="check_in_date">Check-in date</Label>
            <Input id="check_in_date" type="date" {...register("check_in_date")} />
            <FieldError message={errors.check_in_date?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_out_date">Check-out date</Label>
            <Input id="check_out_date" type="date" {...register("check_out_date")} />
            <FieldError message={errors.check_out_date?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimated_arrival_time">Estimated arrival time</Label>
            <Input id="estimated_arrival_time" type="time" {...register("estimated_arrival_time")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number_of_guests">Number of guests</Label>
            <Input id="number_of_guests" type="number" min={1} {...register("number_of_guests", { valueAsNumber: true })} />
            <FieldError message={errors.number_of_guests?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city_country_from">City/country travelling from</Label>
            <Input id="city_country_from" {...register("city_country_from")} />
            <FieldError message={errors.city_country_from?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose_of_visit">Purpose of visit required</Label>
            <Select id="purpose_of_visit" {...register("purpose_of_visit")}>
              <option value="">Select purpose</option>
              {purposeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <FieldError message={errors.purpose_of_visit?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking_source">Booking source</Label>
            <Select id="booking_source" {...register("booking_source")}>
              {bookingSourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="has_stayed_before">Have you stayed with GreenLux before?</Label>
            <Select id="has_stayed_before" {...register("has_stayed_before")}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
        </div>
      </StepCard>

      <StepCard
        step={4}
        title="Review/submission"
        description="Add anything staff should know, then submit. Missing review items will not block the hotel workflow."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="special_requests">Special requests / comments</Label>
            <Textarea id="special_requests" rows={4} {...register("special_requests")} />
            <FieldError message={errors.special_requests?.message} />
          </div>
          <label className="flex gap-3 rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm leading-6 text-slate-700">
            <input type="checkbox" className="mt-1 h-4 w-4 flex-none accent-brand-fresh" {...register("consent")} />
            <span>
              I confirm the information provided is accurate and may be used by GreenLux Residency for booking
              verification, security, payment confirmation, and stay-related communication.
            </span>
          </label>
          <FieldError message={errors.consent?.message} />
        </div>
      </StepCard>

      <Card className="border-brand-gold/40 bg-white">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-brand-deep">Ready for Welcome / next steps?</p>
            <p className="mt-1 text-sm text-slate-600">
              After submission, you will see your arrival guide and request options.
            </p>
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UploadCloud className="h-4 w-4" aria-hidden="true" />}
            {isSubmitting ? "Submitting..." : "Submit check-in"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

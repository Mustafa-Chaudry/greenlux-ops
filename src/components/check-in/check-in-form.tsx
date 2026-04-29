"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bankTransferDetails, bookingSourceOptions, paymentMethodOptions, purposeOptions } from "@/lib/check-in/options";
import { createClient } from "@/lib/supabase/browser";
import { checkInFormSchema, type CheckInFormInput, type CheckInFormValues } from "@/lib/validation/check-in";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["users_profile"]["Row"];
type DocumentType = Database["public"]["Enums"]["document_type"];

type CheckInFormProps = {
  profile: Profile;
};

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
  const [submitted, setSubmitted] = useState(false);
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

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Check-in was saved, but an upload failed.");
    }
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-white shadow-soft">
        <CardHeader>
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
            <CheckCircle2 className="h-7 w-7 text-green-700" aria-hidden="true" />
          </div>
          <CardTitle>Your check-in details have been received.</CardTitle>
          <CardDescription>
            GreenLux management will verify your information. You can return to your dashboard to view your
            submitted stay record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/dashboard">Back to dashboard</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Guest details</CardTitle>
          <CardDescription>Use the same name and contact details you used for your booking.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identity verification</CardTitle>
          <CardDescription>Upload CNIC/passport documents for booking verification and security records.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stay details</CardTitle>
          <CardDescription>Tell us when you are arriving and who is travelling.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking source</CardTitle>
          <CardDescription>Help management match your check-in to the correct reservation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Payment proof is required for bank transfer or online payment.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="payment_proof">Proof of payment {paymentProofRequired ? "(required)" : "(optional)"}</Label>
            <Input id="payment_proof" type="file" accept=".jpg,.jpeg,.png,.pdf" {...register("payment_proof")} />
            <FieldError message={errors.payment_proof?.message} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes and consent</CardTitle>
          <CardDescription>Share any arrival notes or special requests before submitting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UploadCloud className="h-4 w-4" aria-hidden="true" />}
        {isSubmitting ? "Submitting..." : "Submit check-in"}
      </Button>
    </form>
  );
}

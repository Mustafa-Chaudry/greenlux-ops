import { z } from "zod";
import { allowedUploadMimeTypes, maxUploadSizeBytes } from "@/lib/validation/uploads";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional());
const purposeOfVisitSchema = z.enum(["family_visit", "business", "medical", "tourism", "event_wedding", "other"]);

const fileListSchema = z.custom<FileList>((value) => value instanceof FileList, "Please choose a file.");

function validateFiles(files: FileList | undefined, required: boolean) {
  if (!files || files.length === 0) {
    return !required;
  }

  return Array.from(files).every(
    (file) => allowedUploadMimeTypes.includes(file.type as (typeof allowedUploadMimeTypes)[number]) && file.size <= maxUploadSizeBytes,
  );
}

export const checkInFormSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name is required."),
    phone: z.string().trim().min(7, "Mobile / WhatsApp number is required."),
    email: z.email("A valid email address is required."),
    cnic_passport_number: z.string().trim().min(4, "CNIC or passport number is required."),
    address: z.string().trim().min(5, "Address is required."),
    primary_document: fileListSchema,
    check_in_date: z.string().min(1, "Check-in date is required."),
    check_out_date: z.string().min(1, "Check-out date is required."),
    number_of_guests: z.coerce.number().int().min(1, "At least one guest is required.").max(20),
    additional_documents: fileListSchema.optional(),
    estimated_arrival_time: z.string().optional(),
    city_country_from: z.string().trim().min(2, "City/country travelling from is required."),
    purpose_of_visit: z
      .union([z.literal(""), purposeOfVisitSchema])
      .refine((value) => value !== "", "Please select the purpose of visit.")
      .transform((value) => value as z.infer<typeof purposeOfVisitSchema>),
    booking_source: z.enum(["booking_com", "airbnb", "direct_whatsapp_call", "referral", "other"]),
    has_stayed_before: z.enum(["yes", "no"]),
    payment_method: z.enum(["cash", "bank_transfer", "online_payment", "other"]),
    advance_paid_amount_pkr: optionalNumber,
    payment_proof: fileListSchema.optional(),
    special_requests: z.string().trim().max(1500).optional(),
    consent: z.boolean().refine((value) => value, "Consent is required before submitting."),
  })
  .superRefine((data, ctx) => {
    if (data.check_in_date && data.check_out_date && data.check_out_date <= data.check_in_date) {
      ctx.addIssue({
        code: "custom",
        path: ["check_out_date"],
        message: "Check-out date must be after check-in date.",
      });
    }

    if (!validateFiles(data.primary_document, true)) {
      ctx.addIssue({
        code: "custom",
        path: ["primary_document"],
        message: "Upload one JPG, PNG, or PDF file up to 10 MB.",
      });
    }

    if (!validateFiles(data.additional_documents, false)) {
      ctx.addIssue({
        code: "custom",
        path: ["additional_documents"],
        message: "Additional documents must be JPG, PNG, or PDF files up to 10 MB each.",
      });
    }

    const paymentProofRequired = data.payment_method === "bank_transfer" || data.payment_method === "online_payment";
    if (!validateFiles(data.payment_proof, paymentProofRequired)) {
      ctx.addIssue({
        code: "custom",
        path: ["payment_proof"],
        message: paymentProofRequired
          ? "Payment proof is required for bank transfer or online payment."
          : "Payment proof must be JPG, PNG, or PDF up to 10 MB.",
      });
    }
  });

export type CheckInFormInput = z.input<typeof checkInFormSchema>;
export type CheckInFormValues = z.output<typeof checkInFormSchema>;

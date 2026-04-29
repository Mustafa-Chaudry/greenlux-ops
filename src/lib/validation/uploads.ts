export const allowedUploadMimeTypes = ["image/jpeg", "image/png", "application/pdf"] as const;
export const maxUploadSizeBytes = 10 * 1024 * 1024;

export type AllowedUploadMimeType = (typeof allowedUploadMimeTypes)[number];

export function isAllowedUploadMimeType(mimeType: string): mimeType is AllowedUploadMimeType {
  return allowedUploadMimeTypes.includes(mimeType as AllowedUploadMimeType);
}

export function isAllowedUploadSize(sizeBytes: number) {
  return sizeBytes > 0 && sizeBytes <= maxUploadSizeBytes;
}


export const allowedUploadMimeTypes = ["image/jpeg", "image/png", "application/pdf"] as const;
export const maxUploadSizeBytes = 10 * 1024 * 1024;

export type AllowedUploadMimeType = (typeof allowedUploadMimeTypes)[number];

export function isAllowedUploadMimeType(mimeType: string): mimeType is AllowedUploadMimeType {
  return allowedUploadMimeTypes.includes(mimeType as AllowedUploadMimeType);
}

export function isAllowedUploadSize(sizeBytes: number) {
  return sizeBytes > 0 && sizeBytes <= maxUploadSizeBytes;
}

export async function hasValidMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  return isJpeg || isPng || isPdf;
}


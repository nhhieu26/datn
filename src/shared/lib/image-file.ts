export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];

async function hasValidImageSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isJpeg =
    bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const isPng = bytes.length >= png.length && png.every((b, i) => bytes[i] === b);
  return isJpeg || isPng;
}

/** PNG/JPG thật (kiểm tra magic bytes), tối đa 5MB. */
export async function isValidImageFile(file: File): Promise<boolean> {
  return (
    ALLOWED_IMAGE_TYPES.includes(file.type) &&
    file.size > 0 &&
    file.size <= MAX_IMAGE_SIZE &&
    (await hasValidImageSignature(file))
  );
}

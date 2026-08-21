const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB — stored inline in Postgres, not blob storage.
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type PhotoResult = { ok: true; dataUrl: string } | { ok: false; error: string };

/** Reads an uploaded photo File into a `data:` URL for inline storage on
 * User.image / Instructor.avatarUrl (both plain Postgres `text` columns —
 * no external storage wired up, per docs/security.md §9). */
export async function readPhotoUpload(file: File | null): Promise<PhotoResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "Choose an image file." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Only JPG, PNG, WebP, or GIF images are allowed." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false, error: "Image must be 2MB or smaller." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return { ok: true, dataUrl: `data:${file.type};base64,${buffer.toString("base64")}` };
}

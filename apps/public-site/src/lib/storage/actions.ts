"use server";

import { requireCmsUser } from "@/lib/auth/guard";
import { uploadToR2 } from "./r2";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

export type UploadImageResult = { url: string; error?: undefined } | { url?: undefined; error: string };

// Called from the admin content form's image fields (see ImageUrlField).
// Auth-gated here, not just at the UI layer, per the Server Actions security
// note: these are reachable by direct POST, not only from this form.
export async function uploadImageAction(formData: FormData): Promise<UploadImageResult> {
  await requireCmsUser();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file selected." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Unsupported file type — use JPEG, PNG, WebP, GIF, or SVG." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "File is larger than 5MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const key = `uploads/${crypto.randomUUID()}.${extension}`;

  try {
    const url = await uploadToR2(key, buffer, file.type);
    return { url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }
}

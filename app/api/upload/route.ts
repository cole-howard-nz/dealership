import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "../../lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024;

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  // ── URL-to-Blob path ──────────────────────────────────────────────────────
  const urlField = formData.get("url");
  if (typeof urlField === "string") {
    if (!urlField.startsWith("https://")) {
      return NextResponse.json({ error: "Only HTTPS URLs are allowed" }, { status: 400 });
    }

    let fetchRes: Response;
    try {
      fetchRes = await fetch(urlField, { redirect: "follow" });
    } catch {
      return NextResponse.json({ error: "Could not fetch image URL" }, { status: 400 });
    }
    if (!fetchRes.ok) {
      return NextResponse.json({ error: "Remote URL returned an error" }, { status: 400 });
    }

    const contentType = (fetchRes.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "URL does not point to a supported image (JPG, PNG, WebP)" }, { status: 400 });
    }

    const buffer = await fetchRes.arrayBuffer();
    if (buffer.byteLength > MAX_SIZE) {
      return NextResponse.json({ error: "Remote image exceeds 4 MB" }, { status: 400 });
    }

    const ext = EXT_MAP[contentType] ?? "jpg";
    const filename = `vehicles/${crypto.randomUUID()}.${ext}`;
    const blob = await put(filename, buffer, { access: "public", contentType });
    return NextResponse.json({ url: blob.url });
  }

  // ── File upload path ──────────────────────────────────────────────────────
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG and WebP are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be under 4 MB" }, { status: 400 });
  }

  const ext = EXT_MAP[file.type] ?? file.name.split(".").pop() ?? "jpg";
  const filename = `vehicles/${crypto.randomUUID()}.${ext}`;
  const blob = await put(filename, file, { access: "public" });
  return NextResponse.json({ url: blob.url });
}

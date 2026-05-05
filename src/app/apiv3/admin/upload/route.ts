import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { AdminAuthError, requireAdmin } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, detectExtension, uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    throw e;
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (err: any) {
    return NextResponse.json(
      { error: `multipart inválido: ${err?.message ?? String(err)}` },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Campo 'file' ausente" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Arquivo > 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)` },
      { status: 400 },
    );
  }
  const ext = detectExtension(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: `Tipo não permitido: ${file.type}. Use PNG/JPG/WEBP/GIF/SVG.` },
      { status: 400 },
    );
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const folder = String(form.get("folder") ?? "girassol");
    const result = await uploadFile(buffer, {
      filename,
      contentType: file.type,
      folder,
    });
    return NextResponse.json({ url: result.url, size: result.size, type: result.contentType });
  } catch (err: any) {
    return NextResponse.json(
      { error: `upload falhou: ${err?.message ?? String(err)}` },
      { status: 500 },
    );
  }
}

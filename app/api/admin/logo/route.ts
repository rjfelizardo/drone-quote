import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const companyId = String(formData.get("company_id") ?? "default");

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato inválido. Use PNG, JPG, WEBP ou SVG." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande. Máximo 2 MB." },
      { status: 400 }
    );
  }

  const extension = file.name.split(".").pop() || "png";
  const path = `${companyId}/logo-${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from("logos")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("logos")
    .getPublicUrl(path);

  const { error: updateError } = await supabaseAdmin
    .from("settings")
    .update({ logo_url: publicUrlData.publicUrl })
    .eq("company_id", companyId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, logo_url: publicUrlData.publicUrl });
}

export async function DELETE(request: NextRequest) {
  const { companyId } = await request.json();

  const { error } = await supabaseAdmin
    .from("settings")
    .update({ logo_url: null })
    .eq("company_id", String(companyId ?? "default"));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

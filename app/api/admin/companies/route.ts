import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("company_id, company_name")
    .order("company_id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const companyName = String(body.company_name ?? "").trim();

  if (!companyName) {
    return NextResponse.json(
      { error: "Informe o nome da empresa." },
      { status: 400 }
    );
  }

  const companyId = slugify(companyName);

  if (!companyId) {
    return NextResponse.json(
      { error: "Nome inválido para gerar a URL da empresa." },
      { status: 400 }
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("settings")
    .select("company_id")
    .eq("company_id", companyId)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: `Já existe uma empresa com a URL /c/${companyId}.` },
      { status: 409 }
    );
  }

  const { error } = await supabaseAdmin.from("settings").insert({
    company_id: companyId,
    company_name: companyName,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, company_id: companyId });
}

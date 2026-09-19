import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data: companies, error } = await supabaseAdmin
    .from("settings")
    .select("company_id, company_name")
    .order("company_id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Conta quantos leads cada empresa já recebeu, pra mostrar na tela
  // de gestão (não bloqueia a resposta se falhar, só fica sem o número).
  const withCounts = await Promise.all(
    (companies ?? []).map(async (c) => {
      const { count } = await supabaseAdmin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("company_id", c.company_id);
      return { ...c, lead_count: count ?? 0 };
    })
  );

  return NextResponse.json(withCounts);
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

export async function DELETE(request: NextRequest) {
  const { company_id: companyId } = await request.json();

  if (!companyId || companyId === "default") {
    return NextResponse.json(
      { error: "Essa empresa não pode ser excluída." },
      { status: 400 }
    );
  }

  // Apaga o histórico de orçamentos e leads dessa empresa antes de
  // remover a configuração — evita deixar dados órfãos no banco.
  await supabaseAdmin.from("quotes").delete().eq("company_id", companyId);
  await supabaseAdmin.from("leads").delete().eq("company_id", companyId);

  // Tenta limpar o logo do Storage também (best-effort — se falhar,
  // não impede a exclusão da empresa).
  const { data: files } = await supabaseAdmin.storage
    .from("logos")
    .list(companyId);
  if (files && files.length > 0) {
    await supabaseAdmin.storage
      .from("logos")
      .remove(files.map((f) => `${companyId}/${f.name}`));
  }

  const { error } = await supabaseAdmin
    .from("settings")
    .delete()
    .eq("company_id", companyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

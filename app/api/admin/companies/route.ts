import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSession, hashPassword } from "@/lib/auth";

async function requireSuperAdmin() {
  const session = await getSession();
  return session?.role === "super_admin";
}

export async function GET() {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const { data: companies, error } = await supabaseAdmin
    .from("settings")
    .select("company_id, company_name")
    .order("company_id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Junta contagem de leads e o e-mail de acesso de cada empresa.
  const withDetails = await Promise.all(
    (companies ?? []).map(async (c) => {
      const { count } = await supabaseAdmin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("company_id", c.company_id);

      const { data: admin } = await supabaseAdmin
        .from("admin_users")
        .select("email")
        .eq("company_id", c.company_id)
        .eq("role", "company")
        .single();

      return { ...c, lead_count: count ?? 0, admin_email: admin?.email ?? null };
    })
  );

  return NextResponse.json(withDetails);
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
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const body = await request.json();
  const companyName = String(body.company_name ?? "").trim();
  const adminEmail = String(body.admin_email ?? "").trim().toLowerCase();
  const adminPassword = String(body.admin_password ?? "");

  if (!companyName) {
    return NextResponse.json(
      { error: "Informe o nome da empresa." },
      { status: 400 }
    );
  }
  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Informe o e-mail e a senha de acesso da empresa." },
      { status: 400 }
    );
  }
  if (adminPassword.length < 6) {
    return NextResponse.json(
      { error: "A senha precisa ter pelo menos 6 caracteres." },
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

  const { data: existingCompany } = await supabaseAdmin
    .from("settings")
    .select("company_id")
    .eq("company_id", companyId)
    .single();

  if (existingCompany) {
    return NextResponse.json(
      { error: `Já existe uma empresa com a URL /c/${companyId}.` },
      { status: 409 }
    );
  }

  const { data: existingEmail } = await supabaseAdmin
    .from("admin_users")
    .select("email")
    .eq("email", adminEmail)
    .single();

  if (existingEmail) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse e-mail." },
      { status: 409 }
    );
  }

  const { error: settingsError } = await supabaseAdmin.from("settings").insert({
    company_id: companyId,
    company_name: companyName,
  });

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  const passwordHash = await hashPassword(adminPassword);
  const { error: adminError } = await supabaseAdmin.from("admin_users").insert({
    email: adminEmail,
    password_hash: passwordHash,
    role: "company",
    company_id: companyId,
  });

  if (adminError) {
    // Reverte a empresa criada — não faz sentido deixar uma empresa
    // sem nenhum login associado a ela.
    await supabaseAdmin.from("settings").delete().eq("company_id", companyId);
    return NextResponse.json({ error: adminError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, company_id: companyId });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const body = await request.json();
  const companyId = String(body.company_id ?? "");
  const newPassword = String(body.new_password ?? "");

  if (!companyId || newPassword.length < 6) {
    return NextResponse.json(
      { error: "Informe uma senha com pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(newPassword);
  const { error } = await supabaseAdmin
    .from("admin_users")
    .update({ password_hash: passwordHash })
    .eq("company_id", companyId)
    .eq("role", "company");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const { company_id: companyId } = await request.json();

  if (!companyId || companyId === "default") {
    return NextResponse.json(
      { error: "Essa empresa não pode ser excluída." },
      { status: 400 }
    );
  }

  await supabaseAdmin.from("quotes").delete().eq("company_id", companyId);
  await supabaseAdmin.from("leads").delete().eq("company_id", companyId);
  await supabaseAdmin.from("admin_users").delete().eq("company_id", companyId);

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

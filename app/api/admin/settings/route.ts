import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company") ?? "default";

  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (error) {
    return NextResponse.json({ ...DEFAULT_SETTINGS, company_id: companyId });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const companyId = String(body.company_id ?? "default");

  const payload = {
    company_id: companyId,
    base_price_m2: Number(body.base_price_m2),
    minimum_quote: Number(body.minimum_quote),
    travel_cost: Number(body.travel_cost),
    water_cost: Number(body.water_cost),
    power_cost: Number(body.power_cost),
    whatsapp_number: String(body.whatsapp_number ?? ""),
    company_name: String(body.company_name ?? ""),
    company_email: String(body.company_email ?? ""),
    company_phone: String(body.company_phone ?? ""),
    company_address: String(body.company_address ?? ""),
    primary_color: String(body.primary_color ?? "#1B6FC9"),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("settings").upsert(payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

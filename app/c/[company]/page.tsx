import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Calculator from "@/components/Calculator";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { BusinessSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

async function getCompanySettings(
  companyId: string
): Promise<BusinessSettings | null> {
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("company_id", companyId)
    .single();

  return data ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { company: string };
}): Promise<Metadata> {
  const settings = await getCompanySettings(params.company);
  return {
    title: settings
      ? `Orçamento de serviços com drone | ${settings.company_name}`
      : "Drone Quote",
  };
}

export default async function CompanyPage({
  params,
}: {
  params: { company: string };
}) {
  const settings = await getCompanySettings(params.company);

  // Empresa não cadastrada no painel administrativo → 404, em vez de
  // mostrar uma calculadora com preços que não pertencem a ninguém.
  if (!settings) {
    notFound();
  }

  return (
    <main style={{ "--brand": settings.primary_color } as React.CSSProperties}>
      <Hero logoUrl={settings.logo_url} />
      <HowItWorks />
      <Calculator settings={settings} />
      <Benefits />
      <Footer companyName={settings.company_name} />
    </main>
  );
}

import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Calculator from "@/components/Calculator";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { BusinessSettings, DEFAULT_SETTINGS } from "@/lib/settings";

export const dynamic = "force-dynamic";

async function getSettings(): Promise<BusinessSettings> {
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("company_id", "default")
    .single();

  return data ?? DEFAULT_SETTINGS;
}

export default async function Home() {
  const settings = await getSettings();

  return (
    <main style={{ "--brand": settings.primary_color } as React.CSSProperties}>
      <Hero logoUrl={settings.logo_url} />
      <HowItWorks />
      <Calculator settings={settings} />
      <Benefits />
      <Footer />
    </main>
  );
}

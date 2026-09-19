import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Calculator from "@/components/Calculator";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { BusinessSettings, DEFAULT_SETTINGS } from "@/lib/settings";

// Sempre busca a versão mais recente das configurações do painel
// administrativo — sem isso, o Next poderia cachear o preço antigo.
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
    <main>
      <Hero />
      <HowItWorks />
      <Calculator settings={settings} />
      <Benefits />
      <Footer />
    </main>
  );
}

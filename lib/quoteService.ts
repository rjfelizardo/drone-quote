import { supabase } from "./supabaseClient";
import { QuoteInput, QuoteResult } from "./pricingEngine";

export interface LeadInput {
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  city: string;
  role?: string;
}

export interface SaveQuoteResult {
  success: boolean;
  error?: string;
}

export async function saveLeadAndQuote(
  lead: LeadInput,
  input: QuoteInput,
  result: QuoteResult,
  companyId: string = "default"
): Promise<SaveQuoteResult> {
  try {
    const { data: leadRow, error: leadError } = await supabase
      .from("leads")
      .insert({
        company_id: companyId,
        name: lead.name,
        company: lead.company,
        whatsapp: lead.whatsapp,
        email: lead.email,
        city: lead.city,
        role: lead.role || null,
      })
      .select("id")
      .single();

    if (leadError || !leadRow) {
      return { success: false, error: leadError?.message ?? "Falha ao salvar lead" };
    }

    const { error: quoteError } = await supabase.from("quotes").insert({
      lead_id: leadRow.id,
      company_id: companyId,
      area_m2: input.areaM2,
      height: input.height,
      surface: input.surface,
      dirt_level: input.dirtLevel,
      access_difficulty: input.accessDifficulty,
      obstacles: input.obstacles,
      geometry: input.geometry,
      water_available: input.waterAvailable,
      power_available: input.powerAvailable,
      recurrence: input.recurrence,
      complexity_level: result.complexityLevel,
      complexity_score: result.complexityScore,
      estimated_price: result.estimatedPrice,
      estimated_price_per_m2: result.estimatedPricePerM2,
      requires_technical_evaluation: result.requiresTechnicalEvaluation,
      evaluation_reason: result.evaluationReason || null,
    });

    if (quoteError) {
      return { success: false, error: quoteError.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateQuotePdf } from "@/lib/generateQuotePdf";
import { calculateQuote, QuoteInput } from "@/lib/pricingEngine";
import { LeadInput } from "@/lib/quoteService";
import { BusinessSettings, DEFAULT_SETTINGS } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const lead: LeadInput = body.lead;
  const input: QuoteInput = body.input;
  const settings: BusinessSettings = { ...DEFAULT_SETTINGS, ...(body.settings ?? {}) };

  if (!lead || !input) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  // O preço é sempre recalculado aqui no servidor a partir do motor de
  // precificação — nunca confiamos num valor de orçamento vindo do
  // navegador, pra evitar que alguém manipule o PDF gerado.
  const result = calculateQuote(input, {
    basePriceM2: settings.base_price_m2,
    minimumQuote: settings.minimum_quote,
    travelCost: settings.travel_cost,
    waterCost: settings.water_cost,
    powerCost: settings.power_cost,
  });

  const pdfBytes = await generateQuotePdf({ lead, input, result, settings });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="orcamento-drone-quote.pdf"',
    },
  });
}

import { PDFDocument, StandardFonts, rgb, PDFFont, RGB } from "pdf-lib";
import { QuoteInput, QuoteResult } from "./pricingEngine";
import { pricingConfig } from "./config";
import { BusinessSettings } from "./settings";
import { LeadInput } from "./quoteService";

export interface QuotePdfData {
  lead: LeadInput;
  input: QuoteInput;
  result: QuoteResult;
  settings: BusinessSettings;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

export async function generateQuotePdf(data: QuotePdfData): Promise<Uint8Array> {
  const { lead, input, result, settings } = data;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const navy = rgb(0.043, 0.145, 0.271);
  const gray = rgb(0.42, 0.42, 0.45);
  const black = rgb(0.06, 0.08, 0.1);
  const gold = rgb(0.62, 0.42, 0.06);

  let y = height - 55;
  const marginX = 50;
  const labelColumnWidth = 170;

  function drawText(
    str: string,
    opts: { size?: number; font?: PDFFont; color?: RGB; x?: number } = {}
  ) {
    page.drawText(str, {
      x: opts.x ?? marginX,
      y,
      size: opts.size ?? 11,
      font: opts.font ?? fontRegular,
      color: opts.color ?? black,
    });
  }

  function advance(spacing = 18) {
    y -= spacing;
  }

  function row(label: string, value: string) {
    drawText(`${label}:`, { font: fontBold });
    drawText(value, { x: marginX + labelColumnWidth });
    advance();
  }

  // Cabeçalho
  drawText(settings.company_name || "Drone Quote", { size: 20, font: fontBold, color: navy });
  advance(28);
  drawText("Orçamento de Serviço — Limpeza de Fachada com Drone", {
    size: 13,
    font: fontBold,
  });
  advance(20);
  drawText(`Data: ${new Date().toLocaleDateString("pt-BR")}`, { size: 10, color: gray });
  advance(32);

  // Cliente
  drawText("Cliente", { size: 12, font: fontBold, color: navy });
  advance(20);
  row("Nome", lead.name);
  row("Empresa", lead.company);
  row("Cidade", lead.city);
  row("WhatsApp", lead.whatsapp);
  row("E-mail", lead.email);
  advance(14);

  // Detalhes da operação
  drawText("Detalhes da operação", { size: 12, font: fontBold, color: navy });
  advance(20);
  row("Tipo de serviço", "Limpeza de fachada");
  row("Área", `${input.areaM2.toLocaleString("pt-BR")} m²`);
  row("Altura", pricingConfig.heightFactors[input.height].label);
  row("Superfície", pricingConfig.surfaceFactors[input.surface].label);
  row("Nível de sujeira", pricingConfig.dirtFactors[input.dirtLevel].label);
  row("Dificuldade de acesso", pricingConfig.accessFactors[input.accessDifficulty].label);
  row("Geometria da fachada", pricingConfig.geometryFactors[input.geometry].label);
  row(
    "Obstáculos",
    input.obstacles.length
      ? input.obstacles.map((o) => pricingConfig.obstacleWeights[o].label).join(", ")
      : "Nenhum informado"
  );
  row("Recorrência", pricingConfig.recurrenceDiscounts[input.recurrence].label);
  advance(14);

  // Resultado
  drawText("Resultado da estimativa", { size: 12, font: fontBold, color: navy });
  advance(20);
  row("Complexidade", result.complexityLevel);
  row("Produtividade estimada", `${result.productivity} m²/h`);
  row("Prazo estimado", `${Math.max(1, Math.ceil(result.estimatedDays))} dia(s)`);
  advance(10);

  if (result.requiresTechnicalEvaluation) {
    drawText("Esta operação requer avaliação técnica antes da definição do valor final.", {
      font: fontBold,
      color: gold,
      size: 11,
    });
    advance(26);
  } else {
    drawText(`Valor estimado: ${formatCurrency(result.estimatedPrice)}`, {
      size: 16,
      font: fontBold,
      color: navy,
    });
    advance(22);
    drawText(`${formatCurrency(result.estimatedPricePerM2)} por m²`, {
      size: 10,
      color: gray,
    });
    advance(32);
  }

  // Termo / observações
  const disclaimer =
    "Este documento apresenta uma estimativa comercial baseada nas informações fornecidas. " +
    "O orçamento definitivo poderá sofrer alterações após avaliação técnica, condições reais " +
    "do local e validação operacional.";
  wrapText(disclaimer, 95).forEach((l) => {
    drawText(l, { size: 9, color: gray });
    advance(13);
  });

  if (settings.whatsapp_number || settings.company_email) {
    advance(8);
    drawText("Contato:", { font: fontBold, size: 10 });
    advance(15);
    if (settings.whatsapp_number) {
      drawText(`WhatsApp: ${settings.whatsapp_number}`, { size: 10 });
      advance(15);
    }
    if (settings.company_email) {
      drawText(`E-mail: ${settings.company_email}`, { size: 10 });
      advance(15);
    }
  }

  return pdfDoc.save();
}

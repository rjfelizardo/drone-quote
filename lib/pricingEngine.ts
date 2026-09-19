import {
  pricingConfig,
  SurfaceKey,
  HeightKey,
  DirtKey,
  AccessKey,
  GeometryKey,
  ObstacleKey,
  RecurrenceKey,
} from "./config";

export interface QuoteInput {
  areaM2: number;
  height: HeightKey;
  surface: SurfaceKey;
  dirtLevel: DirtKey;
  accessDifficulty: AccessKey;
  obstacles: ObstacleKey[];
  geometry: GeometryKey;
  waterAvailable: "sim" | "nao" | "naoSei";
  powerAvailable: "sim" | "nao" | "naoSei";
  recurrence: RecurrenceKey;
}

export type ComplexityLevel = "BAIXA" | "MÉDIA" | "ALTA" | "ESPECIAL";

export interface QuoteResult {
  basePrice: number;
  complexityLevel: ComplexityLevel;
  complexityScore: number;
  productivity: number; // m²/h
  estimatedHours: number;
  estimatedDays: number;
  logisticsCost: number;
  additionalCosts: number;
  recurrenceDiscount: number;
  estimatedPrice: number;
  estimatedPricePerM2: number;
  requiresTechnicalEvaluation: boolean;
  evaluationReason?: string;
}

function complexityScoreFromObstacles(obstacles: ObstacleKey[]): number {
  return obstacles.reduce(
    (sum, key) => sum + pricingConfig.obstacleWeights[key].weight,
    0
  );
}

function levelFromScore(score: number): ComplexityLevel {
  const { baixa, media, alta } = pricingConfig.complexityThresholds;
  if (score <= baixa[1]) return "BAIXA";
  if (score <= media[1]) return "MÉDIA";
  if (score <= alta[1]) return "ALTA";
  return "ESPECIAL";
}

function productivityForLevel(level: ComplexityLevel): number {
  if (level === "BAIXA") return pricingConfig.productivityLevels.simples;
  if (level === "MÉDIA") return pricingConfig.productivityLevels.media;
  return pricingConfig.productivityLevels.complexa;
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  const heightFactor = pricingConfig.heightFactors[input.height].factor;
  const surfaceFactor = pricingConfig.surfaceFactors[input.surface].factor;
  const dirtFactor = pricingConfig.dirtFactors[input.dirtLevel].factor;
  const accessFactor = pricingConfig.accessFactors[input.accessDifficulty].factor;
  const geometryFactor = pricingConfig.geometryFactors[input.geometry].factor;

  const reasons: string[] = [];
  if (heightFactor === null) reasons.push("altura acima de 70 metros");
  if (surfaceFactor === null) reasons.push("tipo de superfície não padrão");
  if (dirtFactor === null) reasons.push("sujeira nível pós-obra");

  const obstacleScore = complexityScoreFromObstacles(input.obstacles);
  const complexityLevel = levelFromScore(obstacleScore);
  if (complexityLevel === "ESPECIAL") {
    reasons.push("combinação de obstáculos críticos");
  }

  const requiresTechnicalEvaluation = reasons.length > 0;

  const basePrice = input.areaM2 * pricingConfig.basePriceM2;

  const safeHeightFactor = heightFactor ?? 1.5;
  const safeSurfaceFactor = surfaceFactor ?? 1.3;
  const safeDirtFactor = dirtFactor ?? 1.6;

  const operationalPrice =
    basePrice *
    safeHeightFactor *
    safeSurfaceFactor *
    safeDirtFactor *
    pricingConfig.accessFactors[input.accessDifficulty].factor *
    pricingConfig.geometryFactors[input.geometry].factor;

  const productivity = productivityForLevel(complexityLevel);
  const estimatedHours = input.areaM2 / productivity;
  const estimatedDays = estimatedHours / pricingConfig.hoursPerDay;

  const logisticsCost = pricingConfig.travelCost;
  let additionalCosts = 0;
  if (input.waterAvailable !== "sim") additionalCosts += pricingConfig.waterCost;
  if (input.powerAvailable !== "sim") additionalCosts += pricingConfig.powerCost;

  const recurrenceFactor = pricingConfig.recurrenceDiscounts[input.recurrence].factor;
  const recurrenceDiscount = operationalPrice * (1 - recurrenceFactor);

  let estimatedPrice =
    operationalPrice + logisticsCost + additionalCosts - recurrenceDiscount;

  if (estimatedPrice < pricingConfig.minimumQuote) {
    estimatedPrice = pricingConfig.minimumQuote;
  }

  const estimatedPricePerM2 = estimatedPrice / input.areaM2;

  return {
    basePrice,
    complexityLevel,
    complexityScore: obstacleScore,
    productivity,
    estimatedHours,
    estimatedDays,
    logisticsCost,
    additionalCosts,
    recurrenceDiscount,
    estimatedPrice,
    estimatedPricePerM2,
    requiresTechnicalEvaluation,
    evaluationReason: reasons.length ? reasons.join(", ") : undefined,
  };
}

// Configuração central de parâmetros do motor de precificação.
// Nada aqui deve ser hardcoded dentro de componentes (Bloco 37 / Bloco 51).
// Em fases futuras, isso vem do banco (pricing_configs / pricing_factors), por company_id.

export const pricingConfig = {
  basePriceM2: 8.0, // R$/m² — valor inicial de demonstração (Bloco 19), não é preço de mercado
  minimumQuote: 2500, // R$ — mobilização mínima (Bloco 20)

  heightFactors: {
    ate10: { label: "Até 10 metros", factor: 1.0 },
    de10a20: { label: "10 a 20 metros", factor: 1.05 },
    de20a30: { label: "20 a 30 metros", factor: 1.1 },
    de30a50: { label: "30 a 50 metros", factor: 1.2 },
    de50a70: { label: "50 a 70 metros", factor: 1.3 },
    acima70: { label: "Acima de 70 metros", factor: null }, // avaliação especial
  },

  surfaceFactors: {
    vidro: { label: "Vidro", factor: 1.0 },
    acm: { label: "ACM", factor: 1.0 },
    ceramica: { label: "Cerâmica", factor: 1.1 },
    pastilha: { label: "Pastilha", factor: 1.1 },
    pintura: { label: "Pintura", factor: 1.1 },
    concreto: { label: "Concreto", factor: 1.25 },
    pedra: { label: "Pedra", factor: 1.25 },
    metalica: { label: "Estrutura metálica", factor: 1.1 },
    outra: { label: "Outra", factor: null }, // avaliação técnica
  },

  dirtFactors: {
    manutencao: { label: "Nível 1 — Manutenção", factor: 1.0 },
    urbana: { label: "Nível 2 — Sujeira urbana", factor: 1.15 },
    biofilme: { label: "Nível 3 — Biofilme", factor: 1.3 },
    pesada: { label: "Nível 4 — Sujeira pesada", factor: 1.5 },
    posObra: { label: "Nível 5 — Pós-obra", factor: null }, // avaliação técnica
  },

  accessFactors: {
    facil: { label: "Fácil", factor: 1.0 },
    medio: { label: "Médio", factor: 1.15 },
    dificil: { label: "Difícil", factor: 1.3 },
    muitoDificil: { label: "Muito difícil", factor: 1.5 },
  },

  geometryFactors: {
    simples: { label: "Simples", factor: 1.0 },
    moderada: { label: "Moderada", factor: 1.1 },
    complexa: { label: "Complexa", factor: 1.25 },
  },

  obstacleWeights: {
    arvores: { label: "Árvores", weight: 1 },
    cabos: { label: "Cabos elétricos", weight: 2 },
    postes: { label: "Postes", weight: 1 },
    marquises: { label: "Marquises", weight: 1 },
    estruturas: { label: "Estruturas", weight: 1 },
    pessoas: { label: "Circulação intensa de pessoas", weight: 1 },
    veiculos: { label: "Veículos", weight: 1 },
    edificacoes: { label: "Outras edificações", weight: 0 },
    areaEstreita: { label: "Áreas estreitas", weight: 2 },
  },

  recurrenceDiscounts: {
    unico: { label: "Serviço único", factor: 1.0 },
    duasVezes: { label: "2 vezes por ano", factor: 0.9 },
    tresVezes: { label: "3 vezes por ano", factor: 0.85 },
    quatroVezes: { label: "4 vezes por ano", factor: 0.8 },
  },

  productivityLevels: {
    simples: 80, // m²/h
    media: 60,
    complexa: 40,
  },

  hoursPerDay: 8,

  travelCost: 400, // R$ — custo de deslocamento padrão (mock, Fase 1)
  waterCost: 250, // R$ — custo adicional se não houver água disponível
  powerCost: 300, // R$ — custo adicional se não houver energia disponível

  complexityThresholds: {
    baixa: [0, 4],
    media: [5, 8],
    alta: [9, 12],
    especial: [13, Infinity],
  },
} as const;

export type SurfaceKey = keyof typeof pricingConfig.surfaceFactors;
export type HeightKey = keyof typeof pricingConfig.heightFactors;
export type DirtKey = keyof typeof pricingConfig.dirtFactors;
export type AccessKey = keyof typeof pricingConfig.accessFactors;
export type GeometryKey = keyof typeof pricingConfig.geometryFactors;
export type ObstacleKey = keyof typeof pricingConfig.obstacleWeights;
export type RecurrenceKey = keyof typeof pricingConfig.recurrenceDiscounts;

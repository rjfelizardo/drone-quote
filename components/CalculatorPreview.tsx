import { QuoteResult } from "@/lib/pricingEngine";
import { ComplexityLevel } from "@/lib/pricingEngine";

const COMPLEXITY_ORDER: ComplexityLevel[] = ["BAIXA", "MÉDIA", "ALTA", "ESPECIAL"];

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export default function CalculatorPreview({
  areaValid,
  result,
}: {
  areaValid: boolean;
  result: QuoteResult | null;
}) {
  return (
    <aside className="lg:sticky lg:top-8">
      <div className="rounded-2xl bg-navy-700 p-6 text-white shadow-[0_1px_2px_rgba(11,37,69,0.06),0_12px_32px_-16px_rgba(11,37,69,0.5)]">
        <p className="text-xs font-medium uppercase tracking-wide text-navy-50/60">
          Prévia da sua estimativa
        </p>

        {!areaValid || !result ? (
          <p className="mt-4 text-sm text-navy-50/70">
            Informe a área na primeira etapa para começar a ver sua
            estimativa aqui, atualizada a cada resposta.
          </p>
        ) : result.requiresTechnicalEvaluation ? (
          <div className="mt-4">
            <p className="font-display text-2xl font-semibold text-gold-400">
              Avaliação técnica necessária
            </p>
            <p className="mt-2 text-sm text-navy-50/70">
              Com as respostas até aqui, esta operação foge do padrão e
              precisa ser avaliada pela equipe técnica antes do valor
              fechado.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
              {formatCurrency(result.estimatedPrice)}
            </p>
            <p className="text-sm text-navy-50/60">
              {formatCurrency(result.estimatedPricePerM2)} por m²
            </p>

            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-navy-50/60">
                Complexidade da operação
              </p>
              <div className="mt-2 flex gap-1.5">
                {COMPLEXITY_ORDER.map((level) => {
                  const currentIndex = COMPLEXITY_ORDER.indexOf(result.complexityLevel);
                  const levelIndex = COMPLEXITY_ORDER.indexOf(level);
                  const active = levelIndex <= currentIndex;
                  return (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded-full transition-colors duration-500 ${
                        active ? "bg-techblue-400" : "bg-white/10"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="mt-1.5 text-sm font-medium text-techblue-400">
                {result.complexityLevel}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-navy-50/60">
                Composição do investimento
              </p>
              <CostBar result={result} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat label="Produtividade" value={`${result.productivity} m²/h`} />
              <MiniStat
                label="Prazo estimado"
                value={`${Math.max(1, Math.ceil(result.estimatedDays))} dia(s)`}
              />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function CostBar({ result }: { result: QuoteResult }) {
  const operational = result.estimatedPrice - result.logisticsCost - result.additionalCosts;
  const segments = [
    { label: "Operação", value: Math.max(operational, 0), color: "bg-techblue-400" },
    { label: "Deslocamento", value: result.logisticsCost, color: "bg-gold-400" },
    { label: "Água/energia", value: result.additionalCosts, color: "bg-white/40" },
  ].filter((s) => s.value > 0);

  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className="mt-2">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        {segments.map((s) => (
          <div
            key={s.label}
            className={`h-full ${s.color} transition-all duration-500`}
            style={{ width: `${(s.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-navy-50/70">
            <span className={`h-2 w-2 rounded-full ${s.color}`} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 p-3">
      <p className="text-xs text-navy-50/60">{label}</p>
      <p className="mt-0.5 font-display font-semibold text-white">{value}</p>
    </div>
  );
}

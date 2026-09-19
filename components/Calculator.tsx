"use client";

import { useMemo, useState } from "react";
import {
  pricingConfig,
  HeightKey,
  SurfaceKey,
  DirtKey,
  AccessKey,
  GeometryKey,
  ObstacleKey,
  RecurrenceKey,
} from "@/lib/config";
import { calculateQuote, QuoteInput } from "@/lib/pricingEngine";
import { saveLeadAndQuote } from "@/lib/quoteService";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
const TOTAL_STEPS = 7;

const defaultObstacles: ObstacleKey[] = [];

export default function Calculator() {
  const [step, setStep] = useState<Step>(1);
  const [areaM2, setAreaM2] = useState<string>("");
  const [height, setHeight] = useState<HeightKey>("de10a20");
  const [surface, setSurface] = useState<SurfaceKey>("acm");
  const [dirtLevel, setDirtLevel] = useState<DirtKey>("urbana");
  const [accessDifficulty, setAccessDifficulty] = useState<AccessKey>("facil");
  const [obstacles, setObstacles] = useState<ObstacleKey[]>(defaultObstacles);
  const [geometry, setGeometry] = useState<GeometryKey>("simples");
  const [waterAvailable, setWaterAvailable] = useState<QuoteInput["waterAvailable"]>("sim");
  const [powerAvailable, setPowerAvailable] = useState<QuoteInput["powerAvailable"]>("sim");
  const [recurrence, setRecurrence] = useState<RecurrenceKey>("unico");

  const [leadName, setLeadName] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadWhatsapp, setLeadWhatsapp] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCity, setLeadCity] = useState("");
  const [leadRole, setLeadRole] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const areaValid = Number(areaM2) > 0;

  const leadValid =
    leadName.trim().length > 1 &&
    leadCompany.trim().length > 1 &&
    leadWhatsapp.trim().length >= 10 &&
    /\S+@\S+\.\S+/.test(leadEmail) &&
    leadCity.trim().length > 1;

  const result = useMemo(() => {
    if (!areaValid) return null;
    return calculateQuote({
      areaM2: Number(areaM2),
      height,
      surface,
      dirtLevel,
      accessDifficulty,
      obstacles,
      geometry,
      waterAvailable,
      powerAvailable,
      recurrence,
    });
  }, [
    areaM2,
    areaValid,
    height,
    surface,
    dirtLevel,
    accessDifficulty,
    obstacles,
    geometry,
    waterAvailable,
    powerAvailable,
    recurrence,
  ]);

  function toggleObstacle(key: ObstacleKey) {
    setObstacles((prev) =>
      prev.includes(key) ? prev.filter((o) => o !== key) : [...prev, key]
    );
  }

  async function handleSaveLead() {
    if (!leadValid || !result || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const { success, error } = await saveLeadAndQuote(
      {
        name: leadName,
        company: leadCompany,
        whatsapp: leadWhatsapp,
        email: leadEmail,
        city: leadCity,
        role: leadRole,
      },
      {
        areaM2: Number(areaM2),
        height,
        surface,
        dirtLevel,
        accessDifficulty,
        obstacles,
        geometry,
        waterAvailable,
        powerAvailable,
        recurrence,
      },
      result
    );

    setSubmitting(false);
    if (success) {
      setSubmitted(true);
    } else {
      setSubmitError(error ?? "Não foi possível salvar seus dados agora.");
    }
  }

  function next() {
    if (step < TOTAL_STEPS) setStep((s) => (s + 1) as Step);
  }
  function back() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  const whatsappMessage = result
    ? encodeURIComponent(
        `Olá! Meu nome é ${leadName}, da empresa ${leadCompany}.\n` +
          `Gostaria de solicitar uma avaliação para limpeza de fachada.\n` +
          `Cidade: ${leadCity}\n` +
          `E-mail: ${leadEmail}\n` +
          `Área aproximada: ${formatAreaDisplay(areaM2)} m²\n` +
          `Altura: ${pricingConfig.heightFactors[height].label}\n` +
          `Superfície: ${pricingConfig.surfaceFactors[surface].label}\n` +
          `Nível de sujeira: ${pricingConfig.dirtFactors[dirtLevel].label}\n` +
          `Acesso: ${pricingConfig.accessFactors[accessDifficulty].label}\n` +
          `Estimativa apresentada: ${formatCurrency(result.estimatedPrice)}\n` +
          `Gostaria de agendar uma avaliação técnica.`
      )
    : "";

  return (
    <section id="calculadora" className="relative bg-surface px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(11,37,69,0.06),0_12px_32px_-16px_rgba(11,37,69,0.25)] md:p-10">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-navy-700/60">
            <span>
              Etapa {step} de {TOTAL_STEPS}
            </span>
            <span>Limpeza de fachadas</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
            <div
              className="h-full rounded-full bg-techblue-500 transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <StepBlock title="Qual é a área aproximada que será atendida?">
            <input
              type="text"
              inputMode="numeric"
              value={formatAreaDisplay(areaM2)}
              onChange={(e) => setAreaM2(parseAreaInput(e.target.value))}
              placeholder="Ex: 10.000"
              className="w-full rounded-lg border border-navy-700/15 px-4 py-3.5 text-lg outline-none focus:border-techblue-500"
            />
            <p className="mt-2 text-sm text-navy-700/60">
              Área em m². Você pode digitar com ponto de milhar (ex: 10.000) —
              é só uma estimativa, poderá ser confirmada depois pela equipe
              técnica.
            </p>
          </StepBlock>
        )}

        {step === 2 && (
          <StepBlock title="Qual a altura da fachada?">
            <OptionGrid
              options={pricingConfig.heightFactors}
              selected={height}
              onSelect={(k) => setHeight(k as HeightKey)}
            />
          </StepBlock>
        )}

        {step === 3 && (
          <StepBlock title="Qual o tipo de superfície?">
            <OptionGrid
              options={pricingConfig.surfaceFactors}
              selected={surface}
              onSelect={(k) => setSurface(k as SurfaceKey)}
            />
          </StepBlock>
        )}

        {step === 4 && (
          <StepBlock title="Qual o grau de sujeira e a dificuldade de acesso?">
            <p className="mb-2 text-sm font-medium text-navy-700/70">
              Grau de sujeira
            </p>
            <OptionGrid
              options={pricingConfig.dirtFactors}
              selected={dirtLevel}
              onSelect={(k) => setDirtLevel(k as DirtKey)}
            />
            <p className="mb-2 mt-6 text-sm font-medium text-navy-700/70">
              Dificuldade de acesso
            </p>
            <OptionGrid
              options={pricingConfig.accessFactors}
              selected={accessDifficulty}
              onSelect={(k) => setAccessDifficulty(k as AccessKey)}
            />
          </StepBlock>
        )}

        {step === 5 && (
          <StepBlock title="Existem obstáculos no local?">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(pricingConfig.obstacleWeights).map(([key, val]) => {
                const active = obstacles.includes(key as ObstacleKey);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleObstacle(key as ObstacleKey)}
                    className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      active
                        ? "border-techblue-500 bg-techblue-500/10 text-techblue-600"
                        : "border-navy-700/15 text-navy-700/80 hover:border-navy-700/30"
                    }`}
                  >
                    {val.label}
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-6 text-sm font-medium text-navy-700/70">
              Geometria da fachada
            </p>
            <OptionGrid
              options={pricingConfig.geometryFactors}
              selected={geometry}
              onSelect={(k) => setGeometry(k as GeometryKey)}
            />
          </StepBlock>
        )}

        {step === 6 && (
          <StepBlock title="Água, energia e recorrência">
            <p className="mb-2 text-sm font-medium text-navy-700/70">
              Há água disponível no local?
            </p>
            <ThreeWayToggle value={waterAvailable} onChange={setWaterAvailable} />

            <p className="mb-2 mt-5 text-sm font-medium text-navy-700/70">
              Há energia disponível no local?
            </p>
            <ThreeWayToggle value={powerAvailable} onChange={setPowerAvailable} />

            <p className="mb-2 mt-6 text-sm font-medium text-navy-700/70">
              Recorrência do serviço
            </p>
            <OptionGrid
              options={pricingConfig.recurrenceDiscounts}
              selected={recurrence}
              onSelect={(k) => setRecurrence(k as RecurrenceKey)}
            />
          </StepBlock>
        )}

        {step === 7 && (
          <div>
            <h3 className="font-display text-2xl font-semibold text-navy-700">
              Pré-vistoria comercial
            </h3>

            {!areaValid && (
              <p className="mt-4 text-navy-700/70">
                Informe uma área válida na primeira etapa para ver a
                estimativa.
              </p>
            )}

            {result && (
              <div className="mt-6">
                {result.requiresTechnicalEvaluation ? (
                  <div className="rounded-lg border border-gold-500/40 bg-gold-500/10 p-4 text-navy-700">
                    <p className="font-medium">
                      Esta operação requer avaliação técnica antes da
                      definição do valor final.
                    </p>
                    <p className="mt-1 text-sm text-navy-700/70">
                      Motivo: {result.evaluationReason}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-navy-700 p-6 text-white">
                    <p className="text-sm text-navy-50/70">Estimativa</p>
                    <p className="font-display text-4xl font-semibold text-gold-500">
                      {formatCurrency(result.estimatedPrice)}
                    </p>
                    <p className="mt-1 text-sm text-navy-50/70">
                      {formatCurrency(result.estimatedPricePerM2)} por m²
                    </p>
                  </div>
                )}

                <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <SummaryItem
                    label="Área"
                    value={`${formatAreaDisplay(areaM2)} m²`}
                  />
                  <SummaryItem label="Complexidade" value={result.complexityLevel} />
                  <SummaryItem
                    label="Produtividade"
                    value={`${result.productivity} m²/h`}
                  />
                  <SummaryItem
                    label="Prazo estimado"
                    value={`${Math.max(1, Math.ceil(result.estimatedDays))} dia(s)`}
                  />
                </dl>

                <div className="mt-8 border-t border-navy-700/10 pt-6">
                  <h4 className="font-display text-lg font-semibold text-navy-700">
                    Para receber o orçamento, informe seus dados
                  </h4>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <LeadField
                      label="Nome"
                      value={leadName}
                      onChange={setLeadName}
                      placeholder="Seu nome"
                    />
                    <LeadField
                      label="Empresa"
                      value={leadCompany}
                      onChange={setLeadCompany}
                      placeholder="Nome da empresa"
                    />
                    <LeadField
                      label="WhatsApp"
                      value={leadWhatsapp}
                      onChange={setLeadWhatsapp}
                      placeholder="(11) 99999-9999"
                      inputMode="tel"
                    />
                    <LeadField
                      label="E-mail"
                      value={leadEmail}
                      onChange={setLeadEmail}
                      placeholder="voce@empresa.com"
                      type="email"
                    />
                    <LeadField
                      label="Cidade"
                      value={leadCity}
                      onChange={setLeadCity}
                      placeholder="Sua cidade"
                    />
                    <LeadField
                      label="Cargo (opcional)"
                      value={leadRole}
                      onChange={setLeadRole}
                      placeholder="Seu cargo"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={leadValid ? `https://wa.me/?text=${whatsappMessage}` : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!leadValid}
                    onClick={(e) => {
                      if (!leadValid) {
                        e.preventDefault();
                        return;
                      }
                      handleSaveLead();
                    }}
                    className={`flex-1 rounded-lg px-6 py-3.5 text-center font-display font-semibold text-white transition-colors ${
                      leadValid
                        ? "bg-techblue-500 hover:bg-techblue-600"
                        : "cursor-not-allowed bg-techblue-500/40"
                    }`}
                  >
                    Receber orçamento pelo WhatsApp
                  </a>
                  <button
                    type="button"
                    disabled={!leadValid || submitting}
                    onClick={handleSaveLead}
                    className="flex-1 rounded-lg border border-navy-700/20 px-6 py-3.5 text-center font-display font-semibold text-navy-700 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? "Enviando..." : "Solicitar avaliação técnica"}
                  </button>
                </div>
                {!leadValid && (
                  <p className="mt-2 text-xs text-navy-700/50">
                    Preencha nome, empresa, WhatsApp, e-mail e cidade pra continuar.
                  </p>
                )}
                {submitted && (
                  <p className="mt-2 text-sm font-medium text-techblue-600">
                    Recebemos seus dados! Nossa equipe entrará em contato.
                  </p>
                )}
                {submitError && (
                  <p className="mt-2 text-sm text-red-600">{submitError}</p>
                )}

                <p className="mt-4 text-xs text-navy-700/50">
                  Estimativa comercial baseada nas informações fornecidas. O
                  orçamento definitivo pode ser ajustado após avaliação
                  técnica e condições reais do local.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="font-medium text-navy-700/60 disabled:opacity-0"
          >
            Voltar
          </button>
          {step < TOTAL_STEPS && (
            <button
              type="button"
              onClick={next}
              disabled={step === 1 && !areaValid}
              className="rounded-lg bg-navy-700 px-6 py-3 font-display font-semibold text-white transition-opacity disabled:opacity-40"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}

function StepBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold text-navy-700">
        {title}
      </h3>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function OptionGrid<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: Record<string, { label: string; factor: number | null }>;
  selected: T;
  onSelect: (key: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Object.entries(options).map(([key, val]) => {
        const active = key === selected;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key as T)}
            className={`rounded-lg border px-4 py-3.5 text-left transition-colors ${
              active
                ? "border-techblue-500 bg-techblue-500/10 text-techblue-600"
                : "border-navy-700/15 text-navy-700/80 hover:border-navy-700/30"
            }`}
          >
            {val.label}
          </button>
        );
      })}
    </div>
  );
}

function ThreeWayToggle({
  value,
  onChange,
}: {
  value: "sim" | "nao" | "naoSei";
  onChange: (v: "sim" | "nao" | "naoSei") => void;
}) {
  const options: { key: "sim" | "nao" | "naoSei"; label: string }[] = [
    { key: "sim", label: "Sim" },
    { key: "nao", label: "Não" },
    { key: "naoSei", label: "Não sei" },
  ];
  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`flex-1 rounded-lg border px-4 py-3 font-medium transition-colors ${
            value === opt.key
              ? "border-techblue-500 bg-techblue-500/10 text-techblue-600"
              : "border-navy-700/15 text-navy-700/80"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function LeadField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "tel" | "email";
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-navy-700/70">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-navy-700/15 px-3.5 py-2.5 outline-none focus:border-techblue-500"
      />
    </label>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-navy-700/50">
        {label}
      </dt>
      <dd className="mt-1 font-display font-semibold text-navy-700">
        {value}
      </dd>
    </div>
  );
}

function parseAreaInput(raw: string): string {
  // Mantém apenas dígitos — o usuário pode digitar com ou sem ponto de
  // milhar, o valor interno sempre fica como uma string numérica pura.
  return raw.replace(/\D/g, "");
}

function formatAreaDisplay(digitsOnly: string): string {
  if (!digitsOnly) return "";
  return Number(digitsOnly).toLocaleString("pt-BR");
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

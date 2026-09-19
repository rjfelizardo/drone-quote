"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BusinessSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import CompanySwitcher from "@/components/admin/CompanySwitcher";

export default function AdminConfigPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface">
          <p className="text-navy-700/60">Carregando...</p>
        </main>
      }
    >
      <AdminConfigInner />
    </Suspense>
  );
}

function AdminConfigInner() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company") ?? "default";

  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/settings?company=${companyId}`)
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .finally(() => setLoading(false));
  }, [companyId]);

  function updateField<K extends keyof BusinessSettings>(
    key: K,
    value: BusinessSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);

    if (res.ok) {
      setSaved(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível salvar.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-navy-700/60">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href={`/admin?company=${companyId}`} className="text-sm text-navy-700/60 hover:text-navy-700">
              ← Voltar ao painel
            </Link>
            <h1 className="mt-2 font-display text-2xl font-semibold text-navy-700">
              Configurações
            </h1>
          </div>
          <CompanySwitcher basePath="/admin/config" />
        </div>

        <form onSubmit={handleSave} className="mt-8 space-y-8">
          <fieldset className="rounded-2xl bg-card p-6 shadow-sm">
            <legend className="px-1 font-display font-semibold text-navy-700">
              Precificação
            </legend>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                label="Preço base (R$/m²)"
                value={settings.base_price_m2}
                onChange={(v) => updateField("base_price_m2", v)}
              />
              <NumberField
                label="Orçamento mínimo (R$)"
                value={settings.minimum_quote}
                onChange={(v) => updateField("minimum_quote", v)}
              />
              <NumberField
                label="Custo de deslocamento (R$)"
                value={settings.travel_cost}
                onChange={(v) => updateField("travel_cost", v)}
              />
              <NumberField
                label="Custo extra sem água (R$)"
                value={settings.water_cost}
                onChange={(v) => updateField("water_cost", v)}
              />
              <NumberField
                label="Custo extra sem energia (R$)"
                value={settings.power_cost}
                onChange={(v) => updateField("power_cost", v)}
              />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl bg-card p-6 shadow-sm">
            <legend className="px-1 font-display font-semibold text-navy-700">
              Contato e marca
            </legend>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Nome da empresa"
                value={settings.company_name}
                onChange={(v) => updateField("company_name", v)}
              />
              <TextField
                label="WhatsApp (com DDI e DDD, só números)"
                value={settings.whatsapp_number}
                onChange={(v) => updateField("whatsapp_number", v)}
                placeholder="5511999999999"
              />
              <TextField
                label="E-mail"
                value={settings.company_email}
                onChange={(v) => updateField("company_email", v)}
                type="email"
              />
              <TextField
                label="Telefone"
                value={settings.company_phone}
                onChange={(v) => updateField("company_phone", v)}
              />
              <TextField
                label="Endereço"
                value={settings.company_address}
                onChange={(v) => updateField("company_address", v)}
              />
              <label className="block">
                <span className="text-sm font-medium text-navy-700/70">
                  Cor principal
                </span>
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => updateField("primary_color", e.target.value)}
                  className="mt-1 h-11 w-full rounded-lg border border-navy-700/15"
                />
              </label>
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && (
            <p className="text-sm font-medium text-techblue-600">
              Configurações salvas! Já valem para a próxima simulação na calculadora.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-navy-700 px-6 py-3 font-display font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </form>
      </div>
    </main>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setText(raw);
    const parsed = Number(raw.replace(",", "."));
    if (raw.trim() !== "" && !isNaN(parsed)) {
      onChange(parsed);
    }
  }

  function handleBlur() {
    setFocused(false);
    const parsed = Number(text.replace(",", "."));
    if (text.trim() === "" || isNaN(parsed)) {
      setText(String(value));
    }
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-navy-700/70">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onChange={handleChange}
        className="mt-1 w-full rounded-lg border border-navy-700/15 px-3.5 py-2.5 outline-none focus:border-techblue-500"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-navy-700/70">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-navy-700/15 px-3.5 py-2.5 outline-none focus:border-techblue-500"
      />
    </label>
  );
}

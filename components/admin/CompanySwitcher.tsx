"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface CompanyOption {
  company_id: string;
  company_name: string;
}

export default function CompanySwitcher({ basePath }: { basePath: string }) {
  return (
    <Suspense fallback={null}>
      <CompanySwitcherInner basePath={basePath} />
    </Suspense>
  );
}

function CompanySwitcherInner({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCompany = searchParams.get("company") ?? "default";

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(Array.isArray(data) ? data : []));
  }, []);

  function handleSwitch(companyId: string) {
    router.push(`${basePath}?company=${companyId}`);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const res = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_name: newName }),
    });

    setCreating(false);

    if (res.ok) {
      const data = await res.json();
      setNewName("");
      setShowNewForm(false);
      router.push(`${basePath}?company=${data.company_id}`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível criar a empresa.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={currentCompany}
        onChange={(e) => handleSwitch(e.target.value)}
        className="rounded-lg border border-navy-700/15 bg-card px-3 py-2 text-sm font-medium text-navy-700"
      >
        {companies.map((c) => (
          <option key={c.company_id} value={c.company_id}>
            {c.company_name || c.company_id} (/c/{c.company_id})
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setShowNewForm((v) => !v)}
        className="text-sm font-medium text-techblue-600 hover:text-techblue-500"
      >
        + Nova empresa
      </button>

      {showNewForm && (
        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da empresa"
            className="rounded-lg border border-navy-700/15 px-3 py-2 text-sm outline-none focus:border-techblue-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {creating ? "Criando..." : "Criar"}
          </button>
        </form>
      )}
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </div>
  );
}

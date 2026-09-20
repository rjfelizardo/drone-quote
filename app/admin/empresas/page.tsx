"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CompanyRow {
  company_id: string;
  company_name: string;
  lead_count: number;
  admin_email: string | null;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [resettingFor, setResettingFor] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  function loadCompanies() {
    setLoading(true);
    fetch("/api/admin/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const res = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: newName,
        admin_email: newEmail,
        admin_password: newPassword,
      }),
    });

    setCreating(false);

    if (res.ok) {
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      loadCompanies();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível criar a empresa.");
    }
  }

  async function handleDelete(companyId: string) {
    setDeleting(true);
    setError(null);

    const res = await fetch("/api/admin/companies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId }),
    });

    setDeleting(false);
    setConfirmingDelete(null);

    if (res.ok) {
      loadCompanies();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível excluir a empresa.");
    }
  }

  async function handleResetPassword(companyId: string) {
    setResetting(true);
    setError(null);

    const res = await fetch("/api/admin/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId, new_password: resetPassword }),
    });

    setResetting(false);

    if (res.ok) {
      setResettingFor(null);
      setResetPassword("");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível redefinir a senha.");
    }
  }

  return (
    <main className="min-h-screen bg-surface px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" className="text-sm text-navy-700/60 hover:text-navy-700">
          ← Voltar ao painel
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-navy-700">
          Gerenciar empresas
        </h1>
        <p className="mt-1 text-sm text-navy-700/60">
          Cada empresa tem seu próprio login, calculadora pública, preço e leads.
        </p>

        <form
          onSubmit={handleCreate}
          className="mt-6 space-y-3 rounded-2xl bg-card p-5 shadow-sm"
        >
          <p className="font-display text-sm font-semibold text-navy-700">
            Nova empresa
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome da empresa (ex: Flyserv)"
              className="rounded-lg border border-navy-700/15 px-3.5 py-2.5 text-sm outline-none focus:border-techblue-500"
            />
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="E-mail de acesso"
              className="rounded-lg border border-navy-700/15 px-3.5 py-2.5 text-sm outline-none focus:border-techblue-500"
            />
            <input
              type="text"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Senha (mín. 6 caracteres)"
              className="rounded-lg border border-navy-700/15 px-3.5 py-2.5 text-sm outline-none focus:border-techblue-500"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {creating ? "Criando..." : "+ Criar empresa"}
          </button>
          <p className="text-xs text-navy-700/50">
            Anote o e-mail e a senha pra repassar à empresa — essa é a conta
            que ela vai usar pra entrar no próprio painel.
          </p>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-navy-700/60">Carregando...</p>
          ) : companies.length === 0 ? (
            <p className="text-sm text-navy-700/60">Nenhuma empresa cadastrada.</p>
          ) : (
            companies.map((c) => (
              <div key={c.company_id} className="rounded-2xl bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display font-semibold text-navy-700">
                      {c.company_name || c.company_id}
                    </p>
                    <p className="text-sm text-navy-700/60">
                      /c/{c.company_id} · {c.lead_count} lead
                      {c.lead_count === 1 ? "" : "s"}
                      {c.company_id === "default" && " · empresa padrão do sistema"}
                    </p>
                    {c.admin_email && (
                      <p className="text-sm text-navy-700/60">
                        Login: {c.admin_email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href={`/c/${c.company_id}`}
                      target="_blank"
                      className="text-sm font-medium text-navy-700/70 hover:text-navy-700"
                    >
                      Ver
                    </a>
                    <Link
                      href={`/admin/config?company=${c.company_id}`}
                      className="text-sm font-medium text-techblue-600 hover:text-techblue-500"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/admin?company=${c.company_id}`}
                      className="text-sm font-medium text-navy-700/70 hover:text-navy-700"
                    >
                      Dashboard
                    </Link>
                    {c.admin_email && (
                      <button
                        onClick={() =>
                          setResettingFor(resettingFor === c.company_id ? null : c.company_id)
                        }
                        className="text-sm font-medium text-navy-700/70 hover:text-navy-700"
                      >
                        Redefinir senha
                      </button>
                    )}

                    {c.company_id !== "default" && (
                      <>
                        {confirmingDelete === c.company_id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-600">
                              Apaga leads e orçamentos também. Confirma?
                            </span>
                            <button
                              onClick={() => handleDelete(c.company_id)}
                              disabled={deleting}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                            >
                              {deleting ? "Excluindo..." : "Sim, excluir"}
                            </button>
                            <button
                              onClick={() => setConfirmingDelete(null)}
                              className="text-xs text-navy-700/60"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingDelete(c.company_id)}
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                          >
                            Excluir
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {resettingFor === c.company_id && (
                  <div className="mt-4 flex items-center gap-2 border-t border-navy-700/10 pt-4">
                    <input
                      type="text"
                      minLength={6}
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      placeholder="Nova senha (mín. 6 caracteres)"
                      className="flex-1 rounded-lg border border-navy-700/15 px-3.5 py-2 text-sm outline-none focus:border-techblue-500"
                    />
                    <button
                      onClick={() => handleResetPassword(c.company_id)}
                      disabled={resetting || resetPassword.length < 6}
                      className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      {resetting ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

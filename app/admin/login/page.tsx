"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível entrar.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-700 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-xl"
      >
        <h1 className="font-display text-2xl font-semibold text-navy-700">
          Painel administrativo
        </h1>
        <p className="mt-1 text-sm text-navy-700/60">Drone Quote</p>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-navy-700/70">E-mail</span>
          <input
            type="email"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-700/15 px-3.5 py-2.5 outline-none focus:border-techblue-500"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-navy-700/70">Senha</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-700/15 px-3.5 py-2.5 outline-none focus:border-techblue-500"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="mt-6 w-full rounded-lg bg-navy-700 px-6 py-3 font-display font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}

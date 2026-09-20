"use client";

import { useEffect, useState } from "react";

export default function PublicLinkCard({ companyId }: { companyId: string }) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  const path = companyId === "default" ? "/" : `/c/${companyId}`;

  // Calcula a URL completa só depois de montar no navegador — evita
  // erro de hidratação, já que o servidor não sabe o domínio do site.
  useEffect(() => {
    setLink(`${window.location.origin}${path}`);
  }, [path]);

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Alguns navegadores/contextos bloqueiam a Clipboard API — o link
      // continua selecionável manualmente no campo abaixo.
    }
  }

  return (
    <div className="mb-6 rounded-2xl bg-card p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-700/50">
        Seu link
      </p>
      <p className="mt-1 text-sm text-navy-700/60">
        Compartilhe esse link com seus clientes — no site, no Instagram ou
        direto pelo WhatsApp.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          readOnly
          value={link ?? path}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="flex-1 rounded-lg border border-navy-700/15 bg-surface px-3.5 py-2.5 text-sm text-navy-700"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!link}
          className="rounded-lg bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {copied ? "Copiado!" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}

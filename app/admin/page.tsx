import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import LogoutButton from "@/components/admin/LogoutButton";
import CompanySwitcher from "@/components/admin/CompanySwitcher";

export const dynamic = "force-dynamic";

interface QuoteRow {
  estimated_price: number;
  complexity_level: string;
  recurrence: string;
  requires_technical_evaluation: boolean;
  created_at: string;
  [key: string]: unknown;
}

interface LeadRow {
  name: string;
  company: string;
  city: string;
  whatsapp: string;
  created_at: string;
  [key: string]: unknown;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function countBy<T extends Record<string, unknown>>(
  rows: T[],
  key: keyof T
): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const value = String(row[key] ?? "—");
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { company?: string };
}) {
  const companyId = searchParams.company ?? "default";

  const { data: quotesData } = await supabaseAdmin
    .from("quotes")
    .select("estimated_price, complexity_level, recurrence, requires_technical_evaluation, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  const { data: leadsData } = await supabaseAdmin
    .from("leads")
    .select("name, company, city, whatsapp, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(10);

  const quotes = (quotesData ?? []) as QuoteRow[];
  const leads = (leadsData ?? []) as LeadRow[];

  const totalQuotes = quotes.length;
  const totalValue = quotes.reduce((sum, q) => sum + Number(q.estimated_price), 0);
  const avgTicket = totalQuotes > 0 ? totalValue / totalQuotes : 0;
  const needsEvaluation = quotes.filter((q) => q.requires_technical_evaluation).length;

  const byComplexity = countBy(quotes, "complexity_level");
  const byRecurrence = countBy(quotes, "recurrence");

  return (
    <main className="min-h-screen bg-surface px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-navy-700">
              Painel administrativo
            </h1>
            <p className="text-sm text-navy-700/60">
              {companyId === "default" ? (
                "Drone Quote"
              ) : (
                <>
                  {companyId} —{" "}
                  <a
                    href={`/c/${companyId}`}
                    target="_blank"
                    className="underline hover:text-navy-700"
                  >
                    ver calculadora pública
                  </a>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <CompanySwitcher basePath="/admin" />
            <Link
              href="/admin/empresas"
              className="text-sm font-medium text-navy-700/70 hover:text-navy-700"
            >
              Gerenciar empresas
            </Link>
            <Link
              href={`/admin/config?company=${companyId}`}
              className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Configurações
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Orçamentos gerados" value={String(totalQuotes)} />
          <StatCard label="Valor total estimado" value={formatCurrency(totalValue)} />
          <StatCard label="Ticket médio" value={formatCurrency(avgTicket)} />
          <StatCard
            label="Aguardando avaliação técnica"
            value={String(needsEvaluation)}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <BreakdownCard title="Complexidade das operações" data={byComplexity} />
          <BreakdownCard title="Recorrência solicitada" data={byRecurrence} />
        </div>

        <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-navy-700">
            Últimos leads
          </h2>
          {leads.length === 0 ? (
            <p className="mt-3 text-sm text-navy-700/60">
              Nenhum lead recebido ainda.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-navy-700/50">
                    <th className="pb-2 pr-4">Nome</th>
                    <th className="pb-2 pr-4">Empresa</th>
                    <th className="pb-2 pr-4">Cidade</th>
                    <th className="pb-2 pr-4">WhatsApp</th>
                    <th className="pb-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr key={i} className="border-t border-navy-700/10">
                      <td className="py-2 pr-4 font-medium text-navy-700">
                        {lead.name}
                      </td>
                      <td className="py-2 pr-4">{lead.company}</td>
                      <td className="py-2 pr-4">{lead.city}</td>
                      <td className="py-2 pr-4">{lead.whatsapp}</td>
                      <td className="py-2">
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-navy-700/50">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-navy-700">
        {value}
      </p>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-navy-700">
        {title}
      </h2>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-navy-700/60">Sem dados ainda.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {entries.map(([label, count]) => (
            <div key={label}>
              <div className="flex justify-between text-sm text-navy-700/70">
                <span>{label}</span>
                <span>{count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
                <div
                  className="h-full rounded-full bg-techblue-500"
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((session) => {
        if (session?.role === "super_admin") {
          setIsSuperAdmin(true);
          fetch("/api/admin/companies")
            .then((res) => res.json())
            .then((data) => setCompanies(Array.isArray(data) ? data : []));
        }
      });
  }, []);

  function handleSwitch(companyId: string) {
    router.push(`${basePath}?company=${companyId}`);
  }

  if (!isSuperAdmin) return null;

  return (
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
  );
}

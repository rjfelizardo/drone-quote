-- Drone Quote — Fase 5: persistência de leads e orçamentos
-- Rode este script no SQL Editor do seu projeto Supabase.

-- Tabela de leads (Bloco 23 / Bloco 28)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  company_id text not null default 'default', -- preparação pra white-label (Bloco 27)
  name text not null,
  company text not null,
  whatsapp text not null,
  email text not null,
  city text not null,
  role text,
  created_at timestamptz not null default now()
);

-- Tabela de orçamentos gerados (Bloco 21 / Bloco 28)
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  company_id text not null default 'default',
  service_type text not null default 'limpeza_fachada',
  area_m2 numeric not null,
  height text not null,
  surface text not null,
  dirt_level text not null,
  access_difficulty text not null,
  obstacles text[] not null default '{}',
  geometry text not null,
  water_available text not null,
  power_available text not null,
  recurrence text not null,
  complexity_level text not null,
  complexity_score integer not null,
  estimated_price numeric not null,
  estimated_price_per_m2 numeric not null,
  requires_technical_evaluation boolean not null default false,
  evaluation_reason text,
  created_at timestamptz not null default now()
);

create index if not exists quotes_lead_id_idx on quotes (lead_id);
create index if not exists leads_company_id_idx on leads (company_id);
create index if not exists quotes_company_id_idx on quotes (company_id);

-- RLS: o formulário roda no navegador com a chave anônima, então só liberamos
-- INSERT público. Leitura fica restrita (painel administrativo usará uma
-- chave de serviço no futuro, na Fase 6).
alter table leads enable row level security;
alter table quotes enable row level security;

create policy "Permitir insercao publica de leads"
  on leads for insert
  to anon
  with check (true);

create policy "Permitir insercao publica de quotes"
  on quotes for insert
  to anon
  with check (true);

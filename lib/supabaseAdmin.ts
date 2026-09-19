import { createClient } from "@supabase/supabase-js";

// ATENÇÃO: este cliente usa a service role key, que ignora todas as
// políticas de RLS. Nunca importe este arquivo em um componente "use client"
// nem exponha SUPABASE_SERVICE_ROLE_KEY com o prefixo NEXT_PUBLIC_.
// Uso permitido: Route Handlers (app/api/**) e Server Components do painel
// administrativo, sempre depois de verificar a senha (ver middleware.ts).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "Supabase admin não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl ?? "",
  serviceRoleKey ?? ""
);

export default function Hero({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <section className="relative flex min-h-screen items-center">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="max-w-xl">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              className="mb-6 h-12 max-w-[220px] object-contain drop-shadow-[0_2px_10px_rgba(7,26,51,0.6)]"
            />
          )}

          <span className="hidden w-fit rounded-xl border border-[var(--brand)]/40 bg-[var(--brand)]/10 px-4 py-1.5 text-sm font-medium text-[var(--brand)] backdrop-blur-sm md:inline-block">
            Ferramenta de orçamento para operadores de drone
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-white [text-shadow:0_2px_16px_rgba(7,26,51,0.7)] md:text-5xl">
            Descubra quanto pode custar sua próxima operação com drone
          </h1>

          <p className="mt-5 max-w-md text-lg text-white [text-shadow:0_1px_10px_rgba(7,26,51,0.75)]">
            Informe alguns detalhes do serviço e receba uma estimativa de
            investimento em poucos minutos.
          </p>

          <a
            href="#calculadora"
            className="mt-8 inline-block w-fit rounded-lg bg-[var(--brand)] px-7 py-3.5 font-display text-base font-semibold text-white transition-all hover:brightness-90"
          >
            Calcular meu orçamento
          </a>

          <div className="mt-10 flex gap-8 text-white/90 [text-shadow:0_1px_8px_rgba(7,26,51,0.7)]">
            <div>
              <p className="font-display text-2xl font-semibold text-white">
                +80%
              </p>
              <p className="text-sm">mais rápido que vistoria manual</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-white">
                100%
              </p>
              <p className="text-sm">padronizado por operação</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

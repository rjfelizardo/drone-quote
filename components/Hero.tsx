export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="max-w-xl">
          <span className="inline-block w-fit rounded-xl border border-techblue-400/40 bg-techblue-500/10 px-4 py-1.5 text-sm font-medium text-techblue-400 backdrop-blur-sm">
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
            className="mt-8 inline-block w-fit rounded-lg bg-gold-500 px-7 py-3.5 font-display text-base font-semibold text-navy-900 transition-colors hover:bg-gold-400"
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

const benefits = [
  {
    title: "Resposta comercial mais rápida",
    description:
      "O cliente recebe uma estimativa em minutos, sem esperar uma visita técnica.",
  },
  {
    title: "Padronização de orçamento",
    description:
      "Os mesmos critérios técnicos são aplicados em toda solicitação recebida.",
  },
  {
    title: "Captura de leads qualificados",
    description:
      "Cada simulação já chega com os dados operacionais que sua equipe precisa.",
  },
  {
    title: "Preparação para a vistoria",
    description:
      "A equipe técnica chega ao local sabendo o que esperar da operação.",
  },
];

export default function Benefits() {
  return (
    <section className="relative bg-transparent py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-white [text-shadow:0_2px_14px_rgba(7,26,51,0.75)]">
          Para empresas operadoras de drone
        </h2>
        <p className="mt-2 max-w-xl text-white/90 [text-shadow:0_1px_10px_rgba(7,26,51,0.8)]">
          Uma ferramenta comercial que transforma solicitações em
          pré-orçamentos prontos para validação.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="border-l-2 border-gold-500 pl-5">
              <h3 className="font-display text-lg font-semibold text-white [text-shadow:0_1px_10px_rgba(7,26,51,0.8)]">
                {b.title}
              </h3>
              <p className="mt-1.5 text-white/85 [text-shadow:0_1px_8px_rgba(7,26,51,0.8)]">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

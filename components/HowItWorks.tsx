const steps = [
  {
    number: "1",
    title: "Descreva a operação",
    description:
      "Informe área, altura, tipo de superfície e condições de acesso do local.",
  },
  {
    number: "2",
    title: "O sistema calcula",
    description:
      "O motor combina os fatores técnicos e retorna produtividade, prazo e complexidade.",
  },
  {
    number: "3",
    title: "Receba a estimativa",
    description:
      "Veja o valor estimado e envie os dados direto para a equipe operadora pelo WhatsApp.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-surface px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
      <h2 className="font-display text-3xl font-semibold text-navy-700">
        Como funciona
      </h2>
      <p className="mt-2 max-w-xl text-navy-700/70">
        Três passos entre a solicitação do cliente e uma estimativa pronta
        para validação técnica.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.number} className="relative">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-700 font-display text-lg font-semibold text-white">
                {step.number}
              </span>
              {i < steps.length - 1 && (
                <span className="hidden h-px flex-1 bg-navy-700/15 md:block" />
              )}
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold text-navy-700">
              {step.title}
            </h3>
            <p className="mt-2 text-navy-700/70">{step.description}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

# Drone Quote — Fase 1

Ferramenta configurável de orçamento e pré-vistoria comercial para operadores
de drone. Esta é a **Fase 1** do projeto: landing page navegável + calculadora
funcional, com dados mockados (sem banco de dados ainda).

## Arquivos criados

```
app/
  layout.tsx        — layout raiz, fontes (Space Grotesk + IBM Plex Sans)
  page.tsx           — monta a landing page
  globals.css        — estilos globais
components/
  Hero.tsx            — seção inicial
  HowItWorks.tsx      — seção "Como funciona"
  Calculator.tsx      — calculadora multi-etapas (o núcleo da Fase 1)
  Benefits.tsx        — seção de benefícios para empresas operadoras
  Footer.tsx          — rodapé
lib/
  config.ts           — todos os parâmetros de precificação (Bloco 37)
  pricingEngine.ts     — motor de cálculo isolado do frontend (Bloco 17-18)
tailwind.config.ts     — tokens de cor e tipografia do projeto
```

## Funcionalidades implementadas

- Landing page completa (Hero, Como Funciona, Calculadora, Benefícios, Rodapé)
- Imagem de fundo fixa (efeito parallax) — o conteúdo rola por cima
- Calculadora em 7 etapas: área, altura, superfície, sujeira/acesso,
  obstáculos/geometria, água-energia-recorrência, resultado
- Motor de precificação real (`calculateQuote`), seguindo a fórmula do
  prompt original (Bloco 18), com todos os fatores configuráveis em um único
  arquivo (`lib/config.ts`) — nada hardcoded nos componentes
- Detecção de "avaliação técnica obrigatória" quando altura, superfície,
  sujeira ou obstáculos saem do padrão (Bloco 33)
- Captura de lead (nome, empresa, WhatsApp, e-mail, cidade, cargo — Bloco 23)
- **Persistência no Supabase**: cada lead + orçamento gerado é salvo nas
  tabelas `leads` e `quotes` (Bloco 28)
- Geração automática de mensagem de WhatsApp com o resumo da operação
  (Bloco 24)
- Design responsivo mobile-first, com barra de progresso e microinterações
  discretas

## Configurando o Supabase (Fase 5)

1. Crie um projeto no [supabase.com](https://supabase.com) (ou use um
   projeto existente)
2. No **SQL Editor** do projeto, rode o script `supabase/schema.sql` —
   ele cria as tabelas `leads` e `quotes` com as permissões corretas
3. Copie `.env.local.example` para `.env.local` e preencha com a URL e a
   chave anônima do seu projeto (**Project Settings → API**)
4. Na Vercel, adicione as mesmas duas variáveis em
   **Settings → Environment Variables**, depois refaça o deploy

Sem essas variáveis configuradas, a calculadora continua funcionando
normalmente (mostra a estimativa e o link do WhatsApp), mas o
salvamento do lead falha silenciosamente com uma mensagem de erro na tela.

## Não implementado ainda (fases futuras)

- Painel administrativo (Fase 6) — hoje os leads só existem nas tabelas
  do Supabase, sem interface própria pra visualizá-los
- Upload de fotos e pré-vistoria com IA
- Multi-tenant / white-label completo (`company_id` já existe nas tabelas,
  mas ainda fixo como `'default'`)
- Geração de PDF
- Planos e assinatura (SaaS)

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Como publicar (Vercel)

1. Suba esta pasta para um repositório no GitHub
2. Importe o repositório na Vercel
3. Deploy automático — sem variáveis de ambiente necessárias nesta fase

## Próximos passos sugeridos

1. Validar a experiência da calculadora e o visual com você
2. Ajustar `lib/config.ts` com os valores reais de precificação da empresa
   que for usar o produto primeiro (Flyserv ou outra)
3. Avançar para a Fase 5 do prompt original: Supabase + persistência de
   leads

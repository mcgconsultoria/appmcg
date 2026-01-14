# Resumo da Conversa - 02 de Janeiro de 2026

## Contexto da Sessao

Esta conversa focou em uma avaliacao tecnica e de negocios completa do MCG Consultoria, com criacao de um plano de negocios para 2026.

---

## 1. Analise Tecnica e de Negocios

### Proposta de Valor - O Que o MCG Resolve

O MCG preenche uma lacuna real no mercado de logistica: a gestao comercial. ERPs tradicionais como KMM/WMS/TMS focam na operacao (armazem, transporte), mas ignoram o lado comercial.

**Dores que o sistema endereca:**
- Falta de CRM especializado para logistica
- Processos comerciais desorganizados (propostas, visitas, follow-ups)
- Dificuldade em calcular fretes e armazenagem rapidamente
- Ausencia de diagnostico estruturado de clientes (checklist com 18 secoes)
- Desconexao entre area comercial e operacional
- Falta de visibilidade do funil de vendas e pipeline

### Modulos Implementados (Status)

| Modulo | Status | Valor para o Cliente |
|--------|--------|---------------------|
| CRM + Pipeline | Completo | Gestao de clientes e oportunidades |
| Calculadoras (Frete/Armazenagem) | Completo | Cotacoes rapidas com ICMS |
| Checklist 18 Secoes | Completo | Diagnostico comercial estruturado |
| Ata de Reuniao + PDF | Completo | Documentacao profissional |
| Calendario Comercial | Completo | Agenda de visitas/eventos |
| Tarefas + Projetos | Completo | Gestao de atividades |
| RFI (Licitacoes) | Completo | Preparacao para BIDs |
| Fluxograma Comercial | Completo | Visualizacao da jornada |
| Integracao Google | Funcional | Gmail, Calendar, Sheets |
| Stripe (Assinaturas) | Funcional | Monetizacao |
| Loja MCG | Estrutura pronta | E-commerce de e-books |
| Admin Financeiro | Em progresso | Gestao financeira |

### Arquitetura - Pontos Fortes

- Stack moderna (React + Express + PostgreSQL + Drizzle)
- Tipos compartilhados entre frontend e backend
- Estrutura multi-empresa (companyId) ja existe
- Integracoes modulares (Google, Stripe, WhatsApp)
- Auditoria de acoes implementada

### Pontos a Melhorar para Escalar

- Isolamento de dados entre empresas precisa ser reforcado em todas as consultas
- Necessita sistema de filas para processos em background (emails, integracoes)
- Falta monitoramento e observabilidade para producao
- Backup automatizado do banco de dados

### Diferencial Competitivo vs. ERPs Tradicionais

| MCG Consultoria | ERPs (KMM, WMS, TMS) |
|-----------------|---------------------|
| Foco comercial e pre-venda | Foco operacional |
| Checklist de diagnostico | Nao existe |
| Calculadoras de cotacao | Limitadas |
| Fluxograma visual da jornada | Nao existe |
| Leve e acessivel (web/mobile) | Pesados e complexos |
| Implementacao rapida | Meses de implantacao |

---

## 2. Plano de Negocios 2026

### Precificacao Sugerida

**Planos de Assinatura:**
| Produto | Preco | O que inclui |
|---------|-------|--------------|
| Plano Free | R$ 0 | Calculadoras + 5 clientes no CRM |
| Plano Professional | R$ 499/mes | CRM completo, Checklist, Atas PDF, Google Sync, Calendario |
| Plano Enterprise | R$ 1.499/mes | Tudo + Multi-filiais, WhatsApp, Suporte prioritario |

**E-books (Trilogia "A Arte do Comercial em Logistica"):**
| Produto | Preco |
|---------|-------|
| Volume individual | R$ 97 |
| Combo Trilogia | R$ 249 |

**Outros Produtos:**
| Produto | Preco |
|---------|-------|
| Manuais digitais | R$ 59 a R$ 149 |
| Brindes corporativos | Margem de 35% (ticket medio R$ 120) |

**Oferta de Lancamento:**
Bundle Professional + Trilogia + Manual = R$ 699/mes (primeiros 6 meses)

### Metas de Clientes

| Cenario | Clientes/Mes | Total Ano | Perfil |
|---------|--------------|-----------|--------|
| Conservador | 1 | 12 | 60% Professional, 40% Enterprise |
| Moderado | 2 | 24 | 70% Professional, 30% Enterprise |
| Agressivo | 5 | 60 | 80% Professional, 20% Enterprise |

### Projecao de Receitas 2026

| Cenario | Faturamento Anual | Media Mensal Q4 |
|---------|-------------------|-----------------|
| Conservador | R$ 420.000 | R$ 45.000 |
| Moderado | R$ 828.000 | R$ 96.000 |
| Agressivo | R$ 1.548.000 | R$ 210.000 |

*Inclui 15% de vendas adicionais de e-books e produtos*

### Custos Operacionais Mensais

| Item | Valor Mensal |
|------|--------------|
| Infraestrutura (Replit, banco, dominio, CDN) | R$ 3.500 |
| Integracoes (Google, WhatsApp, taxas Stripe) | R$ 1.200 |
| Marketing e Vendas | R$ 12.000 |
| - Midia paga (Google/Meta Ads) | R$ 6.000 |
| - SDR/Vendedor freelancer | R$ 3.000 |
| - Eventos e networking | R$ 2.000 |
| - Producao de conteudo | R$ 1.000 |
| Producao Editorial (livro, design, revisao) | R$ 2.500 |
| Contingencia | R$ 1.000 |
| **TOTAL OPEX** | **R$ 20.200/mes** |

### Ponto de Equilibrio (Break-Even)

Para cobrir R$ 20.200/mes:
- Apenas Professional (R$ 499): 41 clientes
- Mix: 32 Professional + 6 Enterprise: 38 clientes

| Cenario | Mes de Break-Even |
|---------|-------------------|
| Conservador | Mes 11 |
| Moderado | Mes 7 |
| Agressivo | Mes 4 |

### Cronograma de Lancamento 2026

**Q1 - Pre-Lancamento (Jan-Mar)**
- Beta fechado com 10 consultorias parceiras
- Coletar depoimentos e casos de sucesso
- Finalizar isolamento de dados multi-empresa
- Preparar materiais de venda (apresentacao, calculadora de ROI)

**Q2 - Lancamento Oficial (Abr-Jun)**
- Webinar "Jornada Comercial em Logistica"
- Oferta bundle de lancamento
- Ativar base de contatos NStech/KMM
- Primeiros 15-20 clientes pagantes

**Q3 - Escala (Jul-Set)**
- Parceria formal NStech/KMM
- Participacao em eventos (Intermodal, ConeLog)
- Programa de parceiros consultores
- Meta: 40 clientes ativos

**Q4 - Expansao (Out-Dez)**
- Foco em Enterprise (grandes operadores)
- Integracao QualP para calculo de rotas
- Lancamento fisico da trilogia com coquetel
- Meta: 60+ clientes ativos

### Resumo Financeiro Anual

| Item | Conservador | Moderado | Agressivo |
|------|-------------|----------|-----------|
| Receita Bruta | R$ 420.000 | R$ 828.000 | R$ 1.548.000 |
| Custos Anuais | R$ 242.400 | R$ 266.640 | R$ 290.880 |
| **Lucro Liquido** | **R$ 177.600** | **R$ 561.360** | **R$ 1.257.120** |
| Margem | 42% | 68% | 81% |

---

## 3. Produto de Referencia (MVP Pronto)

### Modulos 100% Funcionais

1. **CRM de Logistica** - Cadastro de clientes, Pipeline de vendas, Meta por cliente
2. **Calculadoras Comerciais** - Frete com ICMS de 27 estados, Armazenagem
3. **Checklist Comercial (18 Secoes)** - Diagnostico completo do cliente
4. **Ata de Reuniao (Plano de Acao)** - Registro de reunioes, PDF profissional, envio por email
5. **Calendario Comercial** - Eventos com integracao Google Calendar
6. **Tarefas e Projetos** - Gestao com prioridades e lembretes por email
7. **RFI (Request for Information)** - Perfil tecnico para licitacoes
8. **Fluxograma Comercial** - Mapa visual da jornada comercial (18 etapas)
9. **Sistema de Assinaturas** - Planos Free, Professional, Enterprise via Stripe

### O Que Pode Demonstrar Hoje

1. Jornada do Usuario Gratuito: Calculadoras de frete/armazenagem na landing page
2. Jornada do Cliente: Cadastro -> Dashboard -> CRM -> Checklist -> Ata de Reuniao -> Calendario
3. Diferenciais: Fluxograma visual, checklist de 18 secoes, integracao Google
4. Modelo de Negocio: Assinatura mensal via Stripe

### Publico-Alvo Imediato

- Consultores de logistica
- Equipes comerciais de transportadoras
- Operadores logisticos buscando organizar vendas
- Empresas participando de licitacoes (BIDs)

---

## 4. Proximos Passos Prioritarios

1. **Seguranca Multi-Empresa** (Alta prioridade) - Garantir isolamento de dados por empresa
2. **Onboarding Estruturado** - Fluxo guiado para novas empresas
3. **Infraestrutura de Producao** - Monitoramento, logs, backups automaticos
4. **Integracao KMM/QualP** - Diferencial estrategico com parceria NStech
5. **Marketing e Vendas** - Landing page otimizada, casos de uso, demonstracoes

---

## 5. Conclusao

O MCG Consultoria ja e um produto funcional com valor real para o mercado. A base tecnica e solida. O que falta sao refinamentos de seguranca multi-tenant e infraestrutura de producao para escalar com confianca. Como negocio, tem potencial de ser o "CRM da logistica brasileira".

---

*Documento gerado em 02/01/2026*
*Arquivo salvo em: docs/resumo_conversa_2026-01-02.md*

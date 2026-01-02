# Historico de Conversas - MCG Consultoria

Este arquivo documenta as principais discussoes e decisoes tomadas durante o desenvolvimento do MCG Consultoria.

---

## 02 de Janeiro de 2026 (Parte 2) - Modelo de Usuarios e Seguranca

### Topicos Discutidos
1. **Modelo de Precificacao de Usuarios** - Definicao de usuarios inclusos e adicionais
2. **Seguranca por CNPJ Raiz** - Agrupamento de matriz/filiais pelos 8 primeiros digitos
3. **Controle de Sessao Unica** - Impedir login simultaneo do mesmo usuario
4. **Fluxo de Aprovacao MCG** - Todos os cadastros precisam aprovacao antes de liberar acesso
5. **Plano Consultoria** - Modelo temporario com 2 acessos durante projeto

### Decisoes Tomadas - Modelo de Planos

| Plano | Valor Base | Usuarios Inclusos | Usuario Extra |
|-------|-----------|-------------------|---------------|
| Free | R$ 0 | 1 | N/A |
| Professional | R$ 499/mes | 1 | +R$ 69/mes cada |
| Enterprise | R$ 1.499/mes | 1 | +R$ 69/mes cada |
| Consultoria (temp) | Valor a parte | 2 | Apos fim -> plano normal |

### Regras de Negocio Definidas
1. **Sessao Unica**: Um usuario nao pode estar logado em 2 dispositivos ao mesmo tempo
2. **Cobranca Pro-Rata**: Ao adicionar/remover usuarios, calcular proporcional ao dia
3. **Aprovacao MCG**: Todos os planos (inclusive Free) precisam aprovacao MCG para liberar acesso
4. **CNPJ Raiz**: Campo completo no formulario, mas sistema agrupa por 8 primeiros digitos (matriz/filiais)
5. **1 Admin por CNPJ Raiz**: Apenas 1 administrador principal por grupo empresarial
6. **Consultoria Temporaria**: 2 acessos inclusos durante projeto, depois migra para plano pago

### Fluxo de Cadastro Proposto
1. Usuario escolhe plano na landing page
2. Faz pagamento via Stripe (exceto Free)
3. Preenche formulario de cadastro
4. MCG recebe solicitacao no Admin MCG
5. MCG aprova -> usuario recebe email de confirmacao e acesso liberado

### Proximos Passos
- [ ] Implementar controle de sessao unica
- [ ] Criar campo cnpjRaiz na tabela companies
- [ ] Criar fluxo de aprovacao no Admin MCG
- [ ] Integrar limites de usuarios com Stripe
- [ ] Implementar cobranca pro-rata

---

## 02 de Janeiro de 2026 (Parte 1)

### Topicos Discutidos
1. **Avaliacao Tecnica e de Negocios** - Analise completa do produto como referencia de mercado
2. **Plano de Negocios 2026** - Precificacao, metas de clientes, projecoes financeiras
3. **Break-Even Analysis** - 41 clientes Professional ou mix de 32 Pro + 6 Enterprise
4. **Cronograma de Lancamento** - Q1 pre-lancamento, Q2 lancamento, Q3 escala, Q4 expansao

### Decisoes Tomadas
- Preco Professional: R$ 499/mes
- Preco Enterprise: R$ 1.499/mes
- E-book individual: R$ 97 | Trilogia: R$ 249
- Custos operacionais estimados: R$ 20.200/mes
- Meta conservadora: 12 clientes/ano | Meta agressiva: 60 clientes/ano

### Arquivos Atualizados
- `replit.md` - Adicionado plano de negocios completo
- `docs/resumo_conversa_2026-01-02.md` - Resumo detalhado da conversa

---

## Historico Anterior (10 Dez 2025 - 01 Jan 2026)

*Nota: Conversas anteriores nao foram documentadas em tempo real. Abaixo esta um resumo baseado no estado atual do projeto:*

### Principais Desenvolvimentos Realizados

**Dezembro 2025 - Fase 1: Fundacao**
- Estrutura base do projeto (React + Express + PostgreSQL)
- Sistema de autenticacao customizado
- Landing page e calculadoras publicas (Frete/Armazenagem)
- CRM basico com pipeline de vendas

**Dezembro 2025 - Fase 2: Modulos Comerciais**
- Checklist comercial com 18 secoes
- Ata de Reuniao com geracao de PDF
- Calendario comercial
- Tarefas e Projetos
- RFI para licitacoes
- Fluxograma Comercial (mind map da jornada)

**Dezembro 2025 - Fase 3: Integracoes**
- Integracao Google (Gmail, Calendar, Sheets, Drive)
- Stripe para assinaturas
- PWA para mobile
- Estrutura da Loja MCG

**Janeiro 2026 - Fase 4: Producao**
- Resolucao de problemas de email (Gmail OAuth)
- Separacao de banco de dados dev/producao
- Documentacao do plano de negocios

---

## Como Este Arquivo Sera Atualizado

A cada conversa significativa, o assistente adicionara:
1. Data da conversa
2. Topicos principais discutidos
3. Decisoes tomadas
4. Arquivos modificados
5. Proximos passos definidos

Este arquivo e versionado no Git e serve como memoria permanente do projeto.

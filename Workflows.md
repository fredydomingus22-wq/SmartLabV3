# **10 – Workflows.md**

### **SmartLab Enterprise – Workflows Operacionais & Auditoráveis**

### *(Versão Premium – Narrativo + Fluxo Detalhado)*

---

# **00. Introdução ao Documento**

Este documento define **todos os workflows operacionais**, contemplando:

* fluxo narrativo (alto nível)
* fluxo detalhado (passo a passo, inputs/outputs, triggers, IA, permissões)
* rastreabilidade completa
* conformidade com FSSC 22000, ISO 9001, HACCP, ISO 22000

É a referência oficial para implementação, desenvolvimento e auditorias internas/externas.

---

# **01. Workflow – Lote de Produção (Lote Pai)**

## **Narrativo (alto nível)**

1. Gestor cria um novo lote pai (produção).
2. Define produto, linha, turno, OP, responsável.
3. Sistema gera o lote com ID único.
4. IA valida coerência de dados.
5. Lote segue para criação de lotes intermédios.

## **Fluxo Detalhado**

**Ator:** Administrador / Gestor de Qualidade
**Tela:** `/production-lots/create`
**Entidade:** `production_lot`

| Etapa | Ação           | Input                     | Output       | Trigger                           | Permissão          |
| ----- | -------------- | ------------------------- | ------------ | --------------------------------- | ------------------ |
| 1     | Criar lote pai | Produto, linha, turno, OP | Lote Pai     | Gerar ID                          | Admin / QA Manager |
| 2     | Validar        | Dados, limites            | OK/Erro      | Validação IA                      | Sistema            |
| 3     | Aprovar        | Review                    | Lote "ativo" | Disponível para lotes intermédios | QA Manager         |

**Integrações:**

* Plano de amostragem
* Fórmulas/ingredientes
* IA valida coerência

---

# **02. Workflow – Produto Intermédio (Xarope)**

## **Narrativo**

1. Para cada lote pai, podem existir vários lotes intermédios (xaropes).
2. Cada lote intermédio carrega automaticamente o plano de amostragem.
3. Técnicos registam análises, ingredientes e suas respectivas quantidades usadas
4. Sistema cruza especificações e valida.

## **Fluxo Detalhado**

**Ator:** Admin / QA / Supervisor
**Tela:** `/intermediate-lots/create`

| Etapa | Ação                             | Input               | Output                    | Trigger          | Permissão  |
| ----- | ---------------------            | ------------------- | ------------------------- | ---------------- | ---------- |
| 1     | Selecionar lote pai              | ID do lote          | -                         | Carregar specs   | Admin / QA |
| 2     | Criar lote intermédio            | Código, tanque      | Lote intermédio           | Gerar ID         | Admin      |
| 3     | Registar análises e ingredientes | Formulário dinâmico | Resultados                | Validar specs    | Técnicos   |
| 4     | Aprovar                          | Revisão             | Status aprovado/bloqueado | IA alerta desvio | Supervisor |

---

# **03. Produto Final – Amostras & Análises**

## **Narrativo**

1. Cada produto intermédio permite gerar várias amostras finais.
2. Formulário dinâmico carrega automaticamente parâmetros e limites.
3. IA identifica tendências e anomalias.
4. Desvios geram NC automática.

## **Fluxo Detalhado**

**Tela:** `/finished-lots/create`

| Etapa | Ação             | Input                          | Output             | Trigger        | Permissão |
| ----- | ---------------- | ------------------------------ | ------------------ | -------------- | --------- |
| 1     | Criar amostra    | Lote intermédio                | Amostra gerada     | Carregar specs | Técnico   |
| 2     | Registar análise | Valores de Brix, CO₂, pH, etc. | Resultado          | Validação IA   | Técnico   |
| 3     | Revisão          | Dados                          | Aprovado/Bloqueado | NC automática  | QA        |

---

# **04. Gestão de Amostras (Pipeline)**

## **Narrativo**

Pipeline completo:
**Pending → In Analysis → Review → Approved/Rejected**

## **Fluxo Detalhado**

**Tela:** `/lab-tests`

| Estado      | Quem altera | Trigger automático              |
| ----------- | ----------- | ------------------------------- |
| Pending     | Técnico     | Novo registo                    |
| In Analysis | Técnico     | Primeira medição                |
| Review      | Supervisor  | Resultado fora da especificação |
| Approved    | QA Manager  | Todos em conformidade           |
| Rejected    | QA Manager  | Desvio crítico                  |

---

# **05. Materiais & Matéria-Prima**

## **Narrativo**

1. Receber material → inspecionar → anexar COA → aprovar/rejeitar.
2. Ligar material aos lotes e análises.

## **Fluxo Detalhado**

**Tela:** `/raw-material-lots/create`

| Etapa                | Ação                      | Output                        |
| -------------------- | ------------------------- | ----------------------------- |
| Receção              | Registar fornecedor, lote | Lote RM criado                |
| Inspeção             | Preencher checklist       | Aprovado/Quarentena/Rejeitado |
| COA                  | Upload                    | Validação automática          |
| Avaliação fornecedor | Score                     | Atualizar risco               |

---

# **06. Reagentes & Inventário**

## **Workflow**

Entrada → Saída → Nível de estoque → Alerta de validade → Bloqueio automático.

**Tela:** `/reagents`

| Trigger automático | Descrição                   |
| ------------------ | --------------------------- |
| Reagente vencido   | Bloqueado                   |
| Estoque crítico    | E-mail + alerta visual      |
| Falta de reagente  | Análises dependentes travam |

---

# **07. NC (Não Conformidades)**

## **Workflow Narrativo**

1. Sistema ou utilizador cria NC.
2. Classificação (minor, major, crítica).
3. RCA (5 porquês/Ishikawa).
4. Ações corretivas.
5. Encerramento.

## **Fluxo Detalhado**

**Tela:** `/nc/create`

| Etapa        | Output     | Trigger               |
| ------------ | ---------- | --------------------- |
| Abertura     | NC criada  | Desvio ou utilizador  |
| Investigação | RCA        | IA sugere causa       |
| Ações        | Plano      | Responsável atribuído |
| Verificação  | Evidências | Auditor               |
| Encerramento | NC fechada | QA Manager            |

---

# **08. Relatório 8D**

**Tela:** `/nc/8d/[id]`

Fluxo completo D0 a D8, com IA auxiliando.

---

# **09. Auditorias (Internas & Externas)**

## **Workflow**

Planeamento → Execução → Evidências → Relatório → Follow-up.

| Etapa       | Output              |
| ----------- | ------------------- |
| Planeamento | Agenda e escopo     |
| Execução    | Checklists + fotos  |
| Evidências  | Anexadas            |
| NCs         | Ligadas à auditoria |
| Relatório   | PDF automático      |
| Follow-up   | Ações corretivas    |

---

# **10. Food Safety (PCC / PRP / OPRP)**

## **Workflow**

Monitoramento → Registro → Validação → Alerta de desvio → Ações corretivas.

**Tela:** `/food-safety/pcc`

| Automação                   | Resultado                |
| --------------------------- | ------------------------ |
| Valor fora do limite        | NC automática            |
| PCC repetidamente irregular | Trigger análise trend IA |

---

# **11. Equipamentos & Calibração**

## **Workflow**

Registrar → Agendar calibração → Upload certificado → Atualizar status.

| Trigger             | Ação            |
| ------------------- | --------------- |
| Calibração vencida  | Bloqueio de uso |
| Equipamento crítico | E-mail + alerta |

---

# **12. IA – Fluxo Operacional**

| Evento              | Output              |
| ------------------- | ------------------- |
| Desvio identificado | NC automática       |
| Tendência irregular | Alerta antecipado   |
| Repetição de falha  | Sugerir RCA         |
| Análise incompleta  | Aviso ao técnico    |
| Padrão quebrado     | Bloqueio da amostra |

---

# **13. Traceability (Rastreabilidade Completa)**

## **Fluxo Completo**

Matéria-prima → Lote Pai → Produto Intermédio → Produto Acabado → Testes → NC/8D → Auditorias.

Sistema cria um mapa visual completo.

---

# **Documento concluído.**

Pronto para integrações com UI, backend e lógica de IA.

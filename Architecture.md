# **SmartLab – Arquitetura Enterprise (Documento 02)**

Este documento descreve a arquitetura completa do **SmartLab Enterprise**, refletindo uma solução industrial robusta, escalável, multiplanta e com suporte total para requisitos de FSSC 22000, ISO 9001, HACCP, ISO 17025 e modelos globalmente adotados por grandes indústrias (Coca‑Cola, PepsiCo, Heineken, Nestlé).

---

# **1. Arquitetura Geral (High-Level Overview)**

A arquitetura do SmartLab segue o padrão moderno de plataformas industriais:

**Front-end:** Next.js 14, React 18, Tailwind industrial dark

**Back-end:** Supabase (Postgres) + Edge Functions (Node 18)

**IA:** Modelos LLM + pipelines internos (estatística, QC, previsões)

**Data Layer:** Estrutura normalizada + tabelas dinâmicas

**Tenant Layer:** Multi-tenant isolado por fábrica (schema-based ou row-level security)

**Orquestração:** Event-driven + cron jobs para cálculos estatísticos

**Segurança:** RBAC completo + assinatura eletrónica + auditoria 360°

---

# **2. Arquitetura Física**

## **2.1 Componentes Principais**

* **Client/UI** → navegador web, intranet, tablets industriais
* **API Layer** → Supabase REST/GraphQL + Edge Functions
* **Database** → PostgreSQL com RLS, triggers, views e procedures
* **Storage** → Supabase Storage (COA, PDFs, anexos)
* **Queue/Event Bus** → Supabase Functions + Webhooks
* **Analytics Engine** → Módulo SPC + IA + ETL interno
* **Monitoring** → Logs, auditoria, alerts

## **2.2 Diagram (Markdown)**

```
[Browser UI]
     |
     v
[Next.js 14 App Router]
     |
     v
[Supabase Auth] -- (RBAC/RLS)
     |
     v
[Supabase Postgres] <---> [Analytics Engine]
     |
     v
[Storage | Edge Functions | Triggers]
```

---

# **3. Arquitetura Lógica (Módulos)**

A plataforma é dividida em **15 módulos independentes**:

1. **Core / Auth / RBAC**
2. **Produção (Lotes Pai)**
3. **Produto Intermédio (Xarope / Mistura)**
4. **Produto Acabado (Amostras)**
5. **Matéria-prima e Material de Embalagem**
6. **Fornecedores & Auditorias**
7. **Reagentes & Inventário Laboratorial**
8. **Equipamentos / Calibração / Manutenção**
9. **Laboratório (LIMS)**
10. **Especificações & Parâmetros (Spec Engine)**
11. **Form Builder Dinâmico**
12. **Plano de Amostragem (Sampling Engine)**
13. **Food Safety: PRP, OPRP e PCC**
14. **NC + 8D + Gestão de Desvios**
15. **Analytics & IA (SPC + Predições + Anomalias)**

Cada módulo tem APIs, tabelas e permissões próprias.

---

# **4. Arquitetura de Dados (Banco + Estrutura Dinâmica)**

## **4.1 Modelo Core**

As entidades fundamentais são:

### **Users / Roles / Permissions**

* Implementação via Supabase Auth + tabelas de roles
* RLS por tenant + por função

### **Production → Intermediate → Finished**

```
production_lot (pai)
    ↓ (1:N)
intermediate_lot (xarope)
    ↓ (1:N)
finished_lot
    ↓ (1:N)
analyses
```

### **Raw Materials → RM Lots → Analyses**

```
raw_material
    ↓ (1:N)
raw_material_lot
    ↓ (1:N)
analyses
```

---

## **4.2 Dynamic Spec Engine (parâmetros flexíveis)**

### **Tabela parameters**

* nome
* unidade
* tipo
* criticidade
* métodos

### **Tabela product_specs**

* produto
* parâmetro
* min / target / max
* exceções por linha/turno

### **Tabela form_fields**

* campos dinâmicos por formulário

✔ Isto permite criar formulários 100% personalizados.

---

# **5. Arquitetura Multi‑Tenant**

Duas opções possíveis:

### **A) Row-Level Security (RLS)**

* Shared database
* Tabelas com tenant_id
* Máscaras de acesso

### **B) Schema per Tenant** (Enterprise)

* Banco isolado por fábrica
* Zero risco cruzado

Para o MVP, recomendamos **RLS**.

---

# **6. Arquitetura de Segurança / Governança**

Inclui:

* RBAC completo
* Auditoria 360° (quem mexeu em quê)
* E-signature (assinatura eletrónica)
* Hash criptográfico de logs
* MFA opcional
* Monitorização automática
* Alertas críticos (equipamento vencido, PCC fora)

---

# **7. Arquitetura do Motor de IA**

A IA opera em 4 camadas:

### **1. Data Normalization Layer**

* Converte resultados em um formato unificado

### **2. Statistical Engine (SPC)**

* X-bar
* R chart
* I-MR
* Machine capability (Cp/Cpk)

### **3. Anomaly Detection**

* IA detecta padrões perigosos
* Identifica tendência antes de virar falha

### **4. QA‑Copilot**

* Explica desvios
* Sugere root cause
* Gera relatórios automáticos
* Preenche 8D automaticamente

---

# **8. Arquitetura do Dashboard (UX Industrial Premium)**

Inclui:

* KPIs executivos
* Tendências em tempo real
* Heatmaps (produto × linha × parâmetro)
* Pareto
* SPC charts
* Performance de analistas
* Performance de fornecedores
* Alertas automáticos

---

# **9. Fluxos Internos Críticos**

## **9.1 Fluxo Lote Pai → Produto Final**

```
Criar Lote → Criar Intermédios → Registrar Produto Final → Validar → Liberar
```

## **9.2 Fluxo Matéria-prima**

```
Receber → Avaliar → Anexar COA → Aprovar/Rejeitar → Liberar
```

## **9.3 Fluxo de Análises**

```
Coletar amostra → Selecionar formulário → IA sugere → Assinatura → Validação
```

## **9.4 Fluxo de NC / 8D**

```
Detectar desvio → Abrir NC → IA propõe D2 → Investigação → Ações → Fechar
```

---

# **10. Infraestrutura Recomendada**

### **Cloud (MVP):**

* Vercel (front-end)
* Supabase (backend)

### **Enterprise:**

* Kubernetes cluster
* Load balancer
* Kafka/EventBridge
* Data warehouse
* Backup multi‑region

---

# **11. Próximos Documentos**

O próximo arquivo será:

📄 **03‑Domain‑Model.md**

Basta dizer: **"Avança com o 03"**.

---

SmartLab Enterprise Architecture v1 – ZimbotechIA

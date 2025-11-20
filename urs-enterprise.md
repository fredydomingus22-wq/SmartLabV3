# SmartLab Enterprise — 04. User Requirements Specification (URS)

## 🔥 1. Introdução

Este documento URS define todos os requisitos funcionais e não funcionais do **SmartLab Enterprise**, um sistema integrado de QA/QC, Segurança Alimentar e Inteligência de Dados para indústrias de bebidas e alimentos.

A URS foi estruturada seguindo padrões internacionais:

* ISO 9001
* ISO 22000
* FSSC 22000
* HACCP (PRP, OPRP, PCC)
* ISO 17025
* Referências da PepsiCo KORE & Coca-Cola InfinityQS

Esta é a versão **Enterprise MVP**, já construída para competir com plataformas premium do mercado.

---

# 🧱 2. Escopo do Sistema

O SmartLab Enterprise deve:

1. Digitalizar todas as operações de qualidade e laboratório
2. Automatizar análises estatísticas, tendências e desvios
3. Permitir criação dinâmica de parâmetros, especificações e formulários
4. Gerir lotes pai → intermédios → final com rastreabilidade total
5. Controlar matéria-prima, fornecedores, reagentes e equipamentos
6. Fornecer dashboards em tempo real com IA
7. Registrar NC, 8D, Auditorias e verificações de FSMS
8. Ser completamente configurável por fábrica (multi-tenant)

---

# 🔧 3. Requisitos Funcionais

## 3.1 Produção & Lotes

### RF-PL-01 — Criar Lote Pai

* Apenas Administrador/Gest. Qualidade
* Campos configuráveis
* Associações: linha, turno, OP, SKU

### RF-PL-02 — Criar Produto Intermédio

* Relacionar com lote pai
* Registar Brix, pH, Acidez, ingredientes, tanque
* Anexar relatórios da linha
* Validar via especificações dinâmicas

### RF-PL-03 — Criar Produto Final

* Relacionado ao produto intermédio
* Formulário dinâmico de análise
* Parâmetros carregados automaticamente pela Spec Engine
* Validação automática + flag de desvio

### RF-PL-04 — Rastreabilidade Completa

Visualizar:

* Lote pai → Intermédio → Produto final → Análises → NC → PCC

---

## 3.2 LIMS — Laboratório

### RF-LAB-01 — Criar Amostras (Samples)

* Tipos: matéria-prima, água, intermédio, final
* Fluxo: pending → in_analysis → review → approved

### RF-LAB-02 — Registar Análise

* Suporta parâmetros dinâmicos
* Suporte a anexos
* Carregamento de limites automaticamente
* Assinatura eletrónica

### RF-LAB-03 — Dashboard Operacional do Lab

* Total de análises / 24h
* Pendentes por prioridade
* RFT (Right First Time)
* Ranking de analistas
* Lotes a aguardar liberação

---

## 3.3 Food Safety — HACCP / FSSC

### RF-FS-01 — Registar PRP

### RF-FS-02 — Registar OPRP

### RF-FS-03 — Registar PCC

* Valores medidos
* Limites críticos
* Evidências
* Ações imediatas

### RF-FS-04 — Plano HACCP Digital

* Fluxo do processo
* Identificação de PCC/OPRP
* Avaliação de perigos
* Matriz de risco

---

## 3.4 QMS — Gestão da Qualidade

### RF-QMS-01 — Criar NC

* Ligação com análise
* Severidade crítica/major/minor
* Evidências anexas

### RF-QMS-02 — Criar Relatório 8D

* D1–D8 completos
* Assinatura eletrónica
* Fecho obrigatório pelo gestor

### RF-QMS-03 — Auditorias Internas

* Escopo
* Checklist
* Evidências
* Relatório automático

---

## 3.5 Matéria-Prima & Fornecedores

### RF-MP-01 — Criar Matéria-Prima

### RF-MP-02 — Criar Lote de Matéria-Prima

* Recolher COA
* Anexar documentos
* Avaliar qualidade
* Aprovar/Rejeitar/Quarentena

### RF-MP-03 — Gestão de Fornecedores

* Auditorias
* Score anual
* Histórico de NC

---

## 3.6 Equipamentos & Reagentes

### RF-EQ-01 — Criar Equipamento

* Calibração
* Alertas de vencimento

### RF-EQ-02 — Criar Reagente

* Controle de estoque avançado (SAP-like)
* Histórico de consumo

---

## 3.7 Configurações & Flexibilidade (Módulos Premium)

### RF-CFG-01 — Form Builder Dinâmico

### RF-CFG-02 — Parameter Builder

### RF-CFG-03 — Specification Engine

### RF-CFG-04 — Sampling Plan Engine

* Freq. por produto/linha/turno
* Exceções configuráveis

---

# 📊 4. Requisitos de IA

### IA-01 — Detectar tendência anormal

### IA-02 — Prever desvio antes de ocorrer

### IA-03 — Sugerir causa provável (RCA assistido)

### IA-04 — Gerar relatórios automáticos

### IA-05 — Auto-classificação de NC

---

# 📈 5. Requisitos de Dashboards

### DB-01 — Executive Overview

* % conformidade geral
* Lotes liberados/bloqueados
* Desvios críticos
* Custo de não-qualidade

### DB-02 — Parâmetros Críticos

* SPC: Xbar/R, IMR
* Tendências
* Histogramas
* Pareto
* Heatmap linha × turno

### DB-03 — Operações de QA/QC

* Pendências
* RFT
* Ranking de falhas

---

# 🔐 6. Requisitos de Segurança

* RBAC avançado
* Auditoria completa de ações
* Assinatura eletrónica
* Criptografia de dados sensíveis
* Logs imutáveis (aprovado por auditor)

---

# 🧩 7. Requisitos Técnicos

* Next.js 14 + React 18
* Supabase (PostgreSQL)
* Tailwind
* Multi-tenant
* Testes com Jest
* Deployment Vercel/Supabase

---

# 🧪 8. Critérios de Aceitação (Resumo)

O sistema será considerado funcional quando puder:

1. Criar fluxos completos de lotes pai → intermédios → final
2. Registar análises com parâmetros dinâmicos
3. Gerar SPC automaticamente
4. Criar NC e 8D completos
5. Gerir PRP/OPRP/PCC
6. Gerir matéria-prima e fornecedores
7. Gerir equipamentos e reagentes
8. Operar dashboards reais em tempo real
9. IA detectar tendências fora do normal
10. Auditor digital aprovado

---

# ✔ Documento concluído.

Se quiseres agora:
👉 **"Avança com o 05 – UI/UX Guidelines"**
ou
👉 **"Avança com o 05 – Tech Spec"**

Só dizer qual versão preferes para o próximo capítulo.

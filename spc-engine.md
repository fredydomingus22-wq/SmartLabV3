# SmartLab Enterprise — 05. SPC Engine (Statistical Process Control 4.0)

## 📌 1. Introdução

O **SPC Engine** é o núcleo estatístico do SmartLab Enterprise. Ele fornece controlo estatístico do processo em tempo real, combinando métricas clássicas (Shewhart, I-MR, Xbar/R) com inteligência artificial preditiva. É um dos módulos que colocam o SmartLab no mesmo patamar dos sistemas PepsiCo KORE, Coca-Cola InfinityQS Proficient e Minitab Real-Time SPC.

O engine deve operar continuamente sobre os dados de análise de produtos, água, processos, PCCs e matéria-prima, garantindo:

* Estabilidade do processo
* Detecção precoce de desvios
* Análise automática dos 6Ms (Man, Machine, Method, Material, Measurement, Mother Nature)
* Alertas em tempo real

---

# 🧠 2. Objetivos do SPC Engine

1. **Gerar controlo estatístico imediato** para cada parâmetro crítico.
2. **Detectar variação especial** utilizando regras de Nelson/Western Electric.
3. **Prever desvios futuros** usando modelos ML.
4. **Reduzir variabilidade** e aumentar o RFT (Right First Time).
5. **Classificar automaticamente anomalias** e sugerir causas prováveis.
6. **Alimentar dashboards avançados** de QA/QC e FSMS.

---

# 🧱 3. Arquitetura do SPC Engine

O engine é composto por 4 camadas principais:

## 3.1. Data Collector

Coleta de dados de:

* Lotes finalizados
* Produto intermédio (xarope)
* PCC/OPRP
* Água de processo
* Matéria-prima
* Resultados de laboratório

Suporta ingestão:

* Manual
* API
* Automática (futura, via SCADA/MQTT)

## 3.2. Statistical Core

Implementa:

### ✔ Gráficos de Controle

* **I–MR** (individual + moving range)
* **Xbar/R** (médias e amplitude)
* **Xbar/S** (alternativa para grandes amostras)
* **P-Chart** (atributos)
* **NP-Chart** (não conformes)
* **C/U-Chart** (contagens)

### ✔ Cálculo de limites

* LSL (Lower Spec Limit)
* Target
* USL (Upper Spec Limit)
* LCL/UCL (control limits)

### ✔ Regras de alarme (Western Electric / Nelson)

Exemplos:

* 1 ponto fora de UCL/LCL
* 2 de 3 pontos a 2σ
* 8 pontos do mesmo lado da média
* 6 pontos consecutivos subindo

### ✔ Análise avançada

* Variância intralote vs interlote
* Estabilidade por turno/linha
* Monitorização por SKU

---

# 🤖 4. AI Layer (Preditivo + Explicativo)

A IA opera paralelamente ao SPC clássico.

## 4.1. Previsão de Desvios

Modelos aplicados:

* Random Forest Regressors
* LSTM para séries temporais
* Gradient Boosting

Funções:

* Predizer tendência 30–90 minutos à frente
* Alertar risco antes do desvio real

## 4.2. Causas prováveis (Root Cause Assist)

A IA deve cruzar:

* Processo
* Linha
* Turno
* Operador
* Parâmetro
* Equipamento
* Históricos

E sugerir prováveis causas:

* “Variação de Brix correlacionada a temperatura do tanque”
* “CO₂ baixo recorrente quando a linha opera no turno C”

## 4.3. Sugestões automáticas

* Ajuste de processo
* Recomendações de manutenção preventiva
* Verificação de equipamento
* Checklist de operação

---

# 📊 5. Outputs do SPC Engine

## 5.1. Visualizações

O SPC Engine deve alimentar os seguintes gráficos:

* Controle I-MR
* Controle Xbar/R
* Tendência (time-series)
* Histogramas
* Pareto de desvios
* Heatmaps linha × turno × parâmetro
* Radar Chart de performance por SKU

## 5.2. Indicadores (KPIs)

* **Pp / Ppk** (capabilidade de processo)
* % Dentro da Especificação (CPK-like)
* RFT (Right First Time)
* MTBF de desvios por linha
* Tempo de liberação de lotes
* Variabilidade intralote
* Ranking de parâmetros mais instáveis

---

# 🧩 6. Integrações

O SPC feed deve integrar com:

### ✔ LIMS

Validação automática de análises.

### ✔ QMS (NC/8D)

Abertura automática de NC quando:

* parâmetro crítico falhar
* tendência previsível > 90% de chance
* desvio repetitivo é identificado

### ✔ FSMS (PCC)

Limites críticos ativam alarmes SPC.

### ✔ Dashboards

Via API interna.

---

# 🔐 7. Requisitos de Segurança e Auditoria

* Logs imutáveis de cada cálculo SPC
* Auditoria de parâmetros alterados
* Assinatura digital em revisões de limites
* Histórico de alterações por utilizador

---

# 🧪 8. Critérios de Aceitação

O SPC Engine será considerado funcional quando:

1. Conseguir gerar gráficos de controle automáticos.
2. Detectar variação comum vs especial.
3. Prever desvios com confiança mínima de 75%.
4. Lançar NC automaticamente quando aplicável.
5. Gerar Pareto, histogramas e heatmaps.
6. Integrar com os dashboards e módulos do SmartLab.
7. Registrar auditoria completa de eventos SPC.
8. Suportar 10.000+ pontos de dados/semana.

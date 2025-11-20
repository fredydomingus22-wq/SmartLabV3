# **SmartLab – UI/UX Guidelines (Design System Oficial)**

*Versão Enterprise – Sistema Visual & Padrões de Interface*

---

## **1. Visão Geral do Sistema Visual**

O design do SmartLab segue três princípios fundamentais:

1. **Clareza Operacional** – Tudo deve ser fácil de ler, navegar e executar rapidamente.
2. **Precisão Industrial** – Visual limpo, escuro, técnico e sem distrações.
3. **Estética Enterprise** – Nível PepsiCo / Coca-Cola / InfinityQS.

O sistema adota um **tema dark industrial** com acentos em **verde-emerald** para estados positivos e **amber/vermelho** para alertas.

---

## **2. Design Tokens**

### **2.1. Cores (Paleta Oficial)**

* **Base (Dark Industrial)**

  * Slate 950 – `#020617`
  * Slate 900 – `#0f172a`
  * Slate 800 – `#1e293b`
  * Slate 700 – `#334155`
  * Slate 400 – `#94a3b8`
  * Slate 100 – `#f1f5f9`

* **Acentos Funcionais**

  * Emerald 500 (OK) – `#10b981`
  * Amber 500 (Warning) – `#f59e0b`
  * Red 500 (Critical) – `#ef4444`
  * Sky 400 (Info) – `#38bdf8`

* **Status**

  * Success: Emerald 500
  * Failure/OOS: Red 500
  * OPRP/PCC: Amber 600
  * Auditoria/Documentos: Sky 600

### **2.2. Tipografia**

* **Primária:** Inter (robusta, técnica, moderna)
* **Escalas:**

  * Display (24–32)
  * Headings (18–22)
  * Corpo (14–16)
  * Labels (12)

### **2.3. Espaçamento**

* Base: 4px
* Multiplicadores: 4 / 8 / 12 / 16 / 24 / 32

### **2.4. Bordas**

* Raio padrão: `8px`
* Botões e inputs: arredondamento médio para estética enterprise.

---

## **3. Componentes UI Oficiais**

Todos os componentes devem ser criados em `components/ui/`.

### **3.1. Botões**

Variants permitidos:

* primary
* secondary
* ghost
* destructive
* icon
* outline

Tamanhos:

* sm / md / lg / icon

Regras:

* Nunca criar novos variants
* Nunca usar cores fora da paleta

### **3.2. Cards**

* Fundo: Slate 900/800
* Borda: Slate 700
* Sombra suave
* Padding: 16–24px
* Título: 16px semibold

### **3.3. Tabelas**

* Header: Slate 800
* Linhas alternadas: Slate 900 / Slate 800
* Linhas destacadas para status críticos

### **3.4. Forms**

Inputs devem ter:

* Altura md
* Fundo Slate 900
* Borda Slate 700
* Focus: outline emerald
* Validação inline

Labels:

* Sempre acima do input
* 12px, slate-400

### **3.5. Navegação (Sidebar)**

* Estilo industrial premium
* Grupos colapsáveis
* Ícones de alto contraste
* Item ativo com left-border em emerald

---

## **4. Layouts e Estrutura de Páginas**

### **4.1. AppShell**

Cada página deve usar:

* sidebar fixa
* header superior minimalista
* corpo com gutter de 32px

### **4.2. Dashboard Patterns**

Dashboard padrão contém:

* Cards de KPIs no topo
* Gráficos (SPC/Tendência) no meio
* Tabelas/Heatmaps no fim

### **4.3. Páginas de Listagem**

Ex.: Lotes, Produtos, Matérias-primas.

Estrutura:

1. Header + botão "Criar"
2. Filtros avançados
3. Tabela responsiva
4. Anotação de status (chips coloridos)

### **4.4. Páginas de Formulários**

Regras:

* 2 colunas quando possível
* Agrupar por seções (accordion)
* Botões sempre fixos no final da página

---

## **5. Padrões de Interação**

### **5.1 Feedback imediato**

* Sucesso → Toast emerald
* Erro → Toast red com detalhe
* Loading → skeleton + spinner discreto

### **5.2. Microinterações**

* Hover suave
* Foco com destaque verde
* Transições 150ms

### **5.3. Mobile-first**

* Sidebar vira Sheet Mobile
* Gráficos responsivos
* Tabelas viram listas

---

## **6. UI para Análises e SPC**

### **6.1. Tendência (Line Charts)**

* Linha do valor → Sky
* Limite inferior (LSL) → Vermelho tracejado
* Limite superior (USL) → Vermelho tracejado
* Target → Verde

### **6.2. Controle Estatístico**

* Xbar & R
* IMR
* Pareto
* Histogramas
* Heatmaps por linha / turno / parâmetro

---

## **7. UI para Segurança Alimentar**

Para PCC, PRP, OPRP:

* Chips amarelos para risco
* Layout de ficha técnica com:

  * perigos
  * medidas de controle
  * monitorização
  * ações corretivas

---

## **8. UI para Gestão da Qualidade**

Modos específicos:

* NC: vermelho/amber
* 8D: fichas passo a passo
* Auditorias: azul sky
* Documentação: tabelas com versão e assinatura

---

## **9. UI para Configuração Dinâmica**

### **Parâmetros dinâmicos**

* Campos arrastáveis (drag & drop)
* Categorias com cores

### **Form Builder**

* Campos configuráveis
* Pré-visualização ao vivo

---

## **10. Diretrizes de Acessibilidade**

* Contraste mínimo 4.5:1
* Tamanhos mínimos 14px
* Foco visível
* Navegação por teclado


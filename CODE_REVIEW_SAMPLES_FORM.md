# CODE REVIEW: Sample Registration Form
## `app/lab/samples/register/page.tsx`

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. **UX/UI - Ordem dos Campos Confusa**
**Problema**: A ordem dos campos não faz sentido lógico:
- Usuário seleciona "Lote de Produção" ANTES de escolher a "Fase"
- Mas o dropdown de lotes é filtrado pela fase
- Isso significa: **o dropdown estará vazio até mudar a fase**

**Solução**: Reordenar campos:
1. Tipo de Amostra (primeiro)
2. Fase do Produto (pode ser opcional dependendo do tipo)
3. Lote de Produção (filtrado após fase)
4. Tanque

### 2. **Lógica de Filtro Quebrada**
**Problema**: Linha 364
```tsx
.filter(lot => phase === 'intermediate' ? lot.type === 'intermediate' : lot.type === 'production')
```
- Phase padrão é 'finished' (linha 75)
- Então filtra `lot.type === 'production'`
- Mas se usuário não trocou a fase, não vê intermediate lots mesmo que existam

**Solução**: Lógica inteligente baseada no sample_type

### 3. **Campos Redundantes/Conflitantes**
**Problema**: Temos 2 campos que fazem a mesma coisa:
- "Fase do Produto" (intermediate/finished)
- "Tipo de Amostra" (finished_product/intermediate_product/swabs/etc)

Isso confunde o usuário! Se ele escolhe "Swab Ambiental", qual fase deve escolher?

**Solução**: 
- Para swabs ambientais, água, ar, etc: NÃO precisa de lote/fase/tanque
- Para produtos: precisa de lote e fase
- Mostrar/ocultar campos dinamicamente

### 4. **Validação Inadequada**
**Problema**: Linha 250
```tsx
if (!selectedLotId || !selectedTankId || !phase)
```
- Não valida `sampleType`
- Para swabs não deveria exigir lote/tanque
- Para produtos deveria exigir

**Solução**: Validação condicional baseada no tipo de amostra

### 5. **Foreign Keys Incorretas no Insert**
**Problema**: Linha 277
```tsx
[phase === 'intermediate' ? 'intermediate_lot_id' : 'finished_lot_id']: selectedLotId
```

**ERRO GRAVE**: 
- Se `phase === 'intermediate'`, o `selectedLotId` vem de um lote INTERMEDIÁRIO
- Mas `intermediate_lot_id` deve referenciar `intermediate_lots.id`
- Se `phase === 'finished'`, o `selectedLotId` vem de um lote de PRODUÇÃO
- Mas `finished_lot_id` referencia... qual tabela? 

**Não existe `finished_lots` table!** (foi deprecada)

**Solução**: 
- Usar apenas `production_lot_id` para produtos acabados
- Usar `intermediate_lot_id` para produtos intermédios
- Não usar lote para swabs ambientais

---

## ⚠️ PROBLEMAS MÉDIOS

### 6. **Performance - Muitas Re-renders**
**Problema**: 
- `useEffect` em linha 115 roda toda vez que `selectedLot` ou `phase` mudam
- Causa toast a cada mudança
- Isso irrita o usuário

**Solução**: 
- Debounce ou só carregar specs quando realmente necessário
- Remover toast de sucesso (só mostrar erro)

### 7. **Falta de Feedback Visual**
**Problema**:
- Quando não há lotes disponíveis, dropdown está vazio sem explicação
- Quando não há tanks, dropdown está vazio sem explicação

**Solução**: 
- Mostrar mensagem "Nenhum lote disponível" no dropdown vazio
- Adicionar link para criar novo lote

### 8. **Falta Import do getActiveProductionLots**
**Problema**: Linha 35 importa `getActiveProductionLots` mas linha 142 chama diretamente
- Isso está correto, mas o fetching intermediário está inline (linhas 143-154)
- Inconsistente

**Solução**: Criar função `getActiveIntermediateLots()` em `lib/queries/production.ts`

---

## 📊 PROBLEMAS DE INTEGRAÇÃO COM BD

### 9. **Tabelas Relacionadas - Schema Incompleto**
**Relações da tabela `samples`:**
```sql
samples
├── product_id → products.id
├── tank_id → tanks.id
├── intermediate_lot_id → intermediate_lots.id
├── production_lot_id → production_lots.id (missing?)
└── finished_lot_id → ??? (não existe)
```

**Problema**: Não sabemos a estrutura real da tabela samples

**Necessário**: 
- Ver schema da tabela samples
- Confirmar foreign keys
- Confirmar quais campos são nullable

### 10. **RPC Function - generate_sample_code**
**Problema**: Não sabemos o que esta função faz (linha 259-264)
- Parece gerar código baseado em product_id, tank_id, lot_code
- Mas e para swabs que não têm produto/lote/tank?

**Solução**: 
- Criar lógica alternativa para gerar códigos de swabs
- Ou tornar a RPC mais flexível

---

## 🎨 PROBLEMAS DE UX/UI

### 11. **Layout Responsivo**
- Form está em `lg:col-span-2` e sidebar em col-span-1
- Em mobile, sidebar aparece embaixo
- Specifications card é irrelevante em mobile

**Solução**: Esconder sidebar em mobile ou collapsar

### 12. **Acessibilidade**
- Faltam `aria-labels` nos selects
- Faltam `required` attributes nos campos obrigatórios
- Falta indicador visual de campo obrigatório além do `*`

### 13. **Loading States**
- Quando `submitting`, deveria desabilitar TODO o form, não só o botão
- Falta skeleton loader para a lista de lotes/tanks

---

## 🔧 RECOMENDAÇÕES DE REFATORAÇÃO

### PRIORIDADE ALTA:
1. ✅ Separar lógica de swabs vs produtos
2. ✅ Corrigir foreign keys (production_lot_id vs finished_lot_id)
3. ✅ Reordenar campos logicamente
4. ✅ Validação condicional baseada em sample_type

### PRIORIDADE MÉDIA:
5. ✅ Criar `getActiveIntermediateLots()` em queries
6. ✅ Adicionar mensagens em dropdowns vazios
7. ✅ Remover toasts excessivos
8. ✅ Melhorar loading states

### PRIORIDADE BAIXA:
9. Melhorar acessibilidade
10. Otimizar layout mobile
11. Adicionar testes

---

## 📝 SCHEMA NECESSÁRIO

Precisamos confirmar:
```sql
-- Estrutura real da tabela samples
\d samples

-- Foreign keys
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'samples';
```

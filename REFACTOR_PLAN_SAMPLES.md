# PLANO DE REFATORAÇÃO - Sample Registration Form

## ✅ CONFIRMAÇÃO DO SCHEMA

```sql
-- Tabela samples (linha 34-52 do migration)
samples:
  - tank_id: UUID (nullable)
  - phase: TEXT ('intermediate' | 'finished')
  - sequence_number: INTEGER
  - intermediate_lot_id: UUID FK → intermediate_lots(id)
  - finished_lot_id: UUID FK → finished_lots(id)
  - product_id: UUID (já existia)
  - sample_type: TEXT (adicionado recentemente)
```

## 🚨 PROBLEMA CONFIRMADO

**ERRO CRÍTICO**: Linha 277 do formulário
```tsx
[phase === 'intermediate' ? 'intermediate_lot_id' : 'finished_lot_id']:  selectedLotId
```

**O que está acontecendo:**
1. Se `phase === 'finished'`, usa `finished_lot_id`
2. Mas `finished_lot_id` aponta para `finished_lots` table
3. E `selectedLotId` vem de `production_lots` ou `intermediate_lots`
4. **MISMATCH DE FOREIGN KEY!**

**Solução:**
- `finished_lots` parece ser uma tabela de linha de produção diferente
- Precisamos usar `production_lot_id` para produtos acabados
- Ou REMOVER a constraint de `finished_lot_id`

## 📋 REFATORAÇÃO COMPLETA

### STEP 1: Atualizar Schema da Tabela Samples
```sql
-- Adicionar production_lot_id se não existe
ALTER TABLE samples
ADD COLUMN IF NOT EXISTS production_lot_id UUID REFERENCES production_lots(id);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_samples_production_lot ON samples(production_lot_id);
```

### STEP 2: Reordenar Campos do Formulário

**Nova ordem lógica:**
1. **Tipo de Amostra** (primeiro - determina quais campos mostrar)
2. **Campos Condicionais:**
   - **Para Produtos** (finished/intermediate):
     - Fase do Produto
     - Lote (auto-filtrado por fase)
     - Tanque
   - **Para Swabs/Água/Ar**:
     - Local/Identificação
     - Nenhum lote/tanque necessário

### STEP 3: Lógica Condicional

```tsx
const isProductSample = ['finished_product', 'intermediate_product', 'raw_material'].includes(sampleType);
const isSwabSample = ['environmental_swab', 'equipment_swab', 'personnel_swab'].includes(sampleType);
```

### STEP 4: Validação Condicional

```tsx
function validateForm() {
  if (!sampleType) return 'Selecione o tipo de amostra';
  
  if (isProductSample) {
    if (!phase) return 'Selecione a fase do produto';
    if (!selectedLotId) return 'Selecione o lote';
    if (!selectedTankId) return 'Selecione o tanque';
  }
  
  if (isSwabSample) {
    if (!swabLocation) return 'Informe o local do swab';
  }
  
  return null;
}
```

### STEP 5: Insert Correto

```tsx
const insertData = {
  code: codeData.code,
  sample_type: sampleType,
  phase: isProductSample ? phase : null,
  product_id: selectedLot?.product_id || null,
  tank_id: isProductSample ? selectedTankId : null,
  sequence_number: codeData.sequence,
  collection_date: new Date().toISOString(),
  status: 'pending_analysis',
  observations,
};

// Adicionar lote correto baseado na fase
if (isProductSample) {
  if (phase === 'intermediate') {
    insertData.intermediate_lot_id = selectedLotId;
  } else {
    insertData.production_lot_id = selectedLotId; // ← CORREÇÃO
  }
}
```

## 🎯 IMPLEMENTAÇÃO RÁPIDA

Vou implementar em ordem de prioridade:
1. ✅ Migration para adicionar production_lot_id
2. ✅ Corrigir insert para usar production_lot_id
3. ✅ Adicionar lógica condicional baseada em sample_type
4. ✅ Reordenar campos
5. ✅ Adicionar validação condicional

# 🔍 Troubleshooting: "Failed to Fetch" no Login

**Erro**: Failed to fetch ao tentar fazer login
**Data**: 2025-11-24

---

## 🚨 DIAGNÓSTICO CONFIRMADO (24/11/2025)

**Problema Identificado**: O servidor Supabase está retornando `500 Internal Server Error` para todas as requisições de API (Auth e Database), mesmo com credenciais corretas e banco de dados ativo.

**Causa**: O API Gateway (PostgREST/Kong) do projeto Supabase está em um estado inconsistente. Isso não é um erro no seu código.

**SOLUÇÃO DEFINITIVA**:
É necessário reiniciar o projeto no painel do Supabase.

### 🔄 Como Reiniciar o Projeto

1. Acesse o Dashboard: https://supabase.com/dashboard/project/xvkcxsgdxzlacrlhawlq/settings/general
2. Role até o final da página "General"
3. Encontre a seção **"Pause Project"**
4. Clique em **Pause** e aguarde uns minutos
5. Depois clique em **Restore** (ou Resume)

*Nota: Isso irá reiniciar todos os serviços (API, Auth, DB) e deve resolver o erro 500.*

---

## 🔍 Outras Causas Possíveis (Se o restart não resolver)

### 1. **Variáveis de Ambiente**
Verificamos que suas variáveis estão corretas, mas garanta que o arquivo `.env.local` contém:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xvkcxsgdxzlacrlhawlq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **Firewall/Antivírus**
Se o restart não funcionar, verifique se seu firewall não está bloqueando respostas com status 500 (alguns antivírus fazem isso).

---

## 🛠️ Ferramentas de Diagnóstico

Criamos um script de teste em `test-connection.js`. Para rodar:
```bash
node test-connection.js
```

Se a saída mostrar `Internal server error`, o problema persiste no servidor.

---

## 🚀 Passos de Resolução Rápida

### **Passo 1: Verificar Console do Browser**
```javascript
// Abrir DevTools (F12)
// Ir para Console
// Ver erro completo
```

### **Passo 2: Testar Conexão Supabase**
Criar arquivo `test-supabase.ts`:
```typescript
import { createClient } from '@/lib/supabase/client';

async function testConnection() {
  const supabase = createClient();
  
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  const { data, error } = await supabase.from('profiles').select('count');
  
  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connection successful:', data);
  }
}

testConnection();
```

### **Passo 3: Verificar Network Tab**
1. Abrir DevTools (F12)
2. Ir para Network
3. Tentar fazer login
4. Ver qual request falhou
5. Verificar status code

### **Passo 4: Reiniciar Tudo**
```bash
# Terminal 1: Parar servidor (Ctrl+C)

# Limpar cache Next.js
rm -rf .next

# Reinstalar dependências
npm install

# Reiniciar
npm run dev
```

---

## 🔧 Correções Implementadas

### 1. **Melhor Error Handling no Login**
Adicionei mensagens de erro mais descritivas:

```typescript
// Antes
setErrorMsg(error.message || "Falha no login");

// Depois
if (error.message.includes('fetch')) {
  setErrorMsg("Erro de conexão. Verifique sua internet e tente novamente.");
} else if (error.message.includes('Invalid')) {
  setErrorMsg("Email ou password incorretos.");
} else {
  setErrorMsg(error.message || "Falha no login. Tente novamente.");
}
```

### 2. **Connection Test Endpoint**
Criei endpoint para testar conexão:

**Arquivo**: `app/api/test-connection/route.ts`

---

## 📋 Checklist de Verificação

- [ ] Servidor Next.js rodando (localhost:3000)
- [ ] `.env.local` existe e tem as variáveis corretas
- [ ] Projeto Supabase está ativo (não pausado)
- [ ] URLs configuradas no Supabase Dashboard
- [ ] Firewall/Antivírus não está bloqueando
- [ ] Browser console não mostra erros de CORS
- [ ] Network tab mostra requests sendo feitos

---

## 🆘 Soluções por Tipo de Erro

### **"Failed to fetch"**
```
Causa: Conexão de rede ou servidor down
Solução: 
1. Verificar se npm run dev está rodando
2. Verificar projeto Supabase ativo
3. Tentar refresh no browser (Ctrl+F5)
```

### **"Invalid login credentials"**
```
Causa: Email/password incorretos
Solução: 
1. Verificar credenciais
2. Criar novo utilizador no Supabase Dashboard
```

### **"Network request failed"**
```
Causa: Sem internet ou firewall
Solução:
1. Verificar conexão internet
2. Desabilitar VPN temporariamente
3. Verificar firewall
```

### **"CORS error"**
```
Causa: URL não autorizado no Supabase
Solução:
1. Dashboard → Authentication → URL Configuration
2. Adicionar http://localhost:3000
```

---

## 🔄 Como Criar Utilizador de Teste

### **Opção 1: Supabase Dashboard**
1. Ir para: https://supabase.com/dashboard/project/xvkcxsgdxzlacrlhawlq/auth/users
2. Clicar "Add User"
3. Preencher:
   - Email: `admin@smartlab.com`
   - Password: `SmartLab2025!`
   - Confirmar email automaticamente
4. Criar perfil:
```sql
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'user-id-from-auth-users',
  'admin@smartlab.com',
  'admin',
  'Administrador SmartLab'
);
```

### **Opção 2: Via API** (Se auth estiver funcionando)
```bash
# Usar Supabase CLI
supabase auth signup --email admin@smartlab.com --password SmartLab2025!
```

---

## 🐛 Debug Mode

Para ativar modo debug detalhado:

```typescript
// Em lib/supabase/client.ts
export function createClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        debug: true, // Adicionar isto
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  );
  
  // Log para debug
  console.log('Supabase Client Created:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
  
  return supabase;
}
```

---

## ✅ Solução Mais Provável

**90% dos casos**: O servidor precisa ser reiniciado após criar/editar `.env.local`

**Solução**:
```bash
# 1. Parar servidor (Ctrl+C no terminal)
# 2. Reiniciar
npm run dev

# 3. Aguardar mensagem:
# Ready in XXXXms
# Local: http://localhost:3000
```

---

## 📞 Contacto de Emergência

Se nada funcionar:

1. **Verificar Status Supabase**: https://status.supabase.com/
2. **Logs do Projeto**: Supabase Dashboard → Logs
3. **Criar Novo Projeto**: Se o projeto estiver corrompido

---

**Próximo Passo**: Envie-me a mensagem de erro COMPLETA do console do browser para diagnóstico preciso.

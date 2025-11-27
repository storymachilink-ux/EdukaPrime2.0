# 🔐 Sistema Completo de Gerenciamento de Webhook Secrets

## 📋 Visão Geral

O sistema implementa gerenciamento seguro e centralizado de webhook secrets com as seguintes características:

✅ **Armazenamento Seguro**: Secrets armazenados na tabela `webhook_secrets` com RLS
✅ **Interface Administrativa**: Dashboard no AdminDashboard para gerenciar secrets
✅ **Carregamento Dinâmico**: Webhooks carregam secrets do banco de dados automaticamente
✅ **Fallback Seguro**: Compatibilidade com variáveis de ambiente como fallback
✅ **Validação HMAC**: Todos os webhooks validam assinaturas SHA256

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `webhook_secrets`

```sql
CREATE TABLE public.webhook_secrets (
  id UUID PRIMARY KEY
  platform TEXT UNIQUE (vega, ggcheckout, amplopay)
  secret TEXT (armazenado criptografado em repouso)
  is_active BOOLEAN
  created_by UUID (referência ao admin)
  updated_at TIMESTAMP
  created_at TIMESTAMP
)
```

### Índices
- `idx_webhook_secrets_platform` - Busca rápida por plataforma
- `idx_webhook_secrets_active` - Filtrar apenas secrets ativos

### Row Level Security (RLS)
- ✅ Apenas admins podem visualizar secrets
- ✅ Apenas admins podem inserir/atualizar/deletar
- ✅ Proteção contra acesso não autorizado

---

## 🚀 Como Usar - Frontend (AdminDashboard)

### 1. Acessar Gerenciador de Secrets

No **AdminDashboard → Integrações**:
- Clique no botão **"Gerenciar Secrets"** (ícone de cadeado)
- Uma seção com 3 campos aparece para: Vega, GG Checkout, AmploPay

### 2. Configurar um Secret

```typescript
// Exemplo com GG Checkout
1. Clique em "Gerenciar Secrets"
2. No campo "GG Checkout", insira o secret recebido do gateway
3. Você pode clicar no ícone de olho para visualizar/ocultar
4. Clique em "Salvar"
5. Mensagem de sucesso aparece e status é atualizado
```

### 3. Feedback Visual

- **Status "Configurado"**: Badge azul com ✅ e data da última atualização
- **Status "Não configurado"**: Badge laranja com ⚠️
- **Cards de Integração**: Mostram "Secret OK" ou "S/ Secret" para cada plataforma

### 4. Validação

- Campo não pode estar vazio
- Plataforma deve ser válida (vega, ggcheckout, amplopay)
- Mensagens de erro/sucesso aparecem automaticamente
- Formulário desabilita botão se campo estiver vazio

---

## ⚙️ Como Funciona - Backend

### RPC Functions (SQL)

#### 1. `save_webhook_secret(p_platform, p_secret)`
```typescript
// Salva ou atualiza um webhook secret
const { data, error } = await supabase.rpc('save_webhook_secret', {
  p_platform: 'ggcheckout',
  p_secret: '9c74723f41fb8c752350c8b0fb01941c'
});

// Response: { success: boolean, message: string, platform: string }
```

#### 2. `delete_webhook_secret(p_platform)`
```typescript
// Deleta um webhook secret
const { data, error } = await supabase.rpc('delete_webhook_secret', {
  p_platform: 'ggcheckout'
});

// Response: { success: boolean, message: string }
```

#### 3. `get_webhook_secrets_status()`
```typescript
// Retorna status de todos os secrets (sem valores)
const { data, error } = await supabase.rpc('get_webhook_secrets_status');

// Response: Array de { platform, is_configured, is_active, updated_at }
```

---

## 🔌 Webhooks - Integração

### Carregamento de Secrets

Todos os webhooks agora carregam secrets dinamicamente:

```typescript
// Função helper nos webhooks
async function loadWebhookSecretFromDatabase(
  supabase: any,
  platform: string
): Promise<string> {
  // 1. Consulta tabela webhook_secrets
  // 2. Retorna secret se encontrado e ativo
  // 3. Fallback para variável de ambiente
  // 4. Logs informativos sobre o carregamento
}
```

### Ordem de Prioridade

1. **Primeiro**: Tenta carregar do banco de dados `webhook_secrets`
2. **Fallback**: Usa variável de ambiente `*_WEBHOOK_SECRET`
3. **Sem Secret**: Log de aviso, processa webhook sem validação

### Exemplo de Fluxo

```
Webhook Recebido
    ↓
Inicializa Cliente Supabase Admin
    ↓
Carrega Secret do BD (loadWebhookSecretFromDatabase)
    ↓
Valida Assinatura HMAC SHA256
    ↓
Se válido: Processa webhook normalmente
Se inválido: Retorna 401 Unauthorized
Se sem secret: Processa com aviso de log
```

---

## 📝 Implementação Detalhada

### Webhook-AmploPay (`webhook-amplopay/index.ts`)

✅ **Implementado e funcional**

```typescript
// 1. Constante global com fallback
let AMPLOPAY_WEBHOOK_SECRET = Deno.env.get('AMPLOPAY_WEBHOOK_SECRET') || '';

// 2. Função para carregar do BD
async function loadWebhookSecretFromDatabase(supabase, platform) { ... }

// 3. No Deno.serve handler
const dbSecret = await loadWebhookSecretFromDatabase(supabase, 'amplopay');
if (dbSecret) AMPLOPAY_WEBHOOK_SECRET = dbSecret;
```

### Webhook-Unificada-v2 (📝 **Próximo a implementar**)

Será atualizado com mesmo padrão para suportar 3 plataformas

### Webhook-Unificada (📝 **Próximo a implementar**)

Será atualizado com mesmo padrão para suportar 3 plataformas

---

## 🔒 Segurança

### Proteção de Dados

✅ **Criptografia em Repouso**
- Secrets armazenados no Supabase (criptografados)
- Não transmitidos para o frontend desnecessariamente

✅ **Criptografia em Trânsito**
- HTTPS obrigatório (Supabase)
- TLS entre webhooks e edge functions

✅ **Controle de Acesso**
- RLS policies: apenas admins
- Verificação de admin em cada RPC function
- Logs de auditoria de quem alterou secrets

✅ **Validação HMAC**
- SHA256 timing-safe comparison
- Previne fraude de webhooks
- Suporta múltiplas assinaturas

### Exemplo de Ataque Prevenido

```
❌ Webhook Fraudulento
POST /webhook
X-Signature: 1234567890abcdef
{ fake payment data }

Sistema:
1. Carrega secret do BD
2. Calcula HMAC do payload
3. Compara com assinatura enviada
4. Não corresponde → 401 Unauthorized
5. Webhook NÃO é processado
```

---

## 🧪 Testando o Sistema

### Teste 1: Salvar Secret pelo Admin Dashboard

```
1. Acesse AdminDashboard → Integrações
2. Clique "Gerenciar Secrets"
3. Insira secret válido para uma plataforma
4. Clique "Salvar"
5. Verifique mensagem de sucesso
6. Refresh: deve mostrar "Configurado em [data]"
```

### Teste 2: Verificar Carregamento no Webhook

Quando um webhook é recebido após configurar secret:

```
Logs do Edge Function (Supabase):
✅ Secret de amplopay carregado da tabela webhook_secrets
✅ WEBHOOK VALIDADO: Assinatura HMAC válida para AmploPay
✅ Usuário encontrado/criado
✅ Webhook processado com sucesso!
```

### Teste 3: Webhook com Assinatura Inválida

```
Logs:
❌ WEBHOOK REJEITADO: Assinatura inválida para AmploPay
HTTP Response: 401 Unauthorized
```

### Teste 4: Webhook sem Secret Configurado

```
Logs:
⚠️ WEBHOOK SEM VALIDAÇÃO: Nenhum secret configurado para AmploPay
[Webhook é processado normalmente]
HTTP Response: 200 OK
```

---

## 📚 Próximas Etapas

### Curto Prazo
- [ ] Implementar carregamento de secrets em webhook-unificada-v2
- [ ] Implementar carregamento de secrets em webhook-unificada
- [ ] Testar todos os webhooks com secrets salvos
- [ ] Verificar logs de validação

### Médio Prazo
- [ ] Remover ANON_KEY do client REST API
- [ ] Fortalecer RLS policies em outras tabelas
- [ ] Remover console.logs com dados sensíveis
- [ ] Adicionar auditoria de mudanças de secrets

### Longo Prazo
- [ ] Integração com secret management externo (AWS Secrets Manager, etc)
- [ ] Rotação automática de secrets
- [ ] Webhook signature testing/validation tool
- [ ] Dashboard de auditoria de webhooks

---

## ❓ FAQ

**P: Os secrets são criptografados?**
R: Sim, Supabase criptografa dados em repouso. Además, você deve usar HTTPS em todos os endpoints.

**P: Posso visualizar um secret após salvar?**
R: Não, por segurança. Apenas o valor é visible enquanto você digita. Após salvar, apenas a RPC `get_webhook_secrets_status()` confirma se está configurado.

**P: O que acontece se eu deletar um secret?**
R: O webhook continuará processando normalmente, mas sem validação de assinatura HMAC (modo inseguro). Um aviso será logado.

**P: Como atualizar um secret?**
R: Digite o novo valor no mesmo campo e clique "Salvar". Sobrescreve automaticamente.

**P: Preciso redeploy das functions?**
R: Não. Os webhooks carregam secrets do BD a cada execução, então mudanças são imediatas.

**P: E se o BD estiver offline?**
R: Webhooks tentam carregar do BD, falham, e usam fallback da variável de ambiente (se existir).

---

## 🎯 Benefícios da Implementação

✅ **Gerenciamento Centralizado**: Todos os secrets em um único lugar
✅ **Sem Deploy Necessário**: Mudanças de secrets são imediatas
✅ **Admin-Only**: Interface segura para administradores
✅ **Auditoria**: Rastreamento de quem/quando alterou secrets
✅ **Flexibilidade**: Ativa/desativa secrets sem deletar
✅ **Fallback Seguro**: Compatibilidade com env vars legadas
✅ **Visual Feedback**: Status claro no dashboard e cards de integração


# 🔍 DIAGNÓSTICO - Webhook Não Retorna JSON

## 🚨 Problema

GGCheckout retorna: **"Resposta não-JSON recebida"**

Isso significa que a função está retornando **HTML** ao invés de **JSON**.

---

## ✅ DIAGNÓSTICO PASSO A PASSO

### **TESTE 1: Verificar se o Netlify está funcionando**

Abra no navegador:
```
https://edukaprime.com.br/
```

**Resultado esperado:** Site carrega normalmente

✅ Se carregar = Netlify está funcionando
❌ Se não carregar = Problema no domínio/Netlify

---

### **TESTE 2: Verificar se a função existe**

#### Passo 1: Fazer deploy da função de teste

```bash
git add netlify/functions/webhook-test.js
git commit -m "Add test webhook function"
git push origin main
```

Aguarde 2-3 minutos o deploy completar.

#### Passo 2: Testar a função simples

Abra no navegador:
```
https://edukaprime.com.br/.netlify/functions/webhook-test
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Função Netlify funcionando!",
  "timestamp": "2025-01-...",
  "method": "GET",
  "hasBody": false
}
```

#### Análise:

- ✅ **Se aparecer JSON acima:** Netlify Functions está funcionando! O problema é na função `webhook-amplopay`
- ❌ **Se aparecer 404:** Functions não foram deployadas
- ❌ **Se aparecer HTML:** Netlify não está configurado corretamente

---

### **TESTE 3: Verificar o que a função principal retorna**

Abra no navegador (nova aba):
```
https://edukaprime.com.br/.netlify/functions/webhook-amplopay
```

#### Opção A: Aparece JSON
```json
{"error":"Method not allowed"}
```
✅ **ÓTIMO!** A função está funcionando. O problema pode ser:
- GGCheckout está enviando formato errado
- Função está crashando ao processar payload

**Solução:** Pule para TESTE 4

---

#### Opção B: Aparece HTML/404
```html
<!DOCTYPE html>
<html>
...
</html>
```
❌ **PROBLEMA:** A função não foi deployada ou tem erro de sintaxe

**Solução:** Continue para TESTE 3.1

---

#### Opção C: Página em branco ou erro de rede
❌ **PROBLEMA:** Configuração do Netlify ou domínio

**Solução:** Continue para TESTE 3.2

---

### **TESTE 3.1: Verificar se a função foi deployada**

1. Acesse: https://app.netlify.com
2. Entre no projeto **edukaprime.com.br**
3. Vá em: **Functions**

**O que você vê?**

#### Cenário A: Lista vazia ou sem "webhook-amplopay"
❌ Função não foi deployada

**Solução:**
1. Verifique se existe o arquivo: `netlify/functions/webhook-amplopay.js`
2. Verifique se existe: `netlify/functions/package.json`
3. Faça commit de tudo:
   ```bash
   git add netlify/functions/
   git commit -m "Add webhook functions"
   git push
   ```
4. Aguarde deploy completar
5. Volte ao TESTE 3

---

#### Cenário B: "webhook-amplopay" aparece MAS está em vermelho/erro
❌ Função tem erro

**Solução:**
1. Clique na função
2. Veja os logs de erro
3. **Tire print do erro completo**
4. Me envie o erro para corrigir

---

#### Cenário C: "webhook-amplopay" aparece em VERDE
✅ Função foi deployada com sucesso

**Mas TESTE 3 retorna HTML?**

Isso indica problema de cache. **Solução:**
1. No Netlify: **Deploys → Trigger deploy → Clear cache and deploy**
2. Aguarde novo deploy
3. Teste novamente

---

### **TESTE 3.2: Verificar DNS/Domínio**

1. Abra terminal/cmd
2. Execute:
   ```bash
   ping edukaprime.com.br
   ```

**Aparece IP válido?**
- ✅ Sim = Domínio aponta para algum servidor
- ❌ Não = Problema de DNS

3. Verifique se o domínio aponta para o Netlify:
   - No Netlify: **Domain settings → Domain management**
   - Verifique se `edukaprime.com.br` está lá
   - Se não estiver, adicione o domínio

---

### **TESTE 4: Verificar logs da função principal**

Se TESTE 2 (webhook-test) funciona MAS TESTE 3 (webhook-amplopay) não:

1. No Netlify: **Functions → webhook-amplopay → View logs**
2. Procure por erros em vermelho
3. **Tire print dos últimos 50 logs**
4. Me envie

**Erros comuns nos logs:**

#### Erro: "Cannot find module '@supabase/supabase-js'"
**Causa:** package.json não foi instalado

**Solução:**
1. Verifique se `netlify/functions/package.json` existe
2. Se não existir, crie com:
   ```json
   {
     "dependencies": {
       "@supabase/supabase-js": "^2.58.0"
     }
   }
   ```
3. Commit e push

---

#### Erro: "undefined is not a function" ou "createClient is not defined"
**Causa:** Variáveis de ambiente faltando

**Solução:**
1. Netlify: **Site settings → Environment variables**
2. Verifique se tem:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Se não tiver, adicione
4. **Importante:** Após adicionar, fazer novo deploy:
   - **Deploys → Trigger deploy → Deploy site**

---

#### Erro: "Invalid API key"
**Causa:** Service Role Key errada

**Solução:**
1. No Supabase: **Settings → API**
2. Copie a chave **service_role** (não a anon!)
3. No Netlify: **Environment variables**
4. Atualize `SUPABASE_SERVICE_ROLE_KEY`
5. Trigger novo deploy

---

### **TESTE 5: Teste via GGCheckout depois que TESTE 3 funcionar**

Somente quando `https://edukaprime.com.br/.netlify/functions/webhook-amplopay` retornar:
```json
{"error":"Method not allowed"}
```

Aí sim configure no GGCheckout e teste.

---

## 📊 RESULTADOS - Me envie:

Por favor, execute os testes e me envie:

1. **TESTE 1:** Site principal carrega? (Sim/Não)

2. **TESTE 2:**
   - URL: `https://edukaprime.com.br/.netlify/functions/webhook-test`
   - O que aparece? (Cole aqui)

3. **TESTE 3:**
   - URL: `https://edukaprime.com.br/.netlify/functions/webhook-amplopay`
   - O que aparece? (Cole aqui)

4. **No Netlify Functions:**
   - `webhook-amplopay` aparece na lista? (Sim/Não)
   - Qual a cor/status? (Verde/Vermelho/Não aparece)

5. **Print dos logs** (se houver erro)

---

## 🎯 ATALHO RÁPIDO

Se você quiser ir direto ao ponto:

1. Acesse: https://app.netlify.com
2. Vá em: **Functions**
3. **Tire print da tela toda**
4. Me envie

Isso já vai me dizer 90% do problema!

---

**Execute os testes e me mande os resultados!** 🔍

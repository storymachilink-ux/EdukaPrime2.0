# 🎮 GUIA SUPER SIMPLES - Para Quem Nunca Fez Isso

> Este guia é como um jogo! Cada passo é uma missão. Se seguir direitinho, você ganha! 🏆

---

## 🎯 MISSÃO FINAL: Fazer planos expirar sozinhos todo dia

**Objetivo:** Planos vão virar "expirado" automaticamente. Usuário não tem acesso mais. ✅

---

# 🎮 FASE 1: Achar seu "ID Secreto" do Supabase

Pense no ID como um **CPF do seu projeto**. Todo projeto tem um!

### Como achar?

**Passo A:** Abra o navegador (Chrome, Edge, Firefox, não importa)

**Passo B:** Digite isto na barra de endereço:
```
https://app.supabase.com
```

Aperte Enter.

**Passo C:** Você vai ver a tela do Supabase com seus projetos

**Passo D:** Clique no seu projeto (provavelmente aparece algo como "EDUKAPRIME" ou similar)

**Passo E:** Depois que entrar, olhe para a **BARRA DE ENDEREÇO** do navegador

Vai parecer assim:
```
https://app.supabase.com/project/lkhfbhvamnqgcqlrriaw/settings
```

**Seu ID é isto:** `lkhfbhvamnqgcqlrriaw`

(Aquele código meio estranho entre `/project/` e `/settings`)

**Passo F:** Copie esse código. Pode colar num bloco de notas ou em qualquer lugar que você lembre.

```
Seu ID: _________________ (cole aqui depois)
```

### ✅ Missão A completa!

---

# 🎮 FASE 2: Abrir o "Arquivo Mágico"

Este é um arquivo que contém um "feitiço" para fazer planos expirar. Vamos abrir ele!

### Como fazer?

**Passo A:** No seu computador, abra a pasta do projeto:
```
C:\Users\User\Downloads\AC MIGUEL\SAAS EDUKAPRIME 2.0\project
```

**Passo B:** Entre na pasta `supabase`

**Passo C:** Entre na pasta `migrations`

**Passo D:** Procure por este arquivo:
```
setup-plan-expiration-cron.sql
```

**Passo E:** Clique com botão direito e escolha "Abrir com..." → Bloco de Notas (ou qualquer editor de texto)

### Você vai ver algo assim:
```sql
-- Um monte de código que parece estranho
-- Não se preocupa, é normal!
```

### ✅ Missão B completa!

---

# 🎮 FASE 3: Trocar a Palavra Mágica

Neste arquivo que você abriu, tem uma palavra que precisa trocar.

### Como fazer?

**Passo A:** Procure pela palavra:
```
[YOUR_PROJECT_ID]
```

(Dica: Use `Ctrl+F` para procurar - abre uma caixinha no canto)

**Passo B:** Toda vez que encontrar `[YOUR_PROJECT_ID]`, **substitua pelo seu ID**

Exemplo:
- **ANTES:** `[YOUR_PROJECT_ID]`
- **DEPOIS:** `lkhfbhvamnqgcqlrriaw` (seu ID real)

**Passo C:** Se tem mais de um `[YOUR_PROJECT_ID]` no arquivo, substitua **TODOS**

(Dica: No Bloco de Notas, use `Ctrl+H` para "Substituir" automático)

**Passo D:** Salve o arquivo: `Ctrl+S`

### ✅ Missão C completa!

---

# 🎮 FASE 4: Copiar o Feitiço

Agora vamos copiar tudo que está neste arquivo.

### Como fazer?

**Passo A:** Abra o arquivo `setup-plan-expiration-cron.sql` novamente

**Passo B:** Selecione **TODO** o conteúdo:
- Use `Ctrl+A`

Vai ficar tudo azul/highlighted!

**Passo C:** Copie:
- Use `Ctrl+C`

### ✅ Missão D completa!

---

# 🎮 FASE 5: Ir ao "Portal Mágico" (Supabase SQL Editor)

Agora vamos colar o feitiço no lugar certo.

### Como fazer?

**Passo A:** Abra o navegador de novo

**Passo B:** Digite isto:
```
https://app.supabase.com/project/[SEU_ID]/sql/new
```

Substitua `[SEU_ID]` pelo seu ID (exemplo: `lkhfbhvamnqgcqlrriaw`)

Vai ficar assim:
```
https://app.supabase.com/project/lkhfbhvamnqgcqlrriaw/sql/new
```

Aperte Enter.

**Passo C:** Você vai ver uma tela branca grande (é o "Editor")

**Passo D:** Clique dentro da caixa de texto grande

**Passo E:** Cola o código:
- Use `Ctrl+V`

Todo o feitiço vai aparecer lá!

### ✅ Missão E completa!

---

# 🎮 FASE 6: Apertar o Botão Mágico "RUN"

Agora vem a parte legal! Vamos "ativar" o feitiço!

### Como fazer?

**Passo A:** Procure por um botão **VERDE** que diz **"Run"**

(Normalmente está no canto inferior direito ou superior da tela)

**Passo B:** Clique nele!

### O que vai acontecer?

Pode aparecer:
```
✅ Query completed successfully
```

OU

```
⏳ Loading... (esperando processar)
```

### Se aparecer ✅ "Query completed successfully"
**PARABÉNS!** Você conseguiu! 🎉

### Se aparecer ❌ erro
Procure pela mensagem de erro e manda pra mim que a gente resolve!

### ✅ Missão F completa!

---

# 🎮 FASE 7: Confirmar que o Feitiço Funcionou

Vamos garantir que tudo está certo!

### Como fazer?

**Passo A:** Você ainda está no "SQL Editor" (aquela caixa de código)?

Se não, abra de novo:
```
https://app.supabase.com/project/[SEU_ID]/sql/new
```

**Passo B:** Limpe a caixa (pode fazer `Ctrl+A` e depois `Delete`)

**Passo C:** Cola isto:
```sql
SELECT * FROM cron.job WHERE jobname = 'check-plan-expiration-daily';
```

**Passo D:** Clique no botão verde "Run"

### O que vai aparecer?

Se tudo deu certo, vai aparecer uma **tabela** com 1 linha tipo:

```
jobname: check-plan-expiration-daily
schedule: 0 0 * * *
active: true
```

Se apareceu isso = **DEUS! FUNCIONOU!** 🎉🎉🎉

---

# 🎮 FASE 8: O Último Passo (Terminal)

Agora vamos fazer o último passo! Abrir o "Terminal" (assusta mas é fácil!)

### O que é Terminal?

É como um "chat" com o computador. Você digita comandos, ele executa.

### Como abrir?

**OPÇÃO A (Windows):**
- Aperte `Windows + R` (tecla com logo do Windows + R)
- Digita: `cmd`
- Aperta Enter
- Abre uma tela preta

**OPÇÃO B (Windows):**
- Clica com botão direito na pasta do projeto
- Procura por "Abrir terminal aqui" ou "Open in Terminal"
- Pronto!

### Você vai ver algo assim:
```
C:\Users\User\Downloads\AC MIGUEL\SAAS EDUKAPRIME 2.0\project>
```

Aquele `>` está esperando você digitar algo!

### O que digitar?

Cole isto:
```bash
supabase functions deploy check-plan-expiration
```

Aperta **Enter**.

### O que vai acontecer?

Vai ficar processando (pode levar 10-20 segundos)

Se aparecer:
```
✅ Deployed function check-plan-expiration
```

**PERFEITO!** Funcionou! 🎉

Se aparecer erro, manda pra mim que a gente vê!

### ✅ Missão H completa!

---

# 🏆 VOCÊ TERMINOU! PARABÉNS!

Agora seu sistema vai:

✅ **Todos os dias à meia-noite (00:00 UTC)**
- Verificar quem expirou
- Marcar como "expirado"
- Avisar o usuário

**SEM VOCÊ FAZER NADA MAIS!** 🚀

---

# 🆘 Ficou com dúvida em algum passo?

Manda a dúvida e o número da missão:

- "Não achei a pasta `supabase`" → Missão B
- "Não achei o botão `Run`" → Missão F
- "Deu erro no terminal" → Missão H
- "Onde acho meu Project ID?" → Fase 1

Que eu ajudo! 😊

---

**Versão:** 1.0 - Super Simples Edition
**Para:** Quem não entende programação
**Status:** ✅ Pronto!

# RELATÓRIO DE INVESTIGAÇÃO - SISTEMA DE BADGES/GAMIFICAÇÃO

Data: 27/11/2025
Banco: Supabase (lkhfbhvamnqgcqlrriaw.supabase.co)

---

## RESUMO EXECUTIVO

O sistema possui **DOIS sistemas de gamificação paralelos**:

1. **Sistema ANTIGO**: `badges` + `user_badges` (em uso, funcional)
2. **Sistema NOVO**: `achievements` + `user_achievements` + `levels` + `xp_history` + `user_gamification` (criado mas VAZIO)

---

## 1. TABELAS ENCONTRADAS

### Tabelas de Gamificação Ativas (Sistema Antigo)

#### 1.1. `badges` - 12 registros
**Status**: ✅ ATIVA, COM DADOS

**Estrutura**:
- `id` (TEXT/PRIMARY KEY) - ID customizado (ex: "material_download_1")
- `title` (TEXT) - Título do badge
- `description` (TEXT) - Descrição
- `icon` (TEXT) - Emoji do ícone
- `type` (TEXT) - Tipo do badge
- `requirement_value` (NUMBER) - Valor necessário para desbloquear
- `created_at` (TIMESTAMP)

**Dados cadastrados**:

**Badges de Downloads** (4 badges):
1. `material_download_1` - "Primeiro Download" (1 download)
2. `material_download_5` - "Colecionador" (5 downloads)
3. `material_download_10` - "Explorador" (10 downloads)
4. `material_download_15` - "Biblioteca Pessoal" (15 downloads)

**Badges de Completude** (4 badges):
5. `material_completed_1` - "Primeiro Passo" (1 completo)
6. `material_completed_5` - "Dedicado" (5 completos)
7. `material_completed_10` - "Persistente" (10 completos)
8. `material_completed_15` - "Mestre Completo" (15 completos)

**Badges de Chat** (4 badges):
9. `chat_100` - "Comunicativo" (100 pontos)
10. `chat_500` - "Locutor" (500 pontos)
11. `chat_1000` - "Porta-Voz" (1000 pontos)
12. `chat_2000` - "Estrela da Comunidade" (2000 pontos)

---

#### 1.2. `user_badges` - 21 registros conquistados
**Status**: ✅ ATIVA, COM DADOS

**Estrutura**:
- `id` (UUID/PRIMARY KEY)
- `user_id` (UUID) - FK para users.id
- `badge_id` (TEXT) - FK para badges.id
- `earned_at` (TIMESTAMP) - Quando ganhou
- `created_at` (TIMESTAMP)

**Distribuição de badges conquistados**:
- `material_download_1`: 6 usuários
- `material_download_5`: 4 usuários
- `material_download_10`: 2 usuários
- `material_completed_1`: 2 usuários
- `material_completed_5`: 2 usuários
- `material_completed_10`: 1 usuário
- `first_download`: 2 usuários ⚠️ (BADGE ANTIGO - não existe mais em badges)
- `first_video`: 2 usuários ⚠️ (BADGE ANTIGO - não existe mais em badges)

**IMPORTANTE**: Existem badges sendo conquistados! Sistema está ativo.

---

### Tabelas de Gamificação Novas (Sistema Novo - VAZIAS)

#### 1.3. `achievements` - 17 registros cadastrados
**Status**: ✅ CADASTROS EXISTEM, mas SEM usuários conquistando

**Estrutura**:
- `id` (UUID/PRIMARY KEY)
- `code` (TEXT) - Código único (ex: "first_activity")
- `title` (TEXT)
- `description` (TEXT)
- `icon` (TEXT)
- `xp_reward` (NUMBER) - XP que o achievement dá
- `requirement_type` (TEXT) - Tipo (atividades, videos, streak, level, xp, bonus)
- `requirement_value` (NUMBER)
- `created_at` (TIMESTAMP)

**Achievements cadastrados**:

**Atividades** (5 achievements):
1. `first_activity` - "Primeira Conquista" (1 atividade, 10 XP)
2. `activity_10` - "Dedicado" (10 atividades, 50 XP)
3. `activity_25` - "Persistente" (25 atividades, 100 XP)
4. `activity_50` - "Incansável" (50 atividades, 200 XP)
5. `activity_100` - "Campeão" (100 atividades, 500 XP)

**Sequência (Streak)** (4 achievements):
6. `streak_3` - "Sequência Iniciada" (3 dias, 30 XP)
7. `streak_7` - "Uma Semana" (7 dias, 70 XP)
8. `streak_30` - "Um Mês Completo" (30 dias, 300 XP)
9. `streak_100` - "Dedicação Total" (100 dias, 1000 XP)

**Vídeos** (2 achievements):
10. `video_10` - "Observador" (10 vídeos, 50 XP)
11. `video_50` - "Cinéfilo Educacional" (50 vídeos, 200 XP)

**Bônus** (1 achievement):
12. `bonus_all` - "Explorador de Bônus" (5 bônus, 100 XP)

**Níveis** (3 achievements):
13. `level_3` - "Estudante Dedicado" (nível 3, 100 XP)
14. `level_5` - "Expert" (nível 5, 300 XP)
15. `level_7` - "Lendário" (nível 7, 1000 XP)

**XP Total** (2 achievements):
16. `xp_1000` - "Milhar" (1000 XP total, ganha 100 XP)
17. `xp_5000` - "Cinco Mil" (5000 XP total, ganha 500 XP)

---

#### 1.4. `user_achievements` - 0 registros
**Status**: ⚠️ VAZIA - Nenhum usuário conquistou achievements ainda

**Estrutura esperada**:
- Provavelmente: user_id, achievement_id, earned_at

**Problema**: Sistema criado mas não está registrando conquistas!

---

#### 1.5. `levels` - 7 níveis cadastrados
**Status**: ✅ CADASTROS EXISTEM

**Estrutura**:
- `id` (NUMBER/PRIMARY KEY)
- `level_number` (NUMBER)
- `level_name` (TEXT)
- `xp_required` (NUMBER)
- `icon` (TEXT)
- `color` (TEXT) - Código hex
- `created_at` (TIMESTAMP)

**Níveis cadastrados**:
1. Nível 1: "Iniciante" 🌱 (0 XP) - #10B981
2. Nível 2: "Aprendiz" 📚 (100 XP) - #3B82F6
3. Nível 3: "Estudante" 🎓 (300 XP) - #8B5CF6
4. Nível 4: "Conhecedor" 🧠 (600 XP) - #EC4899
5. Nível 5: "Expert" ⭐ (1000 XP) - #F59E0B
6. Nível 6: "Mestre" 👑 (1500 XP) - #EF4444
7. Nível 7: "Lendário" 🏆 (2500 XP) - #6366F1

---

#### 1.6. `xp_history` - 0 registros
**Status**: ⚠️ VAZIA

**Problema**: Deveria registrar histórico de XP ganho, mas está vazio.

---

#### 1.7. `user_gamification` - 0 registros
**Status**: ⚠️ VAZIA - Esta é a tabela principal do novo sistema!

**Estrutura esperada**:
- Provavelmente: user_id, current_xp, current_level, total_xp, streak, etc.

**Problema CRÍTICO**: Esta tabela deveria armazenar o estado de gamificação de cada usuário, mas está completamente vazia!

---

### Tabelas de Tracking (Sistema Comum)

#### 1.8. `user_progress` - 47 registros
**Status**: ✅ ATIVA, COM DADOS

**Estrutura**:
- `id` (UUID/PRIMARY KEY)
- `user_id` (UUID)
- `resource_type` (TEXT) - "atividade", "video", "bonus"
- `resource_id` (UUID)
- `resource_title` (TEXT)
- `status` (TEXT) - "started", "completed"
- `progress_percent` (NUMBER)
- `time_spent` (NUMBER)
- `completed_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Uso**: Esta tabela rastreia o progresso de usuários em atividades, vídeos e bônus. É a fonte de dados para gatilhos de badges/achievements.

**Exemplos de dados**:
- 988e8d79... completou "Atividades de Fonética" em 2025-10-01
- 988e8d79... completou "Letras e Fonemas como funcionam?" (vídeo) em 2025-10-01
- 37f30787... completou 10+ atividades/vídeos/bônus

---

### Tabelas de Conteúdo

#### 1.9. `atividades` - 8 registros
**Colunas**: id, titulo, descricao, imagem, link_download, faixa_etaria, categoria, nicho, created_at, badge_texto, badge_cor, badge_text_color, available_for_plans

#### 1.10. `videos` - 9 registros
**Colunas**: id, titulo, duracao, categoria, descricao, youtube_url, thumbnail, created_at, badge_texto, badge_cor, badge_text_color, available_for_plans

#### 1.11. `bonus` - 4 registros
**Colunas**: id, titulo, descricao, categoria, icone_url, link_download, created_at, badge_texto, badge_cor, badge_text_color, imagem_url, available_for_plans

---

### Tabelas Vazias (Criadas mas não usadas)

As seguintes tabelas existem mas estão vazias:
- `materiais`
- `downloads`
- `user_downloads`
- `user_activities`
- `user_videos`
- `progress_tracking`
- `user_stats`
- `statistics`
- `badges_old`
- `old_badges`
- `badges_backup`
- `first_time_badges`
- `first_access_badges`
- `legacy_badges`
- `initial_badges`

---

## 2. FOREIGN KEYS E RELACIONAMENTOS

### Sistema Antigo (Badges)
```
users (id)
  ↓
user_badges (user_id)
  ↓
badges (id) via badge_id
```

### Sistema Novo (Achievements)
```
users (id)
  ↓
user_gamification (user_id) [TABELA VAZIA!]
  ↓
levels (level_number)

users (id)
  ↓
user_achievements (user_id) [TABELA VAZIA!]
  ↓
achievements (id)

users (id)
  ↓
xp_history (user_id) [TABELA VAZIA!]
```

### Sistema de Tracking (Comum aos dois)
```
users (id)
  ↓
user_progress (user_id)
  ↓
atividades/videos/bonus (resource_id)
```

---

## 3. BADGES ÓRFÃOS (Antigos)

Foram encontrados **2 badges órfãos** que estão referenciados em `user_badges` mas NÃO existem na tabela `badges`:

1. **`first_download`** - 2 usuários conquistaram
   - Provavelmente era: "Primeiro Download" do sistema antigo

2. **`first_video`** - 2 usuários conquistaram
   - Provavelmente era: "Primeiro Vídeo" do sistema antigo

**Datas de conquista**:
- 2025-10-04 (os primeiros badges conquistados no sistema)

**Hipótese**: Esses badges eram do sistema original e foram removidos/substituídos pelos novos badges `material_download_1` e similares.

---

## 4. ANÁLISE DO PROBLEMA

### O que FUNCIONAVA antes:

1. ✅ Sistema de badges (`badges` + `user_badges`)
   - 12 badges cadastrados
   - 21 badges conquistados por usuários
   - Últimas conquistas: 2025-10-04

2. ✅ Sistema de tracking (`user_progress`)
   - 47 registros de progresso
   - Rastreando atividades, vídeos e bônus
   - Status: started/completed

### O que FOI CRIADO mas NÃO FUNCIONA:

1. ❌ Tabela `user_gamification` - 0 registros
   - Deveria armazenar: XP, nível, streak de cada usuário
   - **ESTÁ VAZIA!**

2. ❌ Tabela `user_achievements` - 0 registros
   - Deveria armazenar: achievements conquistados
   - **ESTÁ VAZIA!**

3. ❌ Tabela `xp_history` - 0 registros
   - Deveria armazenar: histórico de ganho de XP
   - **ESTÁ VAZIA!**

4. ✅ Tabela `achievements` - 17 registros
   - Achievements cadastrados
   - Mas ninguém está conquistando!

5. ✅ Tabela `levels` - 7 registros
   - Níveis cadastrados
   - Mas ninguém tem nível!

---

## 5. CONCLUSÃO

### Sistema Original (que funcionava):

```
FLUXO ANTIGO:
1. Usuário completa atividade → registrado em user_progress
2. Algum código no backend conta quantos completos
3. Se atingir requirement_value → insere em user_badges
4. Frontend mostra badges da tabela user_badges
```

**Características**:
- Simples
- Funcional
- Baseado em contagem direta
- SEM sistema de XP/Níveis
- SEM achievements complexos

### Sistema Novo (que não está funcionando):

```
FLUXO ESPERADO (mas não implementado):
1. Usuário completa atividade → registrado em user_progress
2. Backend deveria:
   a) Adicionar XP em user_gamification
   b) Verificar achievements
   c) Atualizar nível
   d) Registrar em xp_history
3. Frontend mostra XP/Nível/Achievements
```

**Problema**: As etapas 2a, 2b, 2c e 2d NÃO ESTÃO SENDO EXECUTADAS!

---

## 6. RECOMENDAÇÕES

### Opção 1: Voltar ao sistema antigo (SIMPLES)
- Remover tabelas: user_gamification, achievements, user_achievements, xp_history, levels
- Manter apenas: badges + user_badges
- Vantagem: Já funciona!
- Desvantagem: Menos features (sem XP, sem níveis)

### Opção 2: Fazer o sistema novo funcionar (COMPLEXO)
- Implementar toda a lógica de:
  - Cálculo de XP
  - Atualização de níveis
  - Verificação de achievements
  - Inicialização de user_gamification
- Vantagem: Sistema completo de gamificação
- Desvantagem: Muito trabalho

### Opção 3: Híbrido (RECOMENDADO)
- Manter badges antigos funcionando
- Adicionar gradualmente features do novo sistema
- Migrar usuários aos poucos

---

## 7. PRÓXIMOS PASSOS SUGERIDOS

1. **Decisão de arquitetura**:
   - Qual sistema usar?
   - Manter dois sistemas paralelos ou unificar?

2. **Se escolher sistema novo**:
   - Implementar inicialização de user_gamification
   - Implementar cálculo de XP
   - Implementar verificação de achievements
   - Criar migração para usuários existentes

3. **Se escolher sistema antigo**:
   - Fazer limpeza das tabelas novas
   - Otimizar sistema de badges
   - Adicionar novos badges se necessário

---

**Fim do Relatório**

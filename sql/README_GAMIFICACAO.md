# 🎮 Sistema de Gamificação - Instruções de Instalação

## 📋 Visão Geral

O sistema de gamificação adiciona:
- **Sistema de XP e Níveis** (7 níveis: Iniciante → Lendário)
- **Conquistas/Achievements** (17 conquistas padrão)
- **Ranking/Leaderboard** (top usuários por XP)
- **Sistema de Streak** (dias consecutivos)
- **Recompensas Automáticas** (XP por atividades, vídeos, bônus)

## 🚀 Instalação

Execute os arquivos SQL na seguinte ordem no **Supabase SQL Editor**:

### Passo 1: Criar Estrutura Base
```sql
-- Arquivo: create_gamification_system.sql
```
Este arquivo cria:
- ✅ Tabela `user_gamification` (XP, nível, streak de cada usuário)
- ✅ Tabela `levels` (configuração dos 7 níveis)
- ✅ Tabela `achievements` (17 conquistas padrão)
- ✅ Tabela `user_achievements` (conquistas desbloqueadas)
- ✅ Tabela `xp_history` (histórico de ganho de XP)
- ✅ Funções: `add_xp_to_user`, `update_user_streak`, `check_and_unlock_achievements`
- ✅ Políticas RLS

### Passo 2: Criar Triggers Automáticos
```sql
-- Arquivo: create_gamification_triggers.sql
```
Este arquivo cria triggers que automaticamente:
- ✅ Dão **+20 XP** ao completar atividade
- ✅ Dão **+15 XP** ao assistir vídeo (>90%)
- ✅ Dão **+10 XP** ao acessar bônus
- ✅ Atualizam o **streak** diário
- ✅ Verificam e desbloqueiam **conquistas**
- ✅ Dão **bônus de XP** em marcos de streak (3, 7, 30, 100 dias)

## 📊 Estrutura de Níveis

| Nível | Nome | XP Necessário | Ícone |
|-------|------|---------------|-------|
| 1 | Iniciante | 0 | 🌱 |
| 2 | Aprendiz | 100 | 📚 |
| 3 | Estudante | 300 | 🎓 |
| 4 | Conhecedor | 600 | 🧠 |
| 5 | Expert | 1000 | ⭐ |
| 6 | Mestre | 1500 | 👑 |
| 7 | Lendário | 2500 | 🏆 |

## 🏆 Conquistas Disponíveis

### Atividades
- 🎯 **Primeira Conquista** - Complete 1 atividade (+10 XP)
- 💪 **Dedicado** - Complete 10 atividades (+50 XP)
- 🔥 **Persistente** - Complete 25 atividades (+100 XP)
- ⚡ **Incansável** - Complete 50 atividades (+200 XP)
- 🏆 **Campeão** - Complete 100 atividades (+500 XP)

### Streak (Dias Consecutivos)
- 🔥 **Sequência Iniciada** - 3 dias seguidos (+30 XP)
- 📅 **Uma Semana** - 7 dias seguidos (+70 XP)
- 🗓️ **Um Mês Completo** - 30 dias seguidos (+300 XP)
- 💎 **Dedicação Total** - 100 dias seguidos (+1000 XP)

### Vídeos
- 📺 **Observador** - Assista 10 vídeos (+50 XP)
- 🎬 **Cinéfilo Educacional** - Assista 50 vídeos (+200 XP)

### Bônus
- 🎁 **Explorador de Bônus** - Acesse todos os bônus (+100 XP)

### Níveis
- 🎓 **Estudante Dedicado** - Alcance nível 3 (+100 XP)
- ⭐ **Expert** - Alcance nível 5 (+300 XP)
- 🏆 **Lendário** - Alcance nível 7 (+1000 XP)

### XP Total
- 💯 **Milhar** - Acumule 1000 XP (+100 XP)
- 🌟 **Cinco Mil** - Acumule 5000 XP (+500 XP)

## 🎯 Como Funciona o Sistema de XP

### Ganho Automático de XP:
1. **Atividade Concluída**: +20 XP
2. **Vídeo Assistido** (>90%): +15 XP
3. **Bônus Acessado** (primeira vez): +10 XP
4. **Conquista Desbloqueada**: XP da recompensa
5. **Bônus de Streak**: XP em marcos especiais

### Progressão de Nível:
- O nível é calculado automaticamente baseado no XP total
- Ao subir de nível, o usuário é notificado
- Conquistas de nível são desbloqueadas automaticamente

### Sistema de Streak:
- Conta dias consecutivos de acesso
- Resetado se passar mais de 1 dia sem acessar
- Bônus especiais em marcos: 3, 7, 14, 30, 60, 100 dias
- Após 100 dias: bônus a cada 10 dias

## 📱 Páginas Criadas

### 1. `/ranking` - Página de Ranking
- 🏆 Pódio com top 3
- 📊 Lista completa com filtros
- 📍 Posição do usuário destacada
- 📈 Estatísticas (XP, streak, atividades)

### 2. `/conquistas` - Página de Conquistas
- 🏅 Lista todas as conquistas
- ✅ Mostra desbloqueadas vs bloqueadas
- 📊 Barra de progresso para cada conquista
- 💫 Animações ao desbloquear

### 3. Dashboard Widget
- 📊 Resumo de gamificação
- ⭐ XP atual e próximo nível
- 🔥 Streak atual
- 🏆 Links rápidos

## 🔧 Funções SQL Úteis

### Adicionar XP Manualmente
```sql
SELECT add_xp_to_user(
  'user-uuid',           -- ID do usuário
  100,                   -- Quantidade de XP
  'Bônus especial',      -- Motivo
  'manual',              -- Tipo de source
  NULL                   -- ID da fonte (opcional)
);
```

### Ver Gamificação de um Usuário
```sql
SELECT * FROM user_gamification
WHERE user_id = 'user-uuid';
```

### Ver Conquistas de um Usuário
```sql
SELECT
  a.title,
  a.description,
  ua.unlocked_at
FROM user_achievements ua
JOIN achievements a ON a.id = ua.achievement_id
WHERE ua.user_id = 'user-uuid'
ORDER BY ua.unlocked_at DESC;
```

### Top 10 Ranking
```sql
SELECT
  u.nome,
  ug.total_xp,
  ug.current_level,
  l.level_name,
  l.icon
FROM user_gamification ug
JOIN users u ON u.id = ug.user_id
JOIN levels l ON l.level_number = ug.current_level
ORDER BY ug.total_xp DESC
LIMIT 10;
```

## ⚙️ Configuração

### Ajustar Valores de XP

Para modificar os valores de XP ganhos:

1. **Editar triggers** em `create_gamification_triggers.sql`:
```sql
-- Linha 5: XP por atividade
v_xp_earned INTEGER := 20;

-- Linha 35: XP por vídeo
v_xp_earned INTEGER := 15;

-- Linha 65: XP por bônus
v_xp_earned INTEGER := 10;
```

2. **Reexecutar** o arquivo SQL

### Adicionar Novas Conquistas

```sql
INSERT INTO achievements (code, title, description, icon, xp_reward, requirement_type, requirement_value)
VALUES (
  'nova_conquista',                    -- Código único
  'Título da Conquista',               -- Título
  'Descrição da conquista',            -- Descrição
  '🎯',                                -- Ícone emoji
  50,                                  -- XP de recompensa
  'atividades',                        -- Tipo (atividades, videos, bonus, streak, level, xp)
  5                                    -- Valor necessário
);
```

### Adicionar Novos Níveis

```sql
INSERT INTO levels (level_number, level_name, xp_required, icon, color)
VALUES (
  8,                                   -- Número do nível
  'Supremo',                           -- Nome
  5000,                                -- XP necessário
  '👑',                                -- Ícone
  '#FFD700'                            -- Cor
);
```

## 🐛 Solução de Problemas

### XP não está sendo adicionado

Verifique se os triggers estão ativos:
```sql
SELECT * FROM pg_trigger
WHERE tgname LIKE '%xp%';
```

### Conquistas não desbloqueiam

Execute manualmente a verificação:
```sql
SELECT check_and_unlock_achievements('user-uuid');
```

### Resetar gamificação de um usuário

```sql
-- CUIDADO: Isto apaga todos os dados de gamificação
DELETE FROM user_gamification WHERE user_id = 'user-uuid';
DELETE FROM user_achievements WHERE user_id = 'user-uuid';
DELETE FROM xp_history WHERE user_id = 'user-uuid';
```

## 📈 Monitoramento

### Ver Atividade Recente
```sql
SELECT
  u.nome,
  xh.xp_amount,
  xh.reason,
  xh.created_at
FROM xp_history xh
JOIN users u ON u.id = xh.user_id
ORDER BY xh.created_at DESC
LIMIT 20;
```

### Estatísticas Gerais
```sql
SELECT
  COUNT(DISTINCT user_id) as total_usuarios,
  SUM(total_xp) as xp_total_plataforma,
  AVG(total_xp) as xp_medio,
  MAX(current_streak) as maior_streak
FROM user_gamification;
```

## 🎉 Pronto!

Após executar os 2 arquivos SQL, o sistema de gamificação estará 100% funcional e automático!

Os usuários ganharão XP automaticamente ao:
- ✅ Completar atividades
- ✅ Assistir vídeos
- ✅ Acessar bônus
- ✅ Manter streak diário

E poderão ver seu progresso em:
- 📊 Dashboard (widget de gamificação)
- 🏆 Página de Ranking
- 🏅 Página de Conquistas

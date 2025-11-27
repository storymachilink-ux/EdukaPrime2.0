# ⚡ QUICK FIX - BADGES NÃO DESBLOQUEIAM

## O Problema em 10 segundos

```
Você tem 12 downloads, mas "Explorador" (10 downloads) não desbloqueou
Você tem 12 conclusões, mas "Mestre Completo" (15) mostra 12/15
```

## A Solução em 1 minuto

### PASSO 1: Abra Supabase
```
https://lkhfbhvamnqgcqlrriaw.supabase.co
→ SQL Editor (esquerda)
→ New Query
```

### PASSO 2: Cole Este SQL

```sql
-- Desbloquear badges automaticamente
WITH download_counts AS (
  SELECT
    user_id,
    COUNT(*) as total_downloads
  FROM user_progress
  WHERE resource_type IN ('atividade', 'bonus')
    AND status IN ('started', 'completed')
  GROUP BY user_id
)
INSERT INTO user_badges (user_id, badge_id)
SELECT
  dc.user_id,
  b.id
FROM download_counts dc
CROSS JOIN badges b
WHERE b.type = 'material_download'
  AND dc.total_downloads >= b.requirement_value
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = dc.user_id
      AND ub.badge_id = b.id
  )
ON CONFLICT (user_id, badge_id) DO NOTHING;

WITH completion_counts AS (
  SELECT
    user_id,
    COUNT(*) as total_completed
  FROM user_progress
  WHERE resource_type IN ('atividade', 'bonus')
    AND status = 'completed'
  GROUP BY user_id
)
INSERT INTO user_badges (user_id, badge_id)
SELECT
  cc.user_id,
  b.id
FROM completion_counts cc
CROSS JOIN badges b
WHERE b.type = 'material_completed'
  AND cc.total_completed >= b.requirement_value
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = cc.user_id
      AND ub.badge_id = b.id
  )
ON CONFLICT (user_id, badge_id) DO NOTHING;

WITH chat_counts AS (
  SELECT
    user_id,
    COALESCE(total_points, 0) as total_points
  FROM chat_user_stats
)
INSERT INTO user_badges (user_id, badge_id)
SELECT
  cc.user_id,
  b.id
FROM chat_counts cc
CROSS JOIN badges b
WHERE b.type = 'chat_points'
  AND cc.total_points >= b.requirement_value
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = cc.user_id
      AND ub.badge_id = b.id
  )
ON CONFLICT (user_id, badge_id) DO NOTHING;

SELECT '✅ Badges desbloqueadas!' as status;
```

### PASSO 3: Clique em RUN

Aguarde 5 segundos...

### PASSO 4: Recarregue o App

```
Ctrl + Shift + R  (ou Cmd + Shift + R no Mac)
```

### PASSO 5: Vá para Conquistas

Ver todas as badges que você completou marcadas com ✅

---

## 🎉 PRONTO!

As badges agora estão desbloqueadas!

---

## Se não funcionar

Tente o arquivo alternativo:
```
sql/DESBLOQUEIO_MANUAL_FACIL.sql
```

(É o mesmo SQL, mas separado por linhas)

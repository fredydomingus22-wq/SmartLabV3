-- Verificar lotes de produção existentes e seus status
SELECT 
    id,
    code,
    status,
    product_id,
    created_at
FROM production_lots
ORDER BY created_at DESC
LIMIT 20;

-- Contar lotes por status
SELECT 
    status,
    COUNT(*) as count
FROM production_lots
GROUP BY status
ORDER BY count DESC;

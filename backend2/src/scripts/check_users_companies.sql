-- Script para verificar usuarios y sus empresas

-- Ver todos los usuarios con su empresa
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.company_id,
    u.is_active,
    c.name as company_name
FROM DD_users u
LEFT JOIN DD_companies c ON u.company_id = c.id
ORDER BY u.id DESC;

-- Contar usuarios por empresa
SELECT 
    c.id,
    c.name,
    COUNT(u.id) as total_users,
    COUNT(CASE WHEN u.is_active = 1 THEN 1 END) as active_users
FROM DD_companies c
LEFT JOIN DD_users u ON c.id = u.company_id
GROUP BY c.id, c.name
ORDER BY c.id;

-- Ver usuarios sin empresa
SELECT id, username, email, role, company_id
FROM DD_users
WHERE company_id IS NULL;

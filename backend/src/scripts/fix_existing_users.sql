-- Script para asignar empresa a usuarios existentes

-- 1. Ver todos los usuarios sin empresa
SELECT id, username, email, role, company_id 
FROM DD_users 
WHERE company_id IS NULL
ORDER BY id DESC;

-- 2. Asignar empresa a usuarios específicos
-- IMPORTANTE: Cambia los valores según tu caso

-- Ejemplo: Asignar empresa ID 1 a usuarios específicos
-- UPDATE DD_users SET company_id = 1 WHERE id IN (2, 3, 4);

-- Ejemplo: Asignar empresa ID 1 a todos los usuarios que no sean super_admin
-- UPDATE DD_users 
-- SET company_id = 1 
-- WHERE role != 'super_admin' AND company_id IS NULL;

-- 3. Verificar cambios
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.company_id,
    c.name as company_name
FROM DD_users u
LEFT JOIN DD_companies c ON u.company_id = c.id
ORDER BY u.id DESC;

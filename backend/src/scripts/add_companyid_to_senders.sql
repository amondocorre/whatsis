-- Agregar columna company_id a la tabla whatsapp_senders

SET @prefix = 'DD_';

-- Agregar columna company_id
SET @sql := CONCAT('ALTER TABLE `', @prefix, 'whatsapp_senders` 
  ADD COLUMN IF NOT EXISTS `company_id` INT DEFAULT NULL AFTER `phone_number`,
  ADD INDEX IF NOT EXISTS `idx_company_id` (`company_id`);');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar estructura
SET @sql := CONCAT('DESCRIBE `', @prefix, 'whatsapp_senders`;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ver emisores con sus empresas
SET @sql := CONCAT('SELECT 
    s.id,
    s.alias,
    s.phone_number,
    s.company_id,
    c.name as company_name,
    s.is_active
FROM `', @prefix, 'whatsapp_senders` s
LEFT JOIN `', @prefix, 'companies` c ON s.company_id = c.id
ORDER BY s.id DESC;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

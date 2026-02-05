-- Script para agregar la columna is_active a la tabla de senders
-- Ejecutar en MySQL después de cambiar el prefijo si es necesario

SET @prefix = 'DD_';

SET @sql := CONCAT('ALTER TABLE `', @prefix, 'whatsapp_senders` ADD COLUMN IF NOT EXISTS `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `status`;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Columna is_active agregada exitosamente' AS resultado;

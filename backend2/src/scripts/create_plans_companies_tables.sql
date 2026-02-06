-- Script para crear tablas de Planes y Empresas
-- Sistema de control de cuotas multiempresa

SET @prefix = 'DD_';

-- Tabla de Planes
SET @sql := CONCAT('CREATE TABLE IF NOT EXISTS `', @prefix, 'plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `max_messages_month` INT NOT NULL DEFAULT 1000,
  `max_senders` INT NOT NULL DEFAULT 1,
  `features` JSON DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tabla de Empresas
SET @sql := CONCAT('CREATE TABLE IF NOT EXISTS `', @prefix, 'companies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `plan_id` INT NOT NULL,
  `messages_used_month` INT NOT NULL DEFAULT 0,
  `billing_cycle_start` DATE NOT NULL,
  `status` ENUM(''active'', ''suspended'', ''cancelled'') NOT NULL DEFAULT ''active'',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_plan_id` (`plan_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_is_active` (`is_active`),
  CONSTRAINT `fk_company_plan` FOREIGN KEY (`plan_id`) REFERENCES `', @prefix, 'plans`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna company_id a users
SET @sql := CONCAT('ALTER TABLE `', @prefix, 'users` 
  ADD COLUMN IF NOT EXISTS `company_id` INT DEFAULT NULL AFTER `role`,
  ADD INDEX IF NOT EXISTS `idx_company_id` (`company_id`);');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Modificar ENUM de role en users para incluir nuevos roles
SET @sql := CONCAT('ALTER TABLE `', @prefix, 'users` 
  MODIFY COLUMN `role` ENUM(''super_admin'', ''admin_empresa'', ''admin'', ''operador'') NOT NULL DEFAULT ''operador'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna company_id a message_logs
SET @sql := CONCAT('ALTER TABLE `', @prefix, 'message_logs` 
  ADD COLUMN IF NOT EXISTS `company_id` INT DEFAULT NULL AFTER `sender_id`,
  ADD INDEX IF NOT EXISTS `idx_company_id` (`company_id`);');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insertar planes por defecto
SET @sql := CONCAT('INSERT IGNORE INTO `', @prefix, 'plans` (`name`, `max_messages_month`, `max_senders`, `features`) VALUES
  (''Starter'', 1000, 1, ''{"support": "email", "analytics": false}''),
  (''Growth'', 10000, 3, ''{"support": "email", "analytics": true}''),
  (''Pro'', 50000, 10, ''{"support": "priority", "analytics": true, "api_access": true}''),
  (''Enterprise'', 999999999, 999, ''{"support": "24/7", "analytics": true, "api_access": true, "custom_features": true}'');');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Tablas de planes y empresas creadas exitosamente' AS resultado;

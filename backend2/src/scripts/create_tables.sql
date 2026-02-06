-- Script de creación de tablas con prefijo configurable.
-- Cambia el valor de @prefix si deseas otro prefijo (ej: 'EMP1_').

SET @prefix = 'DD_';

-- Tabla de usuarios
SET @sql := CONCAT('
CREATE TABLE IF NOT EXISTS `', @prefix, 'users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM(''admin'',''operador'') NOT NULL DEFAULT ''operador'',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Tabla de números emisores
SET @sql := CONCAT('
CREATE TABLE IF NOT EXISTS `', @prefix, 'whatsapp_senders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `alias` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL UNIQUE,
  `status` ENUM(''activo'',''inactivo'',''conectando'',''desconectado'') NOT NULL DEFAULT ''inactivo'',
  `is_connected` TINYINT(1) NOT NULL DEFAULT 0,
  `last_connection` DATETIME NULL,
  `qr_code` LONGTEXT NULL,
  `session_data` LONGTEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Tabla de campañas
SET @sql := CONCAT('
CREATE TABLE IF NOT EXISTS `', @prefix, 'message_campaigns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `user_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `total_messages` INT NOT NULL DEFAULT 0,
  `sent_messages` INT NOT NULL DEFAULT 0,
  `failed_messages` INT NOT NULL DEFAULT 0,
  `status` ENUM(''pendiente'',''en_proceso'',''completada'',''cancelada'',''error'') NOT NULL DEFAULT ''pendiente'',
  `scheduled_at` DATETIME NULL,
  `started_at` DATETIME NULL,
  `completed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_', @prefix, 'campaign_user` FOREIGN KEY (`user_id`) REFERENCES `', @prefix, 'users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_', @prefix, 'campaign_sender` FOREIGN KEY (`sender_id`) REFERENCES `', @prefix, 'whatsapp_senders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Tabla de logs de mensajes
SET @sql := CONCAT('
CREATE TABLE IF NOT EXISTS `', @prefix, 'message_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `campaign_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM(''pendiente'',''enviado'',''fallido'') NOT NULL DEFAULT ''pendiente'',
  `error_message` TEXT NULL,
  `sent_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_', @prefix, 'log_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `', @prefix, 'message_campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_', @prefix, 'log_sender` FOREIGN KEY (`sender_id`) REFERENCES `', @prefix, 'whatsapp_senders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Índices recomendados
SET @sql := CONCAT('CREATE INDEX IF NOT EXISTS `idx_', @prefix, 'logs_campaign` ON `', @prefix, 'message_logs`(`campaign_id`);');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := CONCAT('CREATE INDEX IF NOT EXISTS `idx_', @prefix, 'logs_sender` ON `', @prefix, 'message_logs`(`sender_id`);');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Fin del script

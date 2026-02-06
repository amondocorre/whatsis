# 🚀 Guía de Instalación - Backend

## Requisitos del Sistema

- Node.js >= 16.x
- MySQL >= 5.7 o SQL Server
- npm o yarn
- XAMPP (opcional)

## Paso 1: Instalar Dependencias

```bash
cd backend
npm install
```

## Paso 2: Configurar Variables de Entorno

Copiar `.env.example` a `.env`:

```bash
copy .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Puerto del servidor
PORT=5000
NODE_ENV=development

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsapp_system
DB_USER=root
DB_PASSWORD=

# JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala_en_produccion
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp-sessions
```

## Paso 3: Crear Base de Datos

### Opción A: MySQL con XAMPP

1. Iniciar XAMPP
2. Abrir phpMyAdmin (http://localhost/phpmyadmin)
3. Crear nueva base de datos:

```sql
CREATE DATABASE whatsapp_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Opción B: MySQL por línea de comandos

```bash
mysql -u root -p
```

```sql
CREATE DATABASE whatsapp_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Opción C: SQL Server

Ajustar en `.env`:

```env
DB_DIALECT=mssql
DB_HOST=localhost
DB_PORT=1433
DB_NAME=whatsapp_system
DB_USER=sa
DB_PASSWORD=tu_password
```

Y modificar `src/config/database.js`:

```javascript
dialect: 'mssql',  // Cambiar de 'mysql' a 'mssql'
```

## Paso 4: Iniciar el Servidor

### Modo Desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo Producción

```bash
npm start
```

## Paso 5: Verificar Instalación

Abrir en el navegador o Postman:

```
http://localhost:5000/api/health
```

Deberías ver:

```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Paso 6: Crear Usuario Administrador

### Usando Postman o Thunder Client

**POST** `http://localhost:5000/api/auth/register`

**Body (JSON):**
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Estructura de Carpetas Generadas

Después de la instalación, se crearán automáticamente:

```
backend/
├── node_modules/        # Dependencias
├── uploads/             # Archivos Excel temporales
├── whatsapp-sessions/   # Sesiones de WhatsApp
└── .env                 # Variables de entorno
```

## Endpoints Disponibles

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere token)

### Números Emisores
- `GET /api/senders` - Listar números
- `POST /api/senders` - Crear número (admin)
- `GET /api/senders/:id` - Obtener número
- `PUT /api/senders/:id` - Actualizar número (admin)
- `DELETE /api/senders/:id` - Eliminar número (admin)
- `POST /api/senders/:id/initialize` - Conectar WhatsApp
- `POST /api/senders/:id/disconnect` - Desconectar WhatsApp
- `GET /api/senders/:id/qr` - Obtener código QR
- `GET /api/senders/:id/status` - Estado de conexión

### Mensajes
- `POST /api/messages/upload` - Cargar Excel
- `POST /api/messages/campaign` - Crear campaña
- `POST /api/messages/send` - Enviar mensajes
- `GET /api/messages/campaigns` - Listar campañas
- `GET /api/messages/campaigns/:id` - Detalle de campaña
- `GET /api/messages/campaigns/:id/logs` - Logs de campaña
- `POST /api/messages/test` - Enviar mensaje de prueba

## Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**
1. Verificar que MySQL esté corriendo
2. Revisar credenciales en `.env`
3. Verificar que la base de datos exista

### Error: "Port 5000 already in use"

**Solución:**
Cambiar el puerto en `.env`:
```env
PORT=5001
```

### Error: "Module not found"

**Solución:**
```bash
rm -rf node_modules
npm install
```

### Error al inicializar WhatsApp

**Solución:**
1. Eliminar carpeta `whatsapp-sessions`
2. Reiniciar el servidor
3. Volver a conectar el número

## Configuración para Producción

### 1. Cambiar Variables de Entorno

```env
NODE_ENV=production
JWT_SECRET=clave_super_segura_generada_aleatoriamente
CORS_ORIGIN=https://tu-dominio.com
```

### 2. Usar PM2 para Gestión de Procesos

```bash
npm install -g pm2
pm2 start src/server.js --name whatsapp-api
pm2 save
pm2 startup
```

### 3. Configurar Nginx como Proxy Reverso

```nginx
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Mantenimiento

### Backup de Base de Datos

```bash
mysqldump -u root -p whatsapp_system > backup_$(date +%Y%m%d).sql
```

### Limpiar Sesiones Antiguas

```bash
rm -rf whatsapp-sessions/*
```

### Ver Logs con PM2

```bash
pm2 logs whatsapp-api
```

## Seguridad

✅ **Implementado:**
- Hash de contraseñas con bcrypt
- Autenticación JWT
- Validación de inputs
- Rate limiting
- CORS configurado
- Helmet para headers seguros

⚠️ **Recomendaciones adicionales:**
- Usar HTTPS en producción
- Configurar firewall
- Limitar acceso a base de datos
- Realizar backups regulares
- Monitorear logs de seguridad

---

**¿Necesitas ayuda?** Revisa los logs en la consola del servidor.

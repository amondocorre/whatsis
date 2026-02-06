const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { WhatsappSender } = require('../models');

class WhatsAppService {
  constructor() {
    this.clients = new Map();
    this.sessionPath = process.env.WHATSAPP_SESSION_PATH || './whatsapp-sessions';
    
    if (!fs.existsSync(this.sessionPath)) {
      fs.mkdirSync(this.sessionPath, { recursive: true });
    }
  }

  async initializeClient(senderId) {
    try {
      const sender = await WhatsappSender.findByPk(senderId);
      
      if (!sender) {
        throw new Error('Número emisor no encontrado');
      }

      if (this.clients.has(senderId)) {
        const existingClient = this.clients.get(senderId);
        if (existingClient.info) {
          return { success: true, message: 'Cliente ya está conectado' };
        }
      }

      await sender.update({ 
        status: 'conectando',
        qrCode: null 
      });

      console.log(`[WhatsApp] Inicializando cliente para sender ${senderId}...`);
      console.log(`[WhatsApp] Ruta de sesión: ${this.sessionPath}`);
      
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: `sender-${senderId}`,
          dataPath: this.sessionPath
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ],
          timeout: 60000
        },
        authTimeoutMs: 60000,
        qrTimeoutMs: 60000
      });

      client.on('qr', async (qr) => {
        console.log(`\n========================================`);
        console.log(`[WhatsApp] QR generado para sender ${senderId}`);
        console.log(`[WhatsApp] Escanea el código QR en los próximos 60 segundos`);
        console.log(`========================================\n`);
        try {
          const qrDataUrl = await qrcode.toDataURL(qr);
          await sender.update({ 
            qrCode: qrDataUrl,
            status: 'conectando'
          });
          console.log(`[WhatsApp] QR guardado en base de datos para sender ${senderId}`);
        } catch (error) {
          console.error('[WhatsApp] Error al generar QR:', error);
        }
      });

      client.on('ready', async () => {
        console.log(`\n========================================`);
        console.log(`[WhatsApp] ✅ Cliente ${senderId} está listo (ready)`);
        console.log(`[WhatsApp] ✅ Conexión establecida exitosamente`);
        console.log(`========================================\n`);
        await sender.update({
          status: 'activo',
          isConnected: true,
          lastConnection: new Date(),
          qrCode: null
        });
      });

      client.on('authenticated', async () => {
        console.log(`\n========================================`);
        console.log(`[WhatsApp] ✅ Cliente ${senderId} autenticado (authenticated)`);
        console.log(`[WhatsApp] Esperando evento 'ready'...`);
        console.log(`========================================\n`);
      });

      client.on('auth_failure', async (msg) => {
        console.error(`\n========================================`);
        console.error(`[WhatsApp] ❌ Fallo de autenticación para sender ${senderId}`);
        console.error(`[WhatsApp] Mensaje:`, msg);
        console.error(`[WhatsApp] Solución: Elimina la carpeta de sesión y vuelve a intentar`);
        console.error(`========================================\n`);
        await sender.update({
          status: 'desconectado',
          isConnected: false
        });
        this.clients.delete(senderId);
      });

      client.on('disconnected', async (reason) => {
        console.log(`\n========================================`);
        console.log(`[WhatsApp] ⚠️ Cliente ${senderId} desconectado`);
        console.log(`[WhatsApp] Razón:`, reason);
        console.log(`========================================\n`);
        await sender.update({
          status: 'desconectado',
          isConnected: false
        });
        this.clients.delete(senderId);
      });

      client.on('change_state', (state) => {
        console.log(`[WhatsApp] 🔄 Cambio de estado sender ${senderId}:`, state);
      });

      client.on('loading_screen', (percent, message) => {
        console.log(`[WhatsApp] ⏳ Cargando sesión sender ${senderId}: ${percent}% - ${message}`);
      });

      client.on('remote_session_saved', () => {
        console.log(`[WhatsApp] 💾 Sesión remota guardada para sender ${senderId}`);
      });

      client.on('message', (msg) => {
        console.log(`[WhatsApp] 📨 Mensaje recibido en sender ${senderId}`);
      });

      client.on('error', (error) => {
        console.error(`\n========================================`);
        console.error(`[WhatsApp] ❌ Error en cliente sender ${senderId}:`);
        console.error(error);
        console.error(`========================================\n`);
      });

      this.clients.set(senderId, client);
      
      console.log(`[WhatsApp] 🚀 Iniciando cliente para sender ${senderId}...`);
      await client.initialize();
      console.log(`[WhatsApp] ⏳ Cliente inicializado, esperando QR o autenticación...`);

      return { 
        success: true, 
        message: 'Inicializando cliente WhatsApp. Escanea el código QR.' 
      };

    } catch (error) {
      console.error('Error al inicializar cliente:', error);
      throw error;
    }
  }

  async disconnectClient(senderId) {
    try {
      const client = this.clients.get(senderId);
      
      if (client) {
        await client.destroy();
        this.clients.delete(senderId);
      }

      const sender = await WhatsappSender.findByPk(senderId);
      if (sender) {
        await sender.update({
          status: 'inactivo',
          isConnected: false,
          qrCode: null
        });
      }

      return { success: true, message: 'Cliente desconectado correctamente' };
    } catch (error) {
      console.error('Error al desconectar cliente:', error);
      throw error;
    }
  }

  async sendMessage(senderId, phoneNumber, message) {
    try {
      const client = this.clients.get(senderId);
      
      if (!client) {
        throw new Error('Cliente no inicializado');
      }

      if (!client.info) {
        throw new Error('Cliente no está conectado');
      }

      let formattedNumber = phoneNumber.replace(/\D/g, '');
      
      if (!formattedNumber.endsWith('@c.us')) {
        formattedNumber = `${formattedNumber}@c.us`;
      }

      await client.sendMessage(formattedNumber, message);

      return { success: true, message: 'Mensaje enviado correctamente' };
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  getClient(senderId) {
    return this.clients.get(senderId);
  }

  isClientConnected(senderId) {
    const client = this.clients.get(senderId);
    return client && client.info ? true : false;
  }

  async getQRCode(senderId) {
    const sender = await WhatsappSender.findByPk(senderId);
    return sender ? sender.qrCode : null;
  }
}

module.exports = new WhatsAppService();

const { WhatsappSender } = require('../models');
const whatsappService = require('../services/whatsappService');

const senderController = {
  async createSender(req, res, next) {
    try {
      const { alias, phoneNumber } = req.body;
      const user = req.user;

      const companyId = user.role === 'super_admin' ? null : user.companyId;

      const whereClause = { phoneNumber };
      if (companyId) {
        whereClause.companyId = companyId;
      }

      const existingSender = await WhatsappSender.findOne({
        where: whereClause
      });

      if (existingSender) {
        if (!existingSender.isActive) {
          await existingSender.update({
            alias,
            isActive: true,
            status: 'inactivo',
            isConnected: false,
            qrCode: null
          });
          return res.status(200).json({
            success: true,
            message: 'Número emisor reactivado exitosamente',
            data: existingSender
          });
        }
        return res.status(409).json({
          success: false,
          message: 'Este número ya está registrado y activo en su empresa'
        });
      }

      const sender = await WhatsappSender.create({
        alias,
        phoneNumber,
        companyId,
        status: 'inactivo',
        isConnected: false,
        isActive: true
      });

      res.status(201).json({
        success: true,
        message: 'Número emisor registrado exitosamente',
        data: sender
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllSenders(req, res, next) {
    try {
      const { includeInactive } = req.query;
      const user = req.user;
      
      const whereClause = includeInactive === 'true' ? {} : { isActive: true };
      
      if (user.role !== 'super_admin' && user.companyId) {
        whereClause.companyId = user.companyId;
      }
      
      const senders = await WhatsappSender.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: senders
      });
    } catch (error) {
      next(error);
    }
  },

  async getSender(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const sender = await WhatsappSender.findByPk(id);

      if (!sender) {
        return res.status(404).json({
          success: false,
          message: 'Número emisor no encontrado'
        });
      }

      if (user.role !== 'super_admin' && sender.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este emisor'
        });
      }

      res.json({
        success: true,
        data: sender
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSender(req, res, next) {
    try {
      const { id } = req.params;
      const { alias, phoneNumber } = req.body;
      const user = req.user;

      const sender = await WhatsappSender.findByPk(id);

      if (!sender) {
        return res.status(404).json({
          success: false,
          message: 'Número emisor no encontrado'
        });
      }

      if (user.role !== 'super_admin' && sender.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para editar este emisor'
        });
      }

      if (phoneNumber && phoneNumber !== sender.phoneNumber) {
        const existingSender = await WhatsappSender.findOne({
          where: { phoneNumber }
        });

        if (existingSender) {
          return res.status(409).json({
            success: false,
            message: 'Este número ya está registrado'
          });
        }
      }

      await sender.update({ alias, phoneNumber });

      res.json({
        success: true,
        message: 'Número emisor actualizado exitosamente',
        data: sender
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteSender(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const sender = await WhatsappSender.findByPk(id);

      if (!sender) {
        return res.status(404).json({
          success: false,
          message: 'Número emisor no encontrado'
        });
      }

      if (user.role !== 'super_admin' && sender.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este emisor'
        });
      }

      if (sender.isConnected) {
        await whatsappService.disconnectClient(id);
      }

      await sender.update({
        isActive: false,
        status: 'inactivo',
        isConnected: false,
        qrCode: null
      });

      res.json({
        success: true,
        message: 'Número emisor desactivado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  },

  async initializeWhatsApp(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const sender = await WhatsappSender.findByPk(id);

      if (!sender) {
        return res.status(404).json({
          success: false,
          message: 'Número emisor no encontrado'
        });
      }

      if (user.role !== 'super_admin' && sender.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para conectar este emisor'
        });
      }

      const result = await whatsappService.initializeClient(parseInt(id));

      res.json({
        success: true,
        message: result.message,
        data: sender
      });
    } catch (error) {
      next(error);
    }
  },

  async disconnectWhatsApp(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const sender = await WhatsappSender.findByPk(id);

      if (!sender) {
        return res.status(404).json({
          success: false,
          message: 'Número emisor no encontrado'
        });
      }

      if (user.role !== 'super_admin' && sender.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para desconectar este emisor'
        });
      }

      const result = await whatsappService.disconnectClient(parseInt(id));

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  async getQRCode(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const sender = await WhatsappSender.findByPk(id);

      if (!sender) {
        return res.status(404).json({
          success: false,
          message: 'Número emisor no encontrado'
        });
      }

      if (user.role !== 'super_admin' && sender.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver el QR de este emisor'
        });
      }

      res.json({
        success: true,
        data: {
          qrCode: sender.qrCode,
          status: sender.status,
          isConnected: sender.isConnected
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getConnectionStatus(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const sender = await WhatsappSender.findByPk(id);

      if (!sender) {
        return res.status(404).json({
          success: false,
          message: 'Número emisor no encontrado'
        });
      }

      if (user.role !== 'super_admin' && sender.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver el estado de este emisor'
        });
      }

      const isConnected = whatsappService.isClientConnected(parseInt(id));

      res.json({
        success: true,
        data: {
          isConnected,
          status: sender.status,
          lastConnection: sender.lastConnection
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = senderController;

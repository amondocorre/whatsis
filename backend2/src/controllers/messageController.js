const { MessageCampaign, MessageLog, WhatsappSender } = require('../models');
const { parseExcelFile } = require('../utils/excelParser');
const messageService = require('../services/messageService');
const whatsappService = require('../services/whatsappService');
const { incrementMessageCount } = require('../middlewares/quotaValidator');

const messageController = {
  async uploadExcel(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
      }

      const result = parseExcelFile(req.file.path);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Errores en el archivo Excel',
          errors: result.errors,
          totalRows: result.totalRows,
          validRows: result.validRows
        });
      }

      res.json({
        success: true,
        message: 'Archivo procesado correctamente',
        data: {
          messages: result.data,
          totalRows: result.totalRows,
          validRows: result.validRows
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async createCampaign(req, res, next) {
    try {
      const { name, senderId, messages } = req.body;

      if (!name || !senderId || !messages || !Array.isArray(messages)) {
        return res.status(400).json({
          success: false,
          message: 'Datos incompletos. Se requiere: name, senderId y messages'
        });
      }

      if (messages.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La lista de mensajes está vacía'
        });
      }

      const sender = await WhatsappSender.findByPk(senderId);

      if (!sender) {
        return res.status(404).json({
          success: false,
          message: 'Número emisor no encontrado'
        });
      }

      if (!sender.isConnected) {
        return res.status(400).json({
          success: false,
          message: 'El número emisor no está conectado. Por favor, conéctalo primero.'
        });
      }

      const companyId = req.company ? req.company.id : req.user.companyId;

      const campaign = await messageService.createCampaign(
        req.user.id,
        senderId,
        name,
        messages,
        companyId
      );

      if (req.company && req.company.id) {
        await incrementMessageCount(req.company.id, messages.length);
      }

      res.status(201).json({
        success: true,
        message: 'Campaña creada exitosamente',
        data: campaign
      });
    } catch (error) {
      next(error);
    }
  },

  async sendMessages(req, res, next) {
    try {
      const { campaignId } = req.body;

      if (!campaignId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el ID de la campaña'
        });
      }

      const campaign = await MessageCampaign.findByPk(campaignId);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaña no encontrada'
        });
      }

      if (campaign.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para enviar esta campaña'
        });
      }

      messageService.sendCampaignMessages(campaignId)
        .then(result => {
          console.log('Campaña completada:', result);
        })
        .catch(error => {
          console.error('Error en campaña:', error);
        });

      res.json({
        success: true,
        message: 'Envío de mensajes iniciado. El proceso continuará en segundo plano.',
        data: { campaignId }
      });
    } catch (error) {
      next(error);
    }
  },

  async getCampaigns(req, res, next) {
    try {
      const where = req.user.role === 'admin' ? {} : { userId: req.user.id };

      const campaigns = await MessageCampaign.findAll({
        where,
        include: [
          {
            association: 'sender',
            attributes: ['id', 'alias', 'phoneNumber']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      next(error);
    }
  },

  async getCampaignById(req, res, next) {
    try {
      const { id } = req.params;

      const campaign = await messageService.getCampaignStats(id);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaña no encontrada'
        });
      }

      if (campaign.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver esta campaña'
        });
      }

      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      next(error);
    }
  },

  async getCampaignLogs(req, res, next) {
    try {
      const { id } = req.params;

      const campaign = await MessageCampaign.findByPk(id);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaña no encontrada'
        });
      }

      if (campaign.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver esta campaña'
        });
      }

      const logs = await MessageLog.findAll({
        where: { campaignId: id },
        order: [['createdAt', 'ASC']]
      });

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  },

  async testSendMessage(req, res, next) {
    try {
      const { senderId, phoneNumber, message } = req.body;

      if (!senderId || !phoneNumber || !message) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere: senderId, phoneNumber y message'
        });
      }

      const sender = await WhatsappSender.findByPk(senderId);

      if (!sender) {
        return res.status(404).json({
          success: false,
          message: 'Número emisor no encontrado'
        });
      }

      if (!sender.isConnected) {
        return res.status(400).json({
          success: false,
          message: 'El número emisor no está conectado'
        });
      }

      await whatsappService.sendMessage(senderId, phoneNumber, message);

      res.json({
        success: true,
        message: 'Mensaje de prueba enviado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = messageController;

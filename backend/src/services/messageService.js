const { MessageCampaign, MessageLog, WhatsappSender } = require('../models');
const whatsappService = require('./whatsappService');

class MessageService {
  async createCampaign(userId, senderId, name, messages, companyId = null) {
    try {
      const sender = await WhatsappSender.findByPk(senderId);
      
      if (!sender) {
        throw new Error('Número emisor no encontrado');
      }

      if (!sender.isConnected) {
        throw new Error('El número emisor no está conectado');
      }

      const campaign = await MessageCampaign.create({
        name,
        userId,
        senderId,
        totalMessages: messages.length,
        status: 'pendiente'
      });

      const logsData = messages.map(msg => ({
        campaignId: campaign.id,
        senderId: senderId,
        companyId: companyId,
        phoneNumber: msg.telefono,
        message: msg.mensaje,
        status: 'pendiente'
      }));

      await MessageLog.bulkCreate(logsData);

      return campaign;
    } catch (error) {
      console.error('Error al crear campaña:', error);
      throw error;
    }
  }

  async sendCampaignMessages(campaignId) {
    try {
      const campaign = await MessageCampaign.findByPk(campaignId, {
        include: ['logs', 'sender']
      });

      if (!campaign) {
        throw new Error('Campaña no encontrada');
      }

      if (campaign.status !== 'pendiente') {
        throw new Error('La campaña ya fue procesada');
      }

      await campaign.update({
        status: 'en_proceso',
        startedAt: new Date()
      });

      const pendingLogs = await MessageLog.findAll({
        where: {
          campaignId: campaignId,
          status: 'pendiente'
        }
      });

      let sentCount = 0;
      let failedCount = 0;

      for (const log of pendingLogs) {
        try {
          await whatsappService.sendMessage(
            campaign.senderId,
            log.phoneNumber,
            log.message
          );

          await log.update({
            status: 'enviado',
            sentAt: new Date()
          });

          sentCount++;

          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          await log.update({
            status: 'fallido',
            errorMessage: error.message
          });
          failedCount++;
        }
      }

      await campaign.update({
        status: 'completada',
        sentMessages: sentCount,
        failedMessages: failedCount,
        completedAt: new Date()
      });

      return {
        success: true,
        sentCount,
        failedCount,
        totalMessages: pendingLogs.length
      };

    } catch (error) {
      await MessageCampaign.update(
        { status: 'error' },
        { where: { id: campaignId } }
      );
      console.error('Error al enviar mensajes de campaña:', error);
      throw error;
    }
  }

  async getCampaignStats(campaignId) {
    const campaign = await MessageCampaign.findByPk(campaignId, {
      include: [
        {
          association: 'logs',
          attributes: ['status']
        },
        {
          association: 'sender',
          attributes: ['alias', 'phoneNumber']
        }
      ]
    });

    if (!campaign) {
      throw new Error('Campaña no encontrada');
    }

    return campaign;
  }
}

module.exports = new MessageService();

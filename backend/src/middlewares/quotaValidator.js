const { Company, Plan, WhatsappSender, MessageLog } = require('../models');
const { Op } = require('sequelize');

const quotaValidator = {
  async validateMessageQuota(req, res, next) {
    try {
      const user = req.user;

      if (user.role === 'super_admin') {
        return next();
      }

      if (!user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'Usuario no asociado a ninguna empresa'
        });
      }

      const company = await Company.findByPk(user.companyId, {
        include: [{ model: Plan, as: 'plan' }]
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      if (company.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: `Empresa ${company.status}. Contacte al administrador.`
        });
      }

      const plan = company.plan;
      const messagesUsed = company.messagesUsedMonth;
      const messagesLimit = plan.maxMessagesMonth;

      const messagesToSend = req.body.recipients?.length || 1;

      if (messagesUsed + messagesToSend > messagesLimit) {
        return res.status(403).json({
          success: false,
          message: `Límite de mensajes alcanzado. Usado: ${messagesUsed}/${messagesLimit}`,
          quota: {
            used: messagesUsed,
            limit: messagesLimit,
            remaining: Math.max(0, messagesLimit - messagesUsed)
          }
        });
      }

      req.company = company;
      req.plan = plan;
      next();
    } catch (error) {
      console.error('Error validando cuota de mensajes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error validando límites de envío'
      });
    }
  },

  async validateSenderQuota(req, res, next) {
    try {
      const user = req.user;

      if (user.role === 'super_admin') {
        return next();
      }

      if (!user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'Usuario no asociado a ninguna empresa'
        });
      }

      const company = await Company.findByPk(user.companyId, {
        include: [{ model: Plan, as: 'plan' }]
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      const plan = company.plan;
      const sendersCount = await WhatsappSender.count({
        where: { 
          companyId: user.companyId,
          isActive: true 
        }
      });

      if (sendersCount >= plan.maxSenders) {
        return res.status(403).json({
          success: false,
          message: `Límite de números emisores alcanzado: ${sendersCount}/${plan.maxSenders}`,
          quota: {
            used: sendersCount,
            limit: plan.maxSenders
          }
        });
      }

      req.company = company;
      req.plan = plan;
      next();
    } catch (error) {
      console.error('Error validando cuota de emisores:', error);
      return res.status(500).json({
        success: false,
        message: 'Error validando límites de emisores'
      });
    }
  },

  async incrementMessageCount(companyId, count = 1) {
    try {
      const company = await Company.findByPk(companyId);
      if (company) {
        await company.increment('messagesUsedMonth', { by: count });
      }
    } catch (error) {
      console.error('Error incrementando contador de mensajes:', error);
    }
  }
};

module.exports = quotaValidator;

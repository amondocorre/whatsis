const { Company, Plan, User, MessageLog } = require('../models');
const { Op } = require('sequelize');

const companyController = {
  async getAllCompanies(req, res, next) {
    try {
      const { includeInactive } = req.query;
      const whereClause = includeInactive === 'true' ? {} : { isActive: true };

      const companies = await Company.findAll({
        where: whereClause,
        include: [
          {
            model: Plan,
            as: 'plan',
            attributes: ['id', 'name', 'maxMessagesMonth', 'maxSenders']
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'username', 'email', 'role']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: companies
      });
    } catch (error) {
      next(error);
    }
  },

  async getCompany(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id, {
        include: [
          {
            model: Plan,
            as: 'plan'
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'username', 'email', 'role', 'isActive'],
            required: false
          }
        ]
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const messagesThisMonth = await MessageLog.count({
        where: {
          companyId: id,
          createdAt: {
            [Op.gte]: startOfMonth
          }
        }
      });

      res.json({
        success: true,
        data: {
          ...company.toJSON(),
          messagesThisMonth
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async createCompany(req, res, next) {
    try {
      const { name, planId } = req.body;

      const existingCompany = await Company.findOne({ where: { name } });

      if (existingCompany) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una empresa con ese nombre'
        });
      }

      const plan = await Plan.findByPk(planId);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      const company = await Company.create({
        name,
        planId,
        messagesUsedMonth: 0,
        billingCycleStart: new Date(),
        status: 'active'
      });

      res.status(201).json({
        success: true,
        message: 'Empresa creada exitosamente',
        data: company
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCompany(req, res, next) {
    try {
      const { id } = req.params;
      const { name, planId, status, messagesUsedMonth } = req.body;

      const company = await Company.findByPk(id);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      if (name && name !== company.name) {
        const existingCompany = await Company.findOne({ where: { name } });
        if (existingCompany) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe una empresa con ese nombre'
          });
        }
      }

      if (planId && planId !== company.planId) {
        const plan = await Plan.findByPk(planId);
        if (!plan) {
          return res.status(404).json({
            success: false,
            message: 'Plan no encontrado'
          });
        }
      }

      await company.update({
        name: name || company.name,
        planId: planId || company.planId,
        status: status || company.status,
        messagesUsedMonth: messagesUsedMonth !== undefined ? messagesUsedMonth : company.messagesUsedMonth
      });

      res.json({
        success: true,
        message: 'Empresa actualizada exitosamente',
        data: company
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteCompany(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      const usersCount = await User.count({ where: { companyId: id, isActive: true } });

      if (usersCount > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede desactivar la empresa. ${usersCount} usuario(s) activo(s) asociado(s).`
        });
      }

      await company.update({
        isActive: false,
        status: 'cancelled'
      });

      res.json({
        success: true,
        message: 'Empresa desactivada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  },

  async getCompanyStats(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id, {
        include: [{ model: Plan, as: 'plan' }]
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [totalUsers, activeUsers, totalMessages, messagesThisMonth] = await Promise.all([
        User.count({ where: { companyId: id } }),
        User.count({ where: { companyId: id, isActive: true } }),
        MessageLog.count({ where: { companyId: id } }),
        MessageLog.count({
          where: {
            companyId: id,
            createdAt: { [Op.gte]: startOfMonth }
          }
        })
      ]);

      const plan = company.plan;
      const quotaPercentage = plan.maxMessagesMonth > 0 
        ? (messagesThisMonth / plan.maxMessagesMonth * 100).toFixed(2)
        : 0;

      res.json({
        success: true,
        data: {
          company: {
            id: company.id,
            name: company.name,
            status: company.status
          },
          plan: {
            name: plan.name,
            maxMessagesMonth: plan.maxMessagesMonth,
            maxSenders: plan.maxSenders
          },
          usage: {
            totalUsers,
            activeUsers,
            totalMessages,
            messagesThisMonth,
            messagesRemaining: Math.max(0, plan.maxMessagesMonth - messagesThisMonth),
            quotaPercentage: parseFloat(quotaPercentage)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async resetMonthlyQuota(req, res, next) {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      await company.update({
        messagesUsedMonth: 0,
        billingCycleStart: new Date()
      });

      res.json({
        success: true,
        message: 'Cuota mensual reiniciada exitosamente',
        data: company
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = companyController;

const { Plan, Company } = require('../models');

const planController = {
  async getAllPlans(req, res, next) {
    try {
      const plans = await Plan.findAll({
        where: { isActive: true },
        order: [['maxMessagesMonth', 'ASC']],
        include: [{
          model: Company,
          as: 'companies',
          attributes: ['id', 'name', 'status']
        }]
      });

      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      next(error);
    }
  },

  async getPlan(req, res, next) {
    try {
      const { id } = req.params;

      const plan = await Plan.findByPk(id, {
        include: [{
          model: Company,
          as: 'companies',
          attributes: ['id', 'name', 'status', 'messagesUsedMonth']
        }]
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      next(error);
    }
  },

  async createPlan(req, res, next) {
    try {
      const { name, maxMessagesMonth, maxSenders, features } = req.body;

      const existingPlan = await Plan.findOne({ where: { name } });

      if (existingPlan) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un plan con ese nombre'
        });
      }

      const plan = await Plan.create({
        name,
        maxMessagesMonth,
        maxSenders,
        features: features || {}
      });

      res.status(201).json({
        success: true,
        message: 'Plan creado exitosamente',
        data: plan
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePlan(req, res, next) {
    try {
      const { id } = req.params;
      const { name, maxMessagesMonth, maxSenders, features, isActive } = req.body;

      const plan = await Plan.findByPk(id);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      if (name && name !== plan.name) {
        const existingPlan = await Plan.findOne({ where: { name } });
        if (existingPlan) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un plan con ese nombre'
          });
        }
      }

      await plan.update({
        name: name || plan.name,
        maxMessagesMonth: maxMessagesMonth !== undefined ? maxMessagesMonth : plan.maxMessagesMonth,
        maxSenders: maxSenders !== undefined ? maxSenders : plan.maxSenders,
        features: features !== undefined ? features : plan.features,
        isActive: isActive !== undefined ? isActive : plan.isActive
      });

      res.json({
        success: true,
        message: 'Plan actualizado exitosamente',
        data: plan
      });
    } catch (error) {
      next(error);
    }
  },

  async deletePlan(req, res, next) {
    try {
      const { id } = req.params;

      const plan = await Plan.findByPk(id);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado'
        });
      }

      const companiesCount = await Company.count({ where: { planId: id, isActive: true } });

      if (companiesCount > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar el plan. ${companiesCount} empresa(s) lo están usando.`
        });
      }

      await plan.update({ isActive: false });

      res.json({
        success: true,
        message: 'Plan desactivado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = planController;

const cron = require('node-cron');
const { Company } = require('../models');
const { Op } = require('sequelize');

const resetMonthlyQuotas = () => {
  cron.schedule('0 0 1 * *', async () => {
    try {
      console.log('🔄 Iniciando reinicio de cuotas mensuales...');

      const today = new Date();
      const companies = await Company.findAll({
        where: {
          isActive: true,
          status: 'active'
        }
      });

      let resetCount = 0;

      for (const company of companies) {
        const billingCycleStart = new Date(company.billingCycleStart);
        
        if (billingCycleStart.getDate() === today.getDate()) {
          await company.update({
            messagesUsedMonth: 0,
            billingCycleStart: today
          });
          resetCount++;
          console.log(`✅ Cuota reiniciada para empresa: ${company.name}`);
        }
      }

      console.log(`✅ Reinicio de cuotas completado. ${resetCount} empresa(s) actualizadas.`);
    } catch (error) {
      console.error('❌ Error al reiniciar cuotas mensuales:', error);
    }
  });

  console.log('📅 Job de reinicio de cuotas mensuales programado (día 1 de cada mes a las 00:00)');
};

module.exports = resetMonthlyQuotas;

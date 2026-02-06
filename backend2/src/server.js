const app = require('./app');
const { sequelize, testConnection } = require('./config/database');
const resetMonthlyQuotas = require('./jobs/resetMonthlyQuotas');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados con la base de datos');

    resetMonthlyQuotas();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

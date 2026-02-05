const { sequelize } = require('../config/database');
const { User, WhatsappSender, MessageCampaign, MessageLog } = require('../models');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  try {
    console.log('🔄 Iniciando sincronización de base de datos...');

    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Base de datos sincronizada correctamente');

    const userCount = await User.count();
    
    if (userCount === 0) {
      console.log('📝 Creando usuario administrador por defecto...');
      
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@whatsapp-system.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });

      console.log('✅ Usuario administrador creado:');
      console.log('   Usuario: admin');
      console.log('   Contraseña: admin123');
      console.log('   ⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');
    } else {
      console.log(`ℹ️  Ya existen ${userCount} usuario(s) en la base de datos`);
    }

    console.log('\n📊 Estadísticas de la base de datos:');
    console.log(`   Usuarios: ${await User.count()}`);
    console.log(`   Números emisores: ${await WhatsappSender.count()}`);
    console.log(`   Campañas: ${await MessageCampaign.count()}`);
    console.log(`   Mensajes registrados: ${await MessageLog.count()}`);

    console.log('\n✅ Inicialización completada exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

initDatabase();

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { TABLE_PREFIX } = require('../config/constants');

const WhatsappSender = sequelize.define('WhatsappSender', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  alias: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true,
      isNumeric: true
    }
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: `${TABLE_PREFIX}companies`,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('activo', 'inactivo', 'conectando', 'desconectado'),
    defaultValue: 'inactivo',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  isConnected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastConnection: {
    type: DataTypes.DATE,
    allowNull: true
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sessionData: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: `${TABLE_PREFIX}whatsapp_senders`,
  timestamps: true,
  underscored: true
});

module.exports = WhatsappSender;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { TABLE_PREFIX } = require('../config/constants');

const MessageLog = sequelize.define('MessageLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: `${TABLE_PREFIX}message_campaigns`,
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: `${TABLE_PREFIX}whatsapp_senders`,
      key: 'id'
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
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'enviado', 'fallido'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: `${TABLE_PREFIX}message_logs`,
  timestamps: true
});

module.exports = MessageLog;

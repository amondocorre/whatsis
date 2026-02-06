const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { TABLE_PREFIX } = require('../config/constants');

const MessageCampaign = sequelize.define('MessageCampaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: `${TABLE_PREFIX}users`,
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
  totalMessages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sentMessages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failedMessages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'en_proceso', 'completada', 'cancelada', 'error'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: `${TABLE_PREFIX}message_campaigns`,
  timestamps: true
});

module.exports = MessageCampaign;

const User = require('./User');
const WhatsappSender = require('./WhatsappSender');
const MessageCampaign = require('./MessageCampaign');
const MessageLog = require('./MessageLog');
const Plan = require('./Plan');
const Company = require('./Company');
const { TABLE_PREFIX } = require('../config/constants');

User.hasMany(MessageCampaign, { foreignKey: 'userId', as: 'campaigns', constraints: false });
MessageCampaign.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false, targetKey: 'id' });

WhatsappSender.hasMany(MessageCampaign, { foreignKey: 'senderId', as: 'campaigns', constraints: false });
MessageCampaign.belongsTo(WhatsappSender, { foreignKey: 'senderId', as: 'sender', constraints: false, targetKey: 'id' });

MessageCampaign.hasMany(MessageLog, { foreignKey: 'campaignId', as: 'logs', constraints: false });
MessageLog.belongsTo(MessageCampaign, { foreignKey: 'campaignId', as: 'campaign', constraints: false, targetKey: 'id' });

WhatsappSender.hasMany(MessageLog, { foreignKey: 'senderId', as: 'logs', constraints: false });
MessageLog.belongsTo(WhatsappSender, { foreignKey: 'senderId', as: 'sender', constraints: false, targetKey: 'id' });

Plan.hasMany(Company, { foreignKey: 'planId', as: 'companies', constraints: false });
Company.belongsTo(Plan, { foreignKey: 'planId', as: 'plan', constraints: false, targetKey: 'id' });

Company.hasMany(User, { foreignKey: 'companyId', as: 'users', constraints: false });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company', constraints: false, targetKey: 'id' });

Company.hasMany(WhatsappSender, { foreignKey: 'companyId', as: 'senders', constraints: false });
WhatsappSender.belongsTo(Company, { foreignKey: 'companyId', as: 'company', constraints: false, targetKey: 'id' });

Company.hasMany(MessageLog, { foreignKey: 'companyId', as: 'messageLogs', constraints: false });
MessageLog.belongsTo(Company, { foreignKey: 'companyId', as: 'company', constraints: false, targetKey: 'id' });

module.exports = {
  User,
  WhatsappSender,
  MessageCampaign,
  MessageLog,
  Plan,
  Company
};

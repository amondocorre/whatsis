require('dotenv').config();

const TABLE_PREFIX = process.env.DB_TABLE_PREFIX || 'DD_';

module.exports = {
  TABLE_PREFIX
};

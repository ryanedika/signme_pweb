const Sequelize = require('sequelize');
require('dotenv').config();

const connectionString = process.env.DB_CONNECTION_STRING;
const sequelize = new Sequelize(connectionString);

module.exports = sequelize;

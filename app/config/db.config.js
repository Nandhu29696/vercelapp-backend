const { Sequelize } = require("sequelize");
const fs = require('fs');

module.exports = {
  HOST: 'localhost',
  USER: 'postgres',
  PASSWORD: '1234',
  DB: 'saas_analytics', 
  dialect: 'postgres',
  port: 3307,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}
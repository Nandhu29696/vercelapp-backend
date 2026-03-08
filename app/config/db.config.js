const { Sequelize } = require("sequelize");
const fs = require('fs');

module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_DATABASE, 
  dialect: process.env.DB_DIALECT,
  ssl: true,
  port: 3306,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}
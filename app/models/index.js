const config = require("../config/db.config")
const Sequelize = require("sequelize")

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
)

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

// Models
db.taxonomy = require("./taxonomy.model")(sequelize, Sequelize)
db.spendData = require("./spendData.model")(sequelize, Sequelize)
db.supplierItems = require("./supplierItems.model")(sequelize, Sequelize)

// Association using supplierId
db.taxonomy.hasMany(db.spendData, {
  foreignKey: "supplierId",
  sourceKey: "supplierId",
  as: "spendRecords"
})

db.spendData.belongsTo(db.taxonomy, {
  foreignKey: "supplierId",
  targetKey: "supplierId",
  as: "taxonomy"
})

module.exports = db
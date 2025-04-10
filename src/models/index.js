const dbConfig = require("../config/dbConfig.js");
require('dotenv').config();

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  post: 1521,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  quoteIdentifiers: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});


sequelize
  .authenticate()
  .then(() => {
    console.log("connected..");
  })
  .catch((err) => {
    console.log("Error" + err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.menu = require("./menuModel.js")(sequelize, DataTypes);
db.webUserModel = require("./webUserModel.js")(sequelize, DataTypes);
db.webUserRoleModel = require("./webUserRoleModel.js")(sequelize, DataTypes);
db.manualKpi = require("./kpiModel.js")(sequelize, DataTypes);

db.sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync done!");
});

module.exports = db;

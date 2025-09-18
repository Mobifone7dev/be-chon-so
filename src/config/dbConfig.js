require('dotenv').config();

module.exports = {
  HOST: "10.0.42.2",
  USER: process.env.USER_WEBSITE,
  PASSWORD: process.env.PASSWORD_WEBSITE,
  DB: "DB01",
  dialect: "oracle",

  pool: {
    max: 150,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

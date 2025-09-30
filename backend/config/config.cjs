require("dotenv").config();
module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: { ssl: { require: true } },
    logging: console.log,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: { ssl: { require: true } },
    logging: false,
  },
};

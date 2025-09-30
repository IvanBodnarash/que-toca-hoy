import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

// If there is DATABASE_URL -> work with Postgres (Neon). If not -> with MySQL.
const usePg = !!process.env.DATABASE_URL;

export const sequelize = usePg
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      // Neon вимагає TLS
      dialectOptions: { ssl: { require: true } },
      logging: process.env.NODE_ENV !== "production" ? console.log : false,
      pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_USE_PWD !== "false" ? process.env.DB_PASS : undefined,
      {
        host: process.env.DB_HOST,
        dialect: "mysql",
        port: process.env.DB_PORT || 3306,
        logging: process.env.NODE_ENV !== "production" ? console.log : false,
        pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
      }
    );

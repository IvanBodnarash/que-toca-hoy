// idBuyList, idTask, idMaterial, quantity, unit

import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";

const BuyList = sequelize.define(
  "BuyList",
  {
    idBuyList: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    idTaskDated: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: "tasksdated", key: "idTaskDated" },
      allowNull: false,
    },
    idMaterial: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: "materials", key: "idMaterial" },
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT.UNSIGNED,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(16),
      defaultValue: "ud",
      allowNull: false,
    },
  },
  {
    tableName: "buylists",
    timestamps: true,
    underscored: false,
  }
);

export default BuyList;

// For fields that relate to another entity -> primaryKey : false is not necessary, there is no risk of Sequelize taking it as the primary key by default.

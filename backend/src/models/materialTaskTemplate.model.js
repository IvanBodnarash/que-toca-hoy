// idMaterialTaskTemplate, idMaterial, idTaskTemplate, quantity

import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";

const MaterialTaskTemplate = sequelize.define(
  "MaterialTaskTemplate",
  {
    idMaterialTaskTemplate: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idMaterial: {
      type: DataTypes.INTEGER,
      references: { model: "materials", key: "idMaterial" },
      allowNull: false,
    },
    idTaskTemplate: {
      type: DataTypes.INTEGER,
      references: { model: "tasktemplates", key: "idTaskTemplate" },
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unit: {
      type: DataTypes.ENUM(
        "ud",
        "ml",
        "gr",
        "kg",
        "l",
        "tsp",
        "tbsp",
        "cup",
        "pint",
        "pinch",
        "dash",
        "clove",
        "bunch",
        "slice",
        "handful",
        "can",
        "pack",
        "piece"
      ),
      defaultValue: "ud",
      allowNull: false,
    },
  },
  {
    tableName: "materialtasktemplates",
    timestamps: true,
    underscored: false,
  }
);

export default MaterialTaskTemplate;

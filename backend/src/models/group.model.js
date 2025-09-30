// idGroup, name, image, pin, link

import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";

const Group = sequelize.define(
  "Group",
  {
    idGroup: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    //link: { type: DataTypes.STRING(100), allowNull: true },
    pin: { type: DataTypes.TEXT, allowNull: true }, // We save the bcrypt hash (validation)
    // We save the PIN encrypted with AES (so we can display it)
    pinEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    //image: { type: DataTypes.STRING(255), allowNull: true },
    image: { type: DataTypes.TEXT, allowNull: true }, // base 64
  },
  {
    tableName: "groups",
    timestamps: true,
    underscored: false,
  }
);

export default Group;

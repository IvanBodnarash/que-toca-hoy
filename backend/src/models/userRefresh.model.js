import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";

const UserRefresh = sequelize.define(
  "UserRefresh",
  {
    idUserRefresh: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idUser: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "idUser" },
      allowNull: false,
    },
    refreshToken: { type: DataTypes.TEXT, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    tableName: "userrefresh",
    timestamps: true,
    underscored: false,
    indexes: [
      { fields: ["refreshToken"] },
      { fields: ["idUser"] },
    ],
  }
);

export default UserRefresh;

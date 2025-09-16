// idUserTask, idUser, idTask

import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";

const UserTask = sequelize.define(
  "UserTask",
  {
    idUserTask: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    idUser: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: "users", key: "idUser" },
      allowNull: false,
    },
    idTaskDated: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: "tasksdated", key: "idTaskDated" },
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("todo", "done"),
      allowNull: false,
      defaultValue: "todo",
    },
  },
  {
    tableName: "usertasks",
    timestamps: true,
    underscored: false,
    indexes: [
      { unique: true, fields: ["idUser", "idTaskDated"] },
    ],
  }
);

export default UserTask;

//
import { sequelize } from "../../config/database.js";
import User from "./user.model.js";
import Group from "./group.model.js";
import TaskTemplate from "./taskTemplate.model.js";
import TaskDated from "./taskDated.model.js";
import Material from "./material.model.js";
import MaterialTaskTemplate from "./materialTaskTemplate.model.js";
import BuyList from "./buyList.model.js";
import UserGroup from "./userGroup.model.js";
import UserTask from "./userTask.model.js";
import UserRefresh from "./userRefresh.model.js";

// Relations

// User ↔ Group (muchos a muchos mediante UserGroup)
User.belongsToMany(Group, { through: UserGroup, foreignKey: "idUser" });
Group.belongsToMany(User, { through: UserGroup, foreignKey: "idGroup" });

// User ↔ TaskDated (muchos a muchos mediante UserTask)
User.belongsToMany(TaskDated, { through: UserTask, foreignKey: "idUser" });
TaskDated.belongsToMany(User, { through: UserTask, foreignKey: "idTaskDated" });

// Para poder incluir User desde UserGroup
UserGroup.belongsTo(User, { foreignKey: "idUser" });
User.hasMany(UserGroup, { foreignKey: "idUser" });

// Para poder incluir Group desde UserGroup
UserGroup.belongsTo(Group, { foreignKey: "idGroup" });
Group.hasMany(UserGroup, { foreignKey: "idGroup" });

// Group ↔ TaskDated (1 grupo tiene muchas tareas)
Group.hasMany(TaskDated, { foreignKey: "idGroup" });
TaskDated.belongsTo(Group, { foreignKey: "idGroup" });

// User ↔ TaskDated (muchos a muchos mediante UserTask)
User.belongsToMany(TaskDated, { through: UserTask, foreignKey: "idUser" });
TaskDated.belongsToMany(User, { through: UserTask, foreignKey: "idTaskDated" });

// TaskDated ↔ UserTask hasMany/belongsTo
TaskDated.hasMany(UserTask, {
  foreignKey: "idTaskDated",
  onDelete: "CASCADE",
  hooks: true,
  constraints: true,
});
UserTask.belongsTo(TaskDated, { foreignKey: "idTaskDated" });

// TaskTemplate ↔ TaskDated (1 plantilla tiene muchas tareas)
TaskTemplate.hasMany(TaskDated, { foreignKey: "idTaskTemplate" });
TaskDated.belongsTo(TaskTemplate, { foreignKey: "idTaskTemplate" });

// TaskTemplate ↔ Group (1 grupo tiene muchas plantillas)
Group.hasMany(TaskTemplate, { foreignKey: "idGroup" });
TaskTemplate.belongsTo(Group, { foreignKey: "idGroup" });

// Material ↔ BuyList (1 material puede estar en muchas listas de compra)
Material.hasMany(BuyList, { foreignKey: "idMaterial" });
BuyList.belongsTo(Material, { foreignKey: "idMaterial" });

// TaskDated ↔ BuyList (1 tarea puede tener muchos items de compra)
TaskDated.hasMany(BuyList, { foreignKey: "idTaskDated" });
BuyList.belongsTo(TaskDated, { foreignKey: "idTaskDated" });

// Si MaterialTask es puente entre Material y TaskTemplate:
Material.belongsToMany(TaskTemplate, {
  through: MaterialTaskTemplate,
  foreignKey: "idMaterial",
});
TaskTemplate.belongsToMany(Material, {
  through: MaterialTaskTemplate,
  foreignKey: "idTaskTemplate",
});

// User ↔ Refresh (1 a muchos )
User.hasMany(UserRefresh, { foreignKey: "idUser" });
UserRefresh.belongsTo(User, { foreignKey: "idUser" });

export {
  sequelize,
  User,
  Group,
  TaskTemplate,
  TaskDated,
  Material,
  MaterialTaskTemplate,
  BuyList,
  UserGroup,
  UserTask,
  UserRefresh,
};

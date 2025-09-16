// idTask, idGroup, idTaskTemplate, startDate, endDate, status, frequency

import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js'

const TaskDated = sequelize.define('TaskDated', {
  idTaskDated: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  /*idUser: {
    type: DataTypes.INTEGER.UNSIGNED,
    references: { model: 'users', key: 'idUser' },
    allowNull: false
  },*/
  idGroup: {
    type: DataTypes.INTEGER.UNSIGNED,
    references: { model: 'groups', key: 'idGroup' },
    allowNull: false
  },
  idTaskTemplate: {
    type: DataTypes.INTEGER.UNSIGNED,
    references: { model: 'tasktemplates', key: 'idTaskTemplate' },
    allowNull: false
  },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('done', 'todo'), defaultValue: 'todo', allowNull: false },
  frequency: { type: DataTypes.ENUM('none', 'daily', 'weekly', 'monthly'), defaultValue: 'none', allowNull: false }, //modifique el defaultValue: 'todo' a 'none'
  rotative: { type: DataTypes.BOOLEAN, defaultValue: 0, allowNull: false} // true = se rota entre los del piso, false = solo para este usuario
}, {
  tableName: 'tasksdated',
  timestamps: true,
  underscored: false
});

export default TaskDated;
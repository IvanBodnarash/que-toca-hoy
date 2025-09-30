// idTaskTemplate, name, steps, idGroup

import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js'


const TaskTemplate = sequelize.define('TaskTemplate', {
  idTaskTemplate: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  steps: { type: DataTypes.JSON, allowNull: false },
  idGroup: {
    type: DataTypes.INTEGER,
    references: { model: 'groups', key: 'idGroup' },
    allowNull: false
  },
  type: { type: DataTypes.ENUM('task', 'recipe'), defaultValue: 'task', allowNull: false }
}, {
  tableName: 'tasktemplates',
  timestamps: false,
  underscored: false
});


export default TaskTemplate;
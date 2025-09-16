// idUserGroup, idUser, idGroup

import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const UserGroup = sequelize.define('UserGroup', {
  idUserGroup: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  idUser: {
    type: DataTypes.INTEGER.UNSIGNED,
    references: { model: 'users', key: 'idUser' },
    allowNull: false
  },
  idGroup: {
    type: DataTypes.INTEGER.UNSIGNED,
    references: { model: 'groups', key: 'idGroup' },
    allowNull: false
  }
}, {
  tableName: 'usergroups',
  timestamps: true,
  underscored: false
});

export default UserGroup;

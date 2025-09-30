// idUserGroup, idUser, idGroup

import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const UserGroup = sequelize.define('UserGroup', {
  idUserGroup: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  idUser: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'idUser' },
    allowNull: false
  },
  idGroup: {
    type: DataTypes.INTEGER,
    references: { model: 'groups', key: 'idGroup' },
    allowNull: false
  }
}, {
  tableName: 'usergroups',
  timestamps: true,
  underscored: false
});

export default UserGroup;

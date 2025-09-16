// idUser, name, image, password, email, username

import { DataTypes } from 'sequelize';
import {sequelize} from '../../config/database.js'

const User = sequelize.define('User', {
  idUser: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(100), allowNull: false },
  // image: { type: DataTypes.STRING(255), allowNull: true },
  image: { type: DataTypes.TEXT("long"), allowNull: true }, // base 64
  color: { type: DataTypes.STRING(255), defaultValue: "#ffffff" }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: false
});

export default User;

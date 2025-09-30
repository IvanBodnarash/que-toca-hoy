// idMaterial, name, asssumed

import { DataTypes } from 'sequelize';
import {sequelize} from '../../config/database.js'

const Material = sequelize.define('Material', {
    idMaterial: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    assumed: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false}
}, {
    tableName: 'materials',
    timestamps: true,
    underscored: false
});

export default Material;
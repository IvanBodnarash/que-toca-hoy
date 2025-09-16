// idMaterialTaskTemplate, idMaterial, idTaskTemplate, quantity

import { DataTypes } from 'sequelize';
import {sequelize} from '../../config/database.js'

const MaterialTaskTemplate = sequelize.define('MaterialTaskTemplate', {
    idMaterialTaskTemplate: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    idMaterial: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: { model: 'materials', key: 'idMaterial' },
        allowNull: false
    },
    idTaskTemplate: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: { model: 'tasktemplates', key: 'idTaskTemplate' },
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT.UNSIGNED,
        allowNull: false,
    },
    unit:{
        type: DataTypes.ENUM('ud', 'ml', 'gr'), 
        defaultValue: 'ud',
        allowNull: false
    }
}, {
    tableName: 'materialtasktemplates',
    timestamps: true,
    underscored: false
});

export default MaterialTaskTemplate;


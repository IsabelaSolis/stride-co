const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const Permission = sequelize.define('Permission', {
    key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            // convencion recurso:accion:alcance  ->  orders:read:own
            is: {
                args: /^[a-zA-Z]+:(create|read|update|delete):(own|any)$/,
                msg: 'key must follow resource:action:possession (e.g. orders:read:own)'
            }
        }
    },
    description: { type: DataTypes.STRING(255) }
}, {
    tableName: 'permissions',
    timestamps: true
});

module.exports = Permission;
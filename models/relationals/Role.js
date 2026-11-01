const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const Role = sequelize.define('Role', {
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true, len: [2, 50] }
    },
    description: { type: DataTypes.STRING(255) }
}, {
    tableName: 'roles',
    timestamps: true
});

module.exports = Role;
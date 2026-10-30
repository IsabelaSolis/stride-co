const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const Inventory = sequelize.define('Inventory', {
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { isInt: true, min: 0 }
    },
    reserved: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { isInt: true, min: 0 }
    }
}, {
    tableName: 'inventory',
    createdAt: false, // el diagrama solo tiene updated_at
    updatedAt: 'updated_at',
    validate: {
        reservedNotGreaterThanStock() {
            if (this.reserved > this.stock) {
                throw new Error('reserved cannot be greater than stock');
            }
        }
    }
});

module.exports = Inventory;
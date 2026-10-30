const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const ProductVariant = sequelize.define('ProductVariant', {
    sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true }
    },
    size: { type: DataTypes.STRING(20) },
    color: { type: DataTypes.STRING(30) },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'product_variants',
    timestamps: false
});

module.exports = ProductVariant;
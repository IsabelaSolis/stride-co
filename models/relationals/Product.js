const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 150] }
    },
    description: { type: DataTypes.TEXT },
    brand: { type: DataTypes.STRING(100) },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { isDecimal: true, min: 0 },
        // PostgreSQL devuelve DECIMAL como texto; se entrega como numero
        get() {
            const value = this.getDataValue('price');
            return value === null ? null : Number(value);
        }
    },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'products',
    timestamps: true // -> created_at y updated_at
});

module.exports = Product;
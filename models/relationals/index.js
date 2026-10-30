const sequelize = require ('../../config/sequelize');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const Inventory = require('./Inventory');
//Users -> Roles
User.belongsTo(Role, {foreignKey: 'role_id', as:'role' });
Role.hasMany(User, {foreignKey:'role_id', as:'users'});
//Role <--> permission
Role.belongsToMany(Permission, {
    through: 'role_permissions', //cual tabla hace la relacion, el nombre de la tabla intermedia
    foreignKey: 'role_id',
    otherKey: 'permission_id', //la otra llave foranea
    as:'permissions',
    timestamps: false
});
//permission <-->roles
Permission.belongsToMany(Role,{
    through: 'role_permissions', //cual tabla hace la relacion, el nombre de la tabla intermedia
    foreignKey: 'permission_id',
    otherKey: 'role_id',
    as: 'roles',
    timestamps: false
});

//Product -> ProductVariant (un producto tiene muchas variantes)
Product.hasMany(ProductVariant, { 
    foreignKey: { name: 'product_id', allowNull: false }, as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { 
    foreignKey: { name: 'product_id', allowNull: false }, as: 'product' });
//ProductVariant -> Inventory (1:1)
ProductVariant.hasOne(Inventory, { 
    foreignKey: { name: 'variant_id', allowNull: false, unique: true }, as: 'inventory', onDelete: 'CASCADE' });
Inventory.belongsTo(ProductVariant, { 
    foreignKey: { name: 'variant_id', allowNull: false, unique: true }, as: 'variant' });

module.exports = { sequelize, User, Role, Permission, Product, ProductVariant, Inventory };
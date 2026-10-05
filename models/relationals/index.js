const sequelize = require ('../../config/sequelize');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
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

module.exports = { sequelize, User, Role, Permission };
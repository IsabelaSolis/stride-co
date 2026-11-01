const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const User = sequelize.define('User', {
    first_name: { type: DataTypes.STRING(100), allowNull:false, validate: { notEmpty: true, len: [1, 100] } },
    last_name: { type: DataTypes.STRING(100), allowNull:false, validate: { notEmpty: true, len: [1, 100] } },
    email: { type: DataTypes.STRING(150), allowNull:false, unique: true, validate: { isEmail: true } },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    password: { type: DataTypes.STRING(100), allowNull: false },
    salt_key: { type: DataTypes.STRING(100), allowNull: false }
}, {
    tableName: 'users',
    timestamps: true // -> created_at y updated_at
});
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.salt_key;
  return values;
};
module.exports = User;
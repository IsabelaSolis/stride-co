const { Sequelize } = require('sequelize');
const config = require('config');
const sqlConfig = config.get('sql');

const options = {
    dialect: sqlConfig.dialect,
    logging: false,
    define: {
        // createdAt -> created_at, roleId -> role_id
        underscored: true
    }
};

// En produccion la conexion llega como URI (secreto); en desarrollo, por campos.
const sequelize = sqlConfig.uri
    ? new Sequelize(sqlConfig.uri, options)
    : new Sequelize(sqlConfig.database, sqlConfig.user, sqlConfig.password, {
        ...options,
        host: sqlConfig.host,
        port: sqlConfig.port
    });

module.exports = sequelize;
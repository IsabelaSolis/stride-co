const { Sequelize } = require('sequelize');
const config = require('config');
const mysqlConfig =config.get("mysql");
//conexion a mysql

const sequelize = new Sequelize(
    //NOMBRE DE LA BASE DE DATOS
    mysqlConfig.database,
    //usuario de la base de datos 
    mysqlConfig.user,
    // Password de la base de datos
    mysqlConfig.password,
    {
        // host define la dirección del servidor de la base datos
        host: mysqlConfig.host,
        // port El puerto en el que atiende nuestro servidor de base de datos.
        port: mysqlConfig.port,
        // dialect Es la propiedad donde definimos la base de datos especificamente que vamos a usar.
        dialect: 'mysql',
        logging: false,
        define: {
            // Nos permite definir si queremos agregar automaticamente a nuestros modelos la propiedades

            underscored: true
        }
    }
);
console.log("app conectada a " + mysqlConfig.database)
module.exports=sequelize;
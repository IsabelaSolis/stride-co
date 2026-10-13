const { Sequelize } = require('sequelize');
//conexion a mysql

const sequelize = new Sequelize(
    //NOMBRE DE LA BASE DE DATOS
    'stride_co',
    //usuario de la base de datos 
    'root',
    // Password de la base de datos
    'abcd1234',
    {
        // host: define la dirección del servidor de la base datos
        host: 'localhost',
        // port: El puerto en el que atiende nuestro servidor de base de datos.
        port: 3306,
        // dialect: Es la propiedad donde definimos la base de datos especificamente que vamos a usar.
        dialect: 'mysql',
        logging: false,
        define: {
            // Nos permite definir si queremos agregar automaticamente a nuestros modelos la propiedades
            // createdAt -> created_at, roleId -> role_id
            underscored: true
        }
    }
);
module.exports=sequelize;
const mongoose = require('mongoose');
const config = require('config');

// Conexión a mongodb a partir de Mongoose
function connectMongo(){
    return mongoose.connect(config.get('mongo.uri'));
}

module.exports = connectMongo;
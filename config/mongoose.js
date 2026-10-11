const mongoose = require('mongoose');

// Conexión a mongodb a partir de Mongoose
function connectMongo(){
    const uri = "mongodb://localhost:27017/stride_co";
    return mongoose.connect(uri);
}

module.exports = connectMongo;
const sequelize = require('./sequelize');

// sequelize.sync() crea las tablas que faltan, pero NO agrega columnas nuevas a tablas
// que ya existen (por ejemplo la base de Render). Aqui van esos cambios, de forma idempotente.
async function ensureSchema() {
  await sequelize.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(50)');
}

module.exports = ensureSchema;
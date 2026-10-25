const { sequelize, User, Role, Permission } = require('../models/relationals');
const { hashPassword } = require('../utils/password');

const permissions = [
  { key: 'products:read:any',   description: 'Consultar cualquier producto' },
  { key: 'products:create:any', description: 'Crear productos' },
  { key: 'products:update:any', description: 'Actualizar cualquier producto' },
  { key: 'products:delete:any', description: 'Eliminar cualquier producto' },
  { key: 'orders:create:any',   description: 'Crear ordenes' },
  { key: 'orders:read:own',     description: 'Consultar ordenes propias' },
  { key: 'orders:read:any',     description: 'Consultar cualquier orden' },
  { key: 'orders:update:own',   description: 'Actualizar ordenes propias' },
  { key: 'users:read:any',      description: 'Consultar cualquier usuario' }
];

// Matriz RBAC: rol -> permisos
const roles = {
  admin: permissions.map((p) => p.key),
  sales: ['products:read:any', 'orders:create:any', 'orders:read:own', 'orders:read:any', 'orders:update:own'],
  user: ['products:read:any', 'orders:create:any', 'orders:read:own', 'orders:update:own']
};

// Un usuario de prueba por rol (contrasena: Password123)
const users = [
  { first_name: 'Admin', last_name: 'Stride', email: 'admin@stride.com', role: 'admin' },
  { first_name: 'Sales', last_name: 'Stride', email: 'sales@stride.com', role: 'sales' },
  { first_name: 'User', last_name: 'Stride', email: 'user@stride.com', role: 'user' }
];

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  for (const p of permissions) {
    await Permission.findOrCreate({ where: { key: p.key }, defaults: p });
  }

  const roleByName = {};
  for (const [name, keys] of Object.entries(roles)) {
    const [role] = await Role.findOrCreate({
      where: { name },
      defaults: { description: `Rol ${name}` }
    });
    const perms = await Permission.findAll({ where: { key: keys } });
    await role.setPermissions(perms);
    roleByName[name] = role;
  }

  const pwd = await hashPassword('Password123');
  for (const u of users) {
    await User.findOrCreate({
      where: { email: u.email },
      defaults: {
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        password: pwd.securePassword,
        salt_key: pwd.saltKey,
        role_id: roleByName[u.role].id
      }
    });
  }

  console.log('Seed RBAC completado: 9 permisos, 3 roles, 3 usuarios de prueba');
  await sequelize.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
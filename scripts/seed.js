// Datos iniciales: roles, permisos (matriz RBAC), usuarios de demostracion y datos de ejemplo.
// Se puede ejecutar varias veces sin duplicar datos:  npm run seed
const mongoose = require('mongoose');
const connectMongo = require('../config/mongoose');
const {
  sequelize, User, Role, Permission,Product, ProductVariant, Inventory
} = require('../models/relationals');
const { Customer, Order } = require('../models/documents');
const { hashPassword } = require('../utils/password');

// Matriz RBAC: Permission.key -> roles que lo tienen
const matrix = {
  'users:create:any': ['admin'],
  'users:read:any': ['admin'],
  'users:update:any': ['admin'],
  'users:delete:any': ['admin'],

  'roles:create:any': ['admin'],
  'roles:read:any': ['admin'],
  'roles:update:any': ['admin'],
  'roles:delete:any': ['admin'],

  'permissions:create:any': ['admin'],
  'permissions:read:any': ['admin'],
  'permissions:update:any': ['admin'],
  'permissions:delete:any': ['admin'],

  'rolePermissions:create:any': ['admin'],
  'rolePermissions:read:any': ['admin'],
  'rolePermissions:delete:any': ['admin'],

  'products:create:any': ['admin'],
  'products:read:any': ['admin', 'sales', 'user'],
  'products:update:any': ['admin'],
  'products:delete:any': ['admin'],

  'variants:create:any': ['admin'],
  'variants:read:any': ['admin', 'sales', 'user'],
  'variants:update:any': ['admin'],
  'variants:delete:any': ['admin'],

  'inventory:create:any': ['admin'],
  'inventory:read:any': ['admin', 'sales'],
  'inventory:update:any': ['admin'],
  'inventory:delete:any': ['admin'],

  'customers:create:any': ['admin', 'sales'],
  'customers:read:any': ['admin', 'sales'],
  'customers:update:any': ['admin', 'sales'],
  'customers:delete:any': ['admin'],

  'orders:create:any': ['admin', 'sales', 'user'],
  'orders:read:own': ['admin', 'sales', 'user'],
  'orders:read:any': ['admin', 'sales'],
  'orders:update:own': ['admin', 'sales', 'user'],
  'orders:update:any': ['admin', 'sales'],
  'orders:delete:any': ['admin']
};

const roleDescriptions = {
  admin: 'Administrador: gestiona todo el sistema',
  sales: 'Ventas: atiende clientes y ordenes',
  user: 'Usuario: consulta productos y gestiona sus propias ordenes'
};

// Usuarios de demostracion (datos ficticios; contrasena documentada en el README)
const DEMO_PASSWORD = 'Password123';
const demoUsers = [
  { first_name: 'Admin', last_name: 'Stride', email: 'admin@stride.com', role: 'admin' },
  { first_name: 'Sales', last_name: 'Stride', email: 'sales@stride.com', role: 'sales' },
  { first_name: 'User', last_name: 'Stride', email: 'user@stride.com', role: 'user' }
];

async function seedRbac() {
  const keys = Object.keys(matrix);
  for (const key of keys) {
    await Permission.findOrCreate({ where: { key }, defaults: { key, description: `Permiso ${key}` } });
  }

  const roleByName = {};
  for (const name of Object.keys(roleDescriptions)) {
    const [role] = await Role.findOrCreate({ where: { name }, defaults: { name, description: roleDescriptions[name] } });
    const roleKeys = keys.filter((key) => matrix[key].includes(name));
    const permissions = await Permission.findAll({ where: { key: roleKeys } });
    await role.setPermissions(permissions);
    roleByName[name] = role;
  }

  const passwordData = await hashPassword(DEMO_PASSWORD);
  const userByRole = {};
  for (const demo of demoUsers) {
    const [user] = await User.findOrCreate({
      where: { email: demo.email },
      defaults: {
        first_name: demo.first_name,
        last_name: demo.last_name,
        email: demo.email,
        password: passwordData.securePassword,
        salt_key: passwordData.saltKey,
        role_id: roleByName[demo.role].id
      }
    });
    userByRole[demo.role] = user;
  }
  return userByRole;
}

async function seedCatalog() {
  const catalog = [
    { name: 'Tenis Runner', brand: 'Stride', price: 1299.9, variants: [
      { sku: 'RUN-27-NEG', size: '27', color: 'negro', stock: 15 },
      { sku: 'RUN-28-BLA', size: '28', color: 'blanco', stock: 8 }
    ] },
    { name: 'Botas Urbanas', brand: 'Stride', price: 1899, variants: [
      { sku: 'BOT-26-CAF', size: '26', color: 'cafe', stock: 5 }
    ] },
    { name: 'Playera Basica', brand: 'Stride', price: 299.5,variants: [
      { sku: 'PLA-M-AZU', size: 'M', color: 'azul', stock: 40 },
      { sku: 'PLA-L-AZU', size: 'L', color: 'azul', stock: 25 }
    ] }
  ];

  const products = [];
  for (const item of catalog) {
    const [product] = await Product.findOrCreate({
      where: { name: item.name },
      defaults: { name: item.name, brand: item.brand, price: item.price}
    });
    products.push(product);
    for (const v of item.variants) {
      const [variant] = await ProductVariant.findOrCreate({
        where: { sku: v.sku },
        defaults: { sku: v.sku, size: v.size, color: v.color, product_id: product.id }
      });
      await Inventory.findOrCreate({
        where: { variant_id: variant.id },
        defaults: { variant_id: variant.id, stock: v.stock, reserved: 0 }
      });
    }
  }
  return products;
}

async function seedMongo(userByRole, products) {
  const customersData = [
    { userId: userByRole.user.id, phone: '614-555-0101', email: 'ana.perez@example.com', addresses: [
      { type: 'SHIPPING', street: 'Av. Universidad', number: '100', city: 'Chihuahua', state: 'Chihuahua', postalCode: '31000', country: 'MX' }
    ] },
    { userId: userByRole.sales.id, phone: '614-555-0102', email: 'luis.ramos@example.com', addresses: [
      { type: 'BILLING', street: 'Calle Cuarta', number: '45', city: 'Chihuahua', state: 'Chihuahua', postalCode: '31100', country: 'MX' }
    ] }
  ];
  const customers = [];
  for (const data of customersData) {
    customers.push((await Customer.findOne({ email: data.email })) || (await Customer.create(data)));
  }

  // Las ordenes de ejemplo se marcan con la nota "seed" para no duplicarlas
  if (!(await Order.exists({ 'statusHistory.note': 'seed' }))) {
    const makeOrder = (customer, owner, product, quantity) => ({
      customerId: customer._id,
      salesPersonId: owner.id,
      paymentMethod: 'CREDIT_CARD',
      totals: {
        subtotal: (product.price * quantity).toFixed(2),
        shipping: 0,
        discount: 0,
        total: (product.price * quantity).toFixed(2)
      },
      shippingAddress: { street: 'Av. Universidad', number: '100', city: 'Chihuahua', state: 'Chihuahua', postalCode: '31000', country: 'MX' },
      items: [{ productId: product.id, quantity, unitPrice: product.price.toFixed(2) }],
      statusHistory: [{ status: 'PENDING', changedById: owner.id, note: 'seed' }]
    });
    // una orden del usuario "user" y otra del usuario "sales": sirven para probar own y any
    await Order.create(makeOrder(customers[0], userByRole.user, products[0], 1));
    await Order.create(makeOrder(customers[1], userByRole.sales, products[2], 2));
  }
}

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync(); // crea las tablas que falten
  await connectMongo();

  const userByRole = await seedRbac();
  const products = await seedCatalog();
  await seedMongo(userByRole, products);

  console.log(`Seed completado: ${Object.keys(matrix).length} permisos, ${Object.keys(roleDescriptions).length} roles, ` +
    `${demoUsers.length} usuarios de demostracion, catalogo y datos de ejemplo.`);
}

seed()
  .then(() => Promise.all([sequelize.close(), mongoose.disconnect()]))
  .catch(async (err) => {
    console.error(err);
    await Promise.allSettled([sequelize.close(), mongoose.disconnect()]);
    process.exit(1);
  });
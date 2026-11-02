/* global jest */
//cada test llama a relationalsMock(...) en una línea. 
// Si la matriz cambia, se actualiza en un solo lugar.
const jwt = require('jsonwebtoken');
const config = require('config');

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

const ADMIN = 1, SALES = 2, USER = 3, OTHER_USER = 4;

const tokenOf = (userId) =>
  `Bearer ${jwt.sign({ sub: String(userId) }, config.get('jwt.secret'), { algorithm: 'HS256' })}`;

// rroles con los permisos de la matriz (equivale a Role -> role_permissions -> Permission)
const rolesRows = () =>
  ['admin', 'sales', 'user'].map((name, i) => ({
    id: i + 1,
    name,
    permissions: Object.keys(matrix).filter((key) => matrix[key].includes(name)).map((key) => ({ key }))
  }));

const userRows = () => [
  { id: 1, first_name: 'Admin', email: 'admin@stride.com', role_id: 1, active: true },
  { id: 2, first_name: 'Sales', email: 'sales@stride.com', role_id: 2, active: true },
  { id: 3, first_name: 'User', email: 'user@stride.com', role_id: 3, active: true },
  { id: 4, first_name: 'Otro', email: 'otro@stride.com', role_id: 3, active: true }
];

//fakeModel crea un “doble” del modelo,
//  un objeto con los mismos métodos, 
// pero que en vez de ir a la base devuelve datos de una lista que le doy
function fakeModel(rows) {
  const wrap = (row) => ({
    ...row,
    update: async function update(values) { Object.assign(this, values); return this; },
    destroy: async () => undefined
  });
  const find = (id) => rows.find((r) => Number(r.id) === Number(id));
  return {
    findAll: jest.fn(async () => rows.map(wrap)),
    findByPk: jest.fn(async (id) => (find(id) ? wrap(find(id)) : null)),
    findOne: jest.fn(async () => (rows[0] ? wrap(rows[0]) : null)),
    create: jest.fn(async (body) => wrap({ id: 1, ...body })),
    count: jest.fn(async () => rows.length)
  };
}

// Mock de models/relationals: Role y User ya vienen listos para authenticate/authorize
function relationalsMock(overrides = {}) {
  return {
    sequelize: {},
    Category: {},
    Permission: {},
    Product: {},
    ProductVariant: {},
    Inventory: {},
    Role: fakeModel(rolesRows()),
    User: fakeModel(userRows()),
    ...overrides
  };
}

module.exports = { ADMIN, SALES, USER, OTHER_USER, tokenOf, rolesRows, userRows, fakeModel, relationalsMock };
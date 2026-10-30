const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('config');

// Datos equivalentes a las tablas roles / permissions / role_permissions / users
jest.mock('../models/relationals', () => {
  const P = (key) => ({ key });
  const roles = [
    { id: 1, name: 'admin', permissions: [
      'products:read:any', 'products:create:any', 'products:update:any', 'products:delete:any',
      'orders:create:any', 'orders:read:own', 'orders:read:any', 'orders:update:own', 'users:read:any'
    ].map(P) },
    { id: 2, name: 'sales', permissions: [
      'products:read:any', 'orders:create:any', 'orders:read:own', 'orders:read:any', 'orders:update:own'
    ].map(P) },
    { id: 3, name: 'user', permissions: [
      'products:read:any', 'orders:create:any', 'orders:read:own', 'orders:update:own'
    ].map(P) }
  ];
  const users = {
    1: { id: 1, role_id: 1, active: true }, // admin
    2: { id: 2, role_id: 2, active: true }, // sales
    3: { id: 3, role_id: 3, active: true }, // user
    4: { id: 4, role_id: 3, active: true }  // otro user
  };
    const product = { id: 1, name: 'Producto de prueba', update: async () => product, destroy: async () => {} };
  return {
    sequelize: {},
    Permission: {},
    Category: {},
    ProductVariant: {},
    Inventory: {},
    Product: {
      create: async (body) => ({ id: 1, ...body }),
      findAll: async () => [product],
      findByPk: async (id) => (Number(id) === 1 ? product : null)
    },
    Role: {
      findAll: jest.fn(async () => roles),
      findByPk: jest.fn(async (id) => roles.find((r) => r.id === id) || null)
    },
    User: {
      findByPk: jest.fn(async (id) => users[id] || null),
      findAll: jest.fn(async () => Object.values(users))
    }
  };
});

const ORDER_USER3 = 'aaaaaaaaaaaaaaaaaaaaaaaa'; // orden del usuario 3
const ORDER_USER4 = 'bbbbbbbbbbbbbbbbbbbbbbbb'; // orden del usuario 4
jest.mock('../models/documents', () => ({
  Customer: {},
  Order: {
    findById: jest.fn(async (id) => ({
      aaaaaaaaaaaaaaaaaaaaaaaa: { _id: id, salesPersonId: 3 },
      bbbbbbbbbbbbbbbbbbbbbbbb: { _id: id, salesPersonId: 4 }
    }[id] || null)),
    find: jest.fn(() => ({ populate: async () => [] })),
    create: jest.fn(async (b) => b),
    findByIdAndUpdate: jest.fn(async (id, b) => ({ _id: id, ...b }))
  }
}));

const app = require('../app');
const { loadAccessControl, getAccessControl } = require('../rbac/accessControl');

const SECRET = config.get('jwt.secret');
const tokenOf = (userId) => `Bearer ${jwt.sign({ sub: String(userId) }, SECRET, { algorithm: 'HS256' })}`;
const ADMIN = 1, SALES = 2, USER = 3;

beforeAll(async () => { await loadAccessControl(); });

describe('Permisos cargados desde la BD', () => {
  test('se transforman Role/Permission en grants de accesscontrol', () => {
    const ac = getAccessControl();
    expect(ac.can('admin').deleteAny('products').granted).toBe(true);
    expect(ac.can('sales').deleteAny('products').granted).toBe(false);
    expect(ac.can('user').readOwn('orders').granted).toBe(true);
    expect(ac.can('user').readAny('orders').granted).toBe(false);
  });
});

describe('RBAC - acceso permitido / denegado', () => {
  test('ADMIN con products:delete:any -> permitido', async () => {
    const res = await request(app).delete('/api/v1/products/1').set('Authorization', tokenOf(ADMIN));
    expect(res.statusCode).toBe(200);
  });

  test('SALES con products:delete:any -> 403', async () => {
    const res = await request(app).delete('/api/v1/products/1').set('Authorization', tokenOf(SALES));
    expect(res.statusCode).toBe(403);
  });

  test('SALES con products:create:any -> 403', async () => {
    const res = await request(app).post('/api/v1/products').set('Authorization', tokenOf(SALES)).send({});
    expect(res.statusCode).toBe(403);
  });

  test('ADMIN con products:create:any y products:update:any -> permitido', async () => {
    const c = await request(app).post('/api/v1/products').set('Authorization', tokenOf(ADMIN)).send({});
    const u = await request(app).put('/api/v1/products/1').set('Authorization', tokenOf(ADMIN)).send({});
    expect(c.statusCode).toBe(201);
    expect(u.statusCode).toBe(200);
  });

  test('USER con products:read:any -> permitido', async () => {
    const res = await request(app).get('/api/v1/products').set('Authorization', tokenOf(USER));
    expect(res.statusCode).toBe(200);
  });

  test('ADMIN con users:read:any -> permitido; USER -> 403', async () => {
    const ok = await request(app).get('/api/v1/users/').set('Authorization', tokenOf(ADMIN));
    const no = await request(app).get('/api/v1/users/').set('Authorization', tokenOf(USER));
    expect(ok.statusCode).toBe(200);
    expect(no.statusCode).toBe(403);
  });
});

describe('RBAC - alcance own', () => {
  test('USER con orders:read:own sobre orden propia -> permitido', async () => {
    const res = await request(app).get(`/api/v1/orders/${ORDER_USER3}`).set('Authorization', tokenOf(USER));
    expect(res.statusCode).toBe(200);
  });

  test('USER con orders:read:own sobre orden de otro usuario -> 403', async () => {
    const res = await request(app).get(`/api/v1/orders/${ORDER_USER4}`).set('Authorization', tokenOf(USER));
    expect(res.statusCode).toBe(403);
  });

  test('USER con orders:update:own: orden propia permitido, ajena 403', async () => {
    const own = await request(app).put(`/api/v1/orders/${ORDER_USER3}`).set('Authorization', tokenOf(USER)).send({});
    const other = await request(app).put(`/api/v1/orders/${ORDER_USER4}`).set('Authorization', tokenOf(USER)).send({});
    expect(own.statusCode).toBe(200);
    expect(other.statusCode).toBe(403);
  });
});

describe('RBAC - alcance any', () => {
  test('USER sin orders:read:any -> 403 al listar todas las ordenes', async () => {
    const res = await request(app).get('/api/v1/orders').set('Authorization', tokenOf(USER));
    expect(res.statusCode).toBe(403);
  });

  test('SALES con orders:read:any -> permitido (lista y orden de otro)', async () => {
    const list = await request(app).get('/api/v1/orders').set('Authorization', tokenOf(SALES));
    const other = await request(app).get(`/api/v1/orders/${ORDER_USER4}`).set('Authorization', tokenOf(SALES));
    expect(list.statusCode).toBe(200);
    expect(other.statusCode).toBe(200);
  });

  test('USER con orders:create:any -> permitido', async () => {
    const res = await request(app).post('/api/v1/orders').set('Authorization', tokenOf(USER)).send({});
    expect(res.statusCode).toBe(201);
  });
});

describe('401 vs 403', () => {
  test('sin token -> 401 (autenticacion), no 403', async () => {
    const res = await request(app).delete('/api/v1/products/1');
    expect(res.statusCode).toBe(401);
  }, 30000);
});
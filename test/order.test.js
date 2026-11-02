/* global jest */
const request = require('supertest');

jest.mock('../models/relationals', () => require('./helpers/mocks').relationalsMock());
jest.mock('../models/documents', () => {
  const query = (value) => {
    const q = Promise.resolve(value);
    q.populate = () => q;
    return q;
  };
  const order = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', salesPersonId: 3, statusHistory: [],
    set: jest.fn(), save: jest.fn(async () => {})
  });
  return {
    Customer: { exists: jest.fn(async () => true) },
    Order: {
      findById: jest.fn(() => query(order())),
      find: jest.fn(() => query([order()])),
      create: jest.fn(async (body) => ({ _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', ...body })),
      findByIdAndDelete: jest.fn(async () => ({ _id: 'aaaaaaaaaaaaaaaaaaaaaaaa' }))
    }
  };
});

const app = require('../app');
const { loadAccessControl } = require('../rbac/accessControl');
const { tokenOf, ADMIN } = require('./helpers/mocks');

const admin = tokenOf(ADMIN);
const ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const CUSTOMER = 'cccccccccccccccccccccccc';
beforeAll(async () => { await loadAccessControl(); });

describe('API /api/v1/orders', () => {
  test('GET / debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/orders').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:id debe regresar 200', async () => {
    const res = await request(app).get(`/api/v1/orders/${ID}`).set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/orders').set('Authorization', admin)
      .send({ customerId: CUSTOMER });
    expect(res.statusCode).toBe(201);
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put(`/api/v1/orders/${ID}`).set('Authorization', admin)
      .send({ customerId: CUSTOMER });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete(`/api/v1/orders/${ID}`).set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('GET /:id con id mal formado debe regresar 400', async () => {
    const res = await request(app).get('/api/v1/orders/abc').set('Authorization', admin);
    expect(res.statusCode).toBe(400);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/orders-que-no-existe').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
  });
});
/* global jest */
const request = require('supertest');

jest.mock('../models/relationals', () => require('./helpers/mocks').relationalsMock());
jest.mock('../models/documents', () => {
  const doc = () => ({ _id: 'cccccccccccccccccccccccc', set: jest.fn(), save: jest.fn(async () => {}) });
  return {
    Customer: {
      find: jest.fn(() => ({ sort: async () => [doc()] })),
      findById: jest.fn(async () => doc()),
      create: jest.fn(async (body) => ({ _id: 'cccccccccccccccccccccccc', ...body })),
      findByIdAndDelete: jest.fn(async () => ({ _id: 'cccccccccccccccccccccccc' }))
    },
    Order: {}
  };
});

const app = require('../app');
const { loadAccessControl } = require('../rbac/accessControl');
const { tokenOf, ADMIN } = require('./helpers/mocks');

const admin = tokenOf(ADMIN);
const ID = 'cccccccccccccccccccccccc';
beforeAll(async () => { await loadAccessControl(); });

describe('API /api/v1/customers', () => {
  test('GET / debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/customers').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:id debe regresar 200', async () => {
    const res = await request(app).get(`/api/v1/customers/${ID}`).set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/customers').set('Authorization', admin)
      .send({ userId: 3, email: 'a@a.com' });
    expect(res.statusCode).toBe(201);
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put(`/api/v1/customers/${ID}`).set('Authorization', admin)
      .send({ phone: '614-555-0101' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete(`/api/v1/customers/${ID}`).set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('GET /:id con id mal formado debe regresar 400', async () => {
    const res = await request(app).get('/api/v1/customers/abc').set('Authorization', admin);
    expect(res.statusCode).toBe(400);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/customers-que-no-existe').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
  });
});
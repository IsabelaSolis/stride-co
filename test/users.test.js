/* global jest */
const request = require('supertest');

jest.mock('../utils/password', () => ({
  hashPassword: jest.fn(async () => ({ securePassword: 'hash', saltKey: 'salt' })),
  verifyPassword: jest.fn(async () => true)
}));
jest.mock('../models/relationals', () => require('./helpers/mocks').relationalsMock());

const app = require('../app');
const { loadAccessControl } = require('../rbac/accessControl');
const { tokenOf, ADMIN } = require('./helpers/mocks');

const admin = tokenOf(ADMIN);
beforeAll(async () => { await loadAccessControl(); });

describe('API /api/v1/users', () => {
  test('GET / debe regresar 200 y una lista', async () => {
    const res = await request(app).get('/api/v1/users').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('GET /:id debe regresar 200', async () => {
    const res = await request(app).get('/api/v1/users/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/users').set('Authorization', admin)
      .send({ name: 'Ana', lastName: 'Perez', email: 'ana@example.com', roleId: 3, password: 'Password123' });
    expect(res.statusCode).toBe(201);
  });

  test('POST / con contrasena corta debe regresar 400', async () => {
    const res = await request(app).post('/api/v1/users').set('Authorization', admin)
      .send({ name: 'Ana', password: 'abc' });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/users/1').set('Authorization', admin).send({ first_name: 'Ana' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/users/4').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/users-no-existe').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
  });
});
/* global jest */
const request = require('supertest');

// Role ya viene mockeado por defecto con los roles y permisos de la matriz
jest.mock('../models/relationals', () => {
  const { relationalsMock } = require('./helpers/mocks');
  return relationalsMock();
});

const app = require('../app');
const { loadAccessControl } = require('../rbac/accessControl');
const { Role } = require('../models/relationals');
const { tokenOf, ADMIN, SALES } = require('./helpers/mocks');

jest.setTimeout(30000);
const admin = tokenOf(ADMIN);

beforeAll(async () => { await loadAccessControl(); });

describe('API /api/v1/roles', () => {
  test('GET / debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/roles').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:id debe regresar 200 y el rol', async () => {
    const res = await request(app).get('/api/v1/roles/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('admin');
  });

  test('GET /:id inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/roles/999').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /:id con id mal formado debe regresar 400', async () => {
    const res = await request(app).get('/api/v1/roles/abc').set('Authorization', admin);
    expect(res.statusCode).toBe(400);
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/roles').set('Authorization', admin)
      .send({ name: 'manager', description: 'Gerente' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  test('POST / con datos invalidos debe regresar 400', async () => {
    Role.create.mockRejectedValueOnce(Object.assign(new Error('invalid'), {
      name: 'SequelizeValidationError',
      errors: [{ path: 'name', message: 'name cannot be null' }]
    }));
    const res = await request(app).post('/api/v1/roles').set('Authorization', admin).send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.data[0].field).toBe('name');
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/roles/1').set('Authorization', admin)
      .send({ description: 'Actualizado' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/roles/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/roles-que-no-existe').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
  });

  test('Sin token debe regresar 401', async () => {
    const res = await request(app).get('/api/v1/roles');
    expect(res.statusCode).toBe(401);
  });

  test('SALES no puede leer roles (403)', async () => {
    const res = await request(app).get('/api/v1/roles').set('Authorization', tokenOf(SALES));
    expect(res.statusCode).toBe(403);
  });
});
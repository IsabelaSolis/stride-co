/* global jest */
const request = require('supertest');

jest.mock('../models/relationals', () => {
  const { relationalsMock, fakeModel } = require('./helpers/mocks');
  return relationalsMock({
    Permission: fakeModel([{ id: 1, key: 'products:read:any', description: 'Permiso products:read:any' }])
  });
});

const app = require('../app');
const { loadAccessControl } = require('../rbac/accessControl');
const { Permission } = require('../models/relationals');
const { tokenOf, ADMIN, SALES } = require('./helpers/mocks');

jest.setTimeout(30000);
const admin = tokenOf(ADMIN);

beforeAll(async () => { await loadAccessControl(); });

describe('API /api/v1/permissions', () => {
  test('GET / debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/permissions').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:id debe regresar 200 y el permiso', async () => {
    const res = await request(app).get('/api/v1/permissions/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.key).toBe('products:read:any');
  });

  test('GET /:id inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/permissions/999').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /:id con id mal formado debe regresar 400', async () => {
    const res = await request(app).get('/api/v1/permissions/abc').set('Authorization', admin);
    expect(res.statusCode).toBe(400);
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/permissions').set('Authorization', admin)
      .send({ key: 'reports:read:any' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  test('POST / con datos invalidos debe regresar 400', async () => {
    Permission.create.mockRejectedValueOnce(Object.assign(new Error('invalid'), {
      name: 'SequelizeValidationError',
      errors: [{ path: 'key', message: 'key cannot be null' }]
    }));
    const res = await request(app).post('/api/v1/permissions').set('Authorization', admin).send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.data[0].field).toBe('key');
  });

  test('POST / con key repetida debe regresar 400', async () => {
    Permission.create.mockRejectedValueOnce(Object.assign(new Error('duplicated'), {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ path: 'key', message: 'key must be unique' }]
    }));
    const res = await request(app).post('/api/v1/permissions').set('Authorization', admin)
      .send({ key: 'products:read:any' });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/permissions/1').set('Authorization', admin)
      .send({ description: 'Actualizado' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/permissions/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/permissions-que-no-existe').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
  });

  test('Sin token debe regresar 401', async () => {
    const res = await request(app).get('/api/v1/permissions');
    expect(res.statusCode).toBe(401);
  });

  test('SALES no puede leer permisos (403)', async () => {
    const res = await request(app).get('/api/v1/permissions').set('Authorization', tokenOf(SALES));
    expect(res.statusCode).toBe(403);
  });
});
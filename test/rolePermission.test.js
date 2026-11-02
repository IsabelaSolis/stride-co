/* global jest */
const request = require('supertest');

jest.mock('../models/relationals', () => {
  const { relationalsMock, fakeModel, rolesRows } = require('./helpers/mocks');
  const through = {
    create: jest.fn(async (values) => values),
    findAll: jest.fn(async () => [{ role_id: 1, permission_id: 1 }]),
    destroy: jest.fn(async () => 1)
  };
  const Role = { ...fakeModel(rolesRows()), associations: { permissions: { through: { model: through } } } };
  return relationalsMock({ Role });
});

const app = require('../app');
const { loadAccessControl } = require('../rbac/accessControl');
const { tokenOf, ADMIN } = require('./helpers/mocks');

const admin = tokenOf(ADMIN);
beforeAll(async () => { await loadAccessControl(); });

describe('API /api/v1/rolePermissions', () => {
  test('GET / debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/rolePermissions').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:roleId debe regresar 200 y los permisos del rol', async () => {
    const res = await request(app).get('/api/v1/rolePermissions/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/rolePermissions').set('Authorization', admin)
      .send({ roleId: 1, permissionId: 2 });
    expect(res.statusCode).toBe(201);
  });

  test('POST / con ids invalidos debe regresar 400', async () => {
    const res = await request(app).post('/api/v1/rolePermissions').set('Authorization', admin).send({});
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /:roleId/:permissionId debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/rolePermissions/1/2').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/rolePermissions-que-no-existe').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
  });
});
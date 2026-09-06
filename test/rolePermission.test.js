const request = require('supertest');
const app = require('../app');

describe('API /api/v1/rolePermissions', () => {
  test('GET / debe regresar 200', async () => {
    const res = await request(app).get('/api/v1/rolePermissions');
    expect(res.statusCode).toBe(200);
  });

  test('GET /:roleId debe regresar 200', async () => {
    const res = await request(app).get('/api/v1/rolePermissions/1');
    expect(res.statusCode).toBe(200);
  });

  test('POST / debe regresar 201', async () => {
    const res = await request(app).post('/api/v1/rolePermissions').send({ roleId: 1, permissionId: 2 });
    expect(res.statusCode).toBe(201);
  });

  test('DELETE /:roleId/:permissionId debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/rolePermissions/1/2');
    expect(res.statusCode).toBe(200);
  });
});
const request = require('supertest');
const app = require('../app');

describe('API /api/v1/permissions', () => {
  test('GET / debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/permissions');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:id debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/permissions/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/permissions').send({ key: 'CAN_EDIT' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/permissions/1').send({ key: 'CAN_EDIT' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/permissions/1');
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/permissions-que-no-existe');
    expect(res.statusCode).toBe(404);
  });

  test('POST / sin body debe seguir respondiendo de forma controlada', async () => {
    const res = await request(app).post('/api/v1/permissions').send({});
    expect([200, 201, 400]).toContain(res.statusCode);
  });
});
const request = require('supertest');
const app = require('../app');

describe('API /api/v1/roles', () => {
  test('GET / debe regresar 200', async () => {
    const res = await request(app).get('/api/v1/roles');
    expect(res.statusCode).toBe(200);
  });

  test('GET /:id debe regresar 200', async () => {
    const res = await request(app).get('/api/v1/roles/1');
    expect(res.statusCode).toBe(200);
  });

  test('POST / debe regresar 201', async () => {
    const res = await request(app).post('/api/v1/roles').send({ name: 'Admin' });
    expect(res.statusCode).toBe(201);
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/roles/1').send({ name: 'Admin' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/roles/1');
    expect(res.statusCode).toBe(200);
  });
});
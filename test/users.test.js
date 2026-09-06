const request = require('supertest');
const app = require('../app');

describe('API /api/v1/users', () => {
  test('GET / debe regresar 200 y una lista', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('GET /:id debe regresar 200', async () => {
    const res = await request(app).get('/api/v1/users/1');
    expect(res.statusCode).toBe(200);
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/users').send({ first_name: 'Ana' });
    expect(res.statusCode).toBe(201);
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/users/1').send({ first_name: 'Ana' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/users/1');
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/users-no-existe');
    expect(res.statusCode).toBe(404);
  });
});
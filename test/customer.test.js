const request = require('supertest');
const app = require('../app');

describe('API /api/v1/customers', () => {
  test('GET / debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/customers');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:id debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/customers/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/customers').send({ email: 'a@a.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/customers/1').send({ email: 'a@a.com' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/customers/1');
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/customers-que-no-existe');
    expect(res.statusCode).toBe(404);
  });

  test('POST / sin body debe seguir respondiendo de forma controlada', async () => {
    const res = await request(app).post('/api/v1/customers').send({});
    // En esta etapa (mock) no hay validación de negocio todavía,
    // así que documentamos el comportamiento actual: no debe tronar el servidor.
    expect([200, 201, 400]).toContain(res.statusCode);
  });
});
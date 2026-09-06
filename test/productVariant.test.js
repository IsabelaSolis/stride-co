const request = require('supertest');
const app = require('../app');

describe('API /api/v1/variants', () => {
  test('GET / debe regresar 200', async () => {
    const res = await request(app).get('/api/v1/variants');
    expect(res.statusCode).toBe(200);
  });

  test('GET /:id debe regresar 200', async () => {
    const res = await request(app).get('/api/v1/variants/1');
    expect(res.statusCode).toBe(200);
  });

  test('POST / debe regresar 201', async () => {
    const res = await request(app).post('/api/v1/variants').send({ sku: 'ABC123' });
    expect(res.statusCode).toBe(201);
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/variants/1').send({ sku: 'ABC123' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/variants/1');
    expect(res.statusCode).toBe(200);
  });
});
const request = require('supertest');
const app = require('../app');

describe('API /api/v1/products', () => {

  test('GET / debe regresar 200 y una lista', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:id debe regresar 200 y un objeto', async () => {
    const res = await request(app).get('/api/v1/products/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Tenis de prueba', price: 999 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app)
      .put('/api/v1/products/1')
      .send({ name: 'Tenis actualizado' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/products/1');
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/products-que-no-existe');
    expect(res.statusCode).toBe(404);
  });

});
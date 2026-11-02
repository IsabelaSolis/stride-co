/* global jest */
const request = require('supertest');

jest.mock('../models/relationals', () => {
  const { relationalsMock, fakeModel } = require('./helpers/mocks');
  return relationalsMock({
    Product: fakeModel([{ id: 1, name: 'Producto de prueba', price: 999 }])
  });
});

const app = require('../app');
const { loadAccessControl } = require('../rbac/accessControl');
const { Product } = require('../models/relationals');
const { tokenOf, ADMIN, SALES } = require('./helpers/mocks');

jest.setTimeout(30000);
const admin = tokenOf(ADMIN);

beforeAll(async () => { await loadAccessControl(); });

describe('API /api/v1/products', () => {
  test('GET / debe regresar 200 y una lista', async () => {
    const res = await request(app).get('/api/v1/products').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:id debe regresar 200 y el producto', async () => {
    const res = await request(app).get('/api/v1/products/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Producto de prueba');
  });

  test('GET /:id inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/products/999').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /:id con id mal formado debe regresar 400', async () => {
    const res = await request(app).get('/api/v1/products/abc').set('Authorization', admin);
    expect(res.statusCode).toBe(400);
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/products').set('Authorization', admin)
      .send({ name: 'Tenis de prueba', price: 999 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  test('POST / con datos invalidos debe regresar 400', async () => {
    Product.create.mockRejectedValueOnce(Object.assign(new Error('invalid'), {
      name: 'SequelizeValidationError',
      errors: [{ path: 'name', message: 'name cannot be null' }]
    }));
    const res = await request(app).post('/api/v1/products').set('Authorization', admin).send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.data[0].field).toBe('name');
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/products/1').set('Authorization', admin)
      .send({ name: 'Tenis actualizado' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/products/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/products-que-no-existe').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
  });

  test('Sin token debe regresar 401', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.statusCode).toBe(401);
  });

  test('SALES no puede eliminar productos (403)', async () => {
    const res = await request(app).delete('/api/v1/products/1').set('Authorization', tokenOf(SALES));
    expect(res.statusCode).toBe(403);
  });
});
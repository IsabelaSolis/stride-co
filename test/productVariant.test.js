/* global jest */
const request = require('supertest');

jest.mock('../models/relationals', () => {
  const { relationalsMock, fakeModel } = require('./helpers/mocks');
  return relationalsMock({
    ProductVariant: fakeModel([{ id: 1, sku: 'ABC123', size: '27', color: 'negro', product_id: 1 }]),
    Product: fakeModel([{ id: 1, name: 'Producto de prueba', price: 999 }])
  });
});

const app = require('../app');
const { loadAccessControl } = require('../rbac/accessControl');
const { ProductVariant } = require('../models/relationals');
const { tokenOf, ADMIN, SALES } = require('./helpers/mocks');

jest.setTimeout(30000);
const admin = tokenOf(ADMIN);

beforeAll(async () => { await loadAccessControl(); });

describe('API /api/v1/variants', () => {
  test('GET / debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/variants').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:id debe regresar 200 y la variante', async () => {
    const res = await request(app).get('/api/v1/variants/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.sku).toBe('ABC123');
  });

  test('GET /:id inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/variants/999').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /:id con id mal formado debe regresar 400', async () => {
    const res = await request(app).get('/api/v1/variants/abc').set('Authorization', admin);
    expect(res.statusCode).toBe(400);
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/variants').set('Authorization', admin)
      .send({ sku: 'ABC123', product_id: 1 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  test('POST / con datos invalidos debe regresar 400', async () => {
    ProductVariant.create.mockRejectedValueOnce(Object.assign(new Error('invalid'), {
      name: 'SequelizeValidationError',
      errors: [{ path: 'sku', message: 'sku cannot be null' }]
    }));
    const res = await request(app).post('/api/v1/variants').set('Authorization', admin).send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.data[0].field).toBe('sku');
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/variants/1').set('Authorization', admin)
      .send({ sku: 'ABC123' });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/variants/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/variants-que-no-existe').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
  });

  test('Sin token debe regresar 401', async () => {
    const res = await request(app).get('/api/v1/variants');
    expect(res.statusCode).toBe(401);
  });

  test('SALES no puede eliminar variantes (403)', async () => {
    const res = await request(app).delete('/api/v1/variants/1').set('Authorization', tokenOf(SALES));
    expect(res.statusCode).toBe(403);
  });
});
/* global jest */
const request = require('supertest');

jest.mock('../models/relationals', () => {
  const { relationalsMock, fakeModel } = require('./helpers/mocks');
  return relationalsMock({
    Inventory: fakeModel([{ id: 1, variant_id: 1, stock: 10, reserved: 0 }]),
    ProductVariant: fakeModel([{ id: 1, sku: 'ABC123', product_id: 1 }])
  });
});

const app = require('../app');
const { loadAccessControl } = require('../rbac/accessControl');
const { Inventory } = require('../models/relationals');
const { tokenOf, ADMIN, SALES, USER } = require('./helpers/mocks');

jest.setTimeout(30000);
const admin = tokenOf(ADMIN);

beforeAll(async () => { await loadAccessControl(); });

describe('API /api/v1/inventory', () => {
  test('GET / debe regresar 200 y estructura message/data', async () => {
    const res = await request(app).get('/api/v1/inventory').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /:id debe regresar 200 y el registro', async () => {
    const res = await request(app).get('/api/v1/inventory/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.stock).toBe(10);
  });

  test('GET /:id inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/inventory/999').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /:id con id mal formado debe regresar 400', async () => {
    const res = await request(app).get('/api/v1/inventory/abc').set('Authorization', admin);
    expect(res.statusCode).toBe(400);
  });

  test('POST / debe crear y regresar 201', async () => {
    const res = await request(app).post('/api/v1/inventory').set('Authorization', admin)
      .send({ variant_id: 1, stock: 10 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  test('POST / con datos invalidos debe regresar 400', async () => {
    Inventory.create.mockRejectedValueOnce(Object.assign(new Error('invalid'), {
      name: 'SequelizeValidationError',
      errors: [{ path: 'stock', message: 'stock must be >= 0' }]
    }));
    const res = await request(app).post('/api/v1/inventory').set('Authorization', admin).send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.data[0].field).toBe('stock');
  });

  test('PUT /:id debe regresar 200', async () => {
    const res = await request(app).put('/api/v1/inventory/1').set('Authorization', admin)
      .send({ stock: 15 });
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /:id debe regresar 200', async () => {
    const res = await request(app).delete('/api/v1/inventory/1').set('Authorization', admin);
    expect(res.statusCode).toBe(200);
  });

  test('Ruta inexistente debe regresar 404', async () => {
    const res = await request(app).get('/api/v1/inventory-que-no-existe').set('Authorization', admin);
    expect(res.statusCode).toBe(404);
  });

  test('Sin token debe regresar 401', async () => {
    const res = await request(app).get('/api/v1/inventory');
    expect(res.statusCode).toBe(401);
  });

  test('SALES puede leer inventario (200) pero no eliminarlo (403)', async () => {
    const read = await request(app).get('/api/v1/inventory').set('Authorization', tokenOf(SALES));
    const del = await request(app).delete('/api/v1/inventory/1').set('Authorization', tokenOf(SALES));
    expect(read.statusCode).toBe(200);
    expect(del.statusCode).toBe(403);
  });

  test('USER no puede leer inventario (403)', async () => {
    const res = await request(app).get('/api/v1/inventory').set('Authorization', tokenOf(USER));
    expect(res.statusCode).toBe(403);
  });
});
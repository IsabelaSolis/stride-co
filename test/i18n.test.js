/* global jest */
const request = require('supertest');

jest.mock('../models/relationals', () => require('./helpers/mocks').relationalsMock());

const app = require('../app');
const es = require('../locales/es.json');
const en = require('../locales/en.json');

jest.setTimeout(30000);

// Convierte { a: { b: 'x' } } en ['a.b']
const flatKeys = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([key, value]) =>
    (value && typeof value === 'object' ? flatKeys(value, `${prefix}${key}.`) : [`${prefix}${key}`]));

describe('Archivos de idioma', () => {
  test('en.json y es.json tienen exactamente las mismas claves', () => {
    expect(flatKeys(en).sort()).toEqual(flatKeys(es).sort());
  });

  test('ninguna traduccion esta vacia', () => {
    [...flatKeys(en).map((k) => k.split('.').reduce((o, p) => o[p], en)),
      ...flatKeys(es).map((k) => k.split('.').reduce((o, p) => o[p], es))]
      .forEach((text) => expect(String(text).trim()).not.toBe(''));
  });
});

//ruta protegida sin token responde 401 con el mensaej traducido
describe('Deteccion del idioma', () => {
  const get = () => request(app).get('/api/v1/products');

  test('sin ?lang ni Accept-Language responde en el idioma por defecto (en)', async () => {
    const res = await get();
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(en.common.unauthorized);
  });

  test('?lang=es responde en espanol', async () => {
    const res = await request(app).get('/api/v1/products?lang=es');
    expect(res.body.message).toBe(es.common.unauthorized);
  });

  test('Accept-Language: es responde en espanol', async () => {
    const res = await get().set('Accept-Language', 'es');
    expect(res.body.message).toBe(es.common.unauthorized);
  });

  test('Accept-Language: en responde en ingles', async () => {
    const res = await get().set('Accept-Language', 'en');
    expect(res.body.message).toBe(en.common.unauthorized);
  });

  test('la variante regional es-MX se resuelve a es', async () => {
    const res = await get().set('Accept-Language', 'es-MX,es;q=0.9');
    expect(res.body.message).toBe(es.common.unauthorized);
  });

  test('?lang=es-MX se resuelve a es', async () => {
    const res = await request(app).get('/api/v1/products?lang=es-MX');
    expect(res.body.message).toBe(es.common.unauthorized);
  });

  test('un idioma no soportado (fr) responde en el idioma por defecto', async () => {
    const res = await request(app).get('/api/v1/products?lang=fr');
    expect(res.body.message).toBe(en.common.unauthorized);
    const header = await get().set('Accept-Language', 'fr');
    expect(header.body.message).toBe(en.common.unauthorized);
  });

  test('?lang tiene prioridad sobre Accept-Language', async () => {
    const res = await request(app).get('/api/v1/products?lang=en').set('Accept-Language', 'es');
    expect(res.body.message).toBe(en.common.unauthorized);
  });
});

describe('Vistas Pug', () => {
  test('GET /?lang=es muestra la bienvenida en espanol', async () => {
    const res = await request(app).get('/?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Bienvenido');
    expect(res.text).toContain('<html lang="es">');
  });

  test('GET / sin idioma muestra la bienvenida en ingles', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('Welcome');
    expect(res.text).toContain('<html lang="en">');
  });

  test('la pagina de error se muestra traducida', async () => {
    const res = await request(app).get('/ruta-que-no-existe?lang=es');
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain(es.common.notFound);
  });
});
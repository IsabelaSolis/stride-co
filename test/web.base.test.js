const request = require('supertest');
const app = require('../app');
const es = require('../locales/es.json');
const en = require('../locales/en.json');

describe('SSR base: paginas de error y layout', () => {
  test('404 web: HTML en espanol con codigo real y <title>', async () => {
    const res = await request(app).get('/no-existe?lang=es');
    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('<html lang="es">');
    expect(res.text).toContain('<title>404 | Stride-Co</title>');
    expect(res.text).toContain(es.common.notFound);
    expect(res.text).toContain(es.errors.notFound.title);
  });

  test('404 web: HTML en ingles', async () => {
    const res = await request(app).get('/no-existe?lang=en');
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('<html lang="en">');
    expect(res.text).toContain(en.common.notFound);
  });

  test('el idioma elegido con ?lang se conserva en una cookie', async () => {
    const agent = request.agent(app);
    await agent.get('/no-existe?lang=es');
    const res = await agent.get('/no-existe');
    expect(res.text).toContain('<html lang="es">');
  });

  test('el layout incluye selector de idioma y meta description', async () => {
    const res = await request(app).get('/no-existe?lang=en');
    expect(res.text).toContain('href="/no-existe?lang=es"');
    expect(res.text).toContain('<meta name="description"');
  });

  test('la API sigue respondiendo JSON y no HTML', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.statusCode).toBe(401);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  test('es.json y en.json tienen las mismas claves', () => {
    const keys = (obj, prefix = '') =>
      Object.entries(obj).flatMap(([k, v]) =>
        (v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
    expect(keys(es).sort()).toEqual(keys(en).sort());
  });
});
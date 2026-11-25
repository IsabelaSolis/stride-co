const { api, login, auth, waitForApi } = require('./helpers');
const es = require('../../locales/es.json');
const en = require('../../locales/en.json');

describe('E2E - Internacionalizacion (i18n)', () => {
  let token;
  const nonExistentProductId = 999999;

  beforeAll(async () => {
    await waitForApi();
    token = await login('admin');
  }, 95000);

  test('responde en espanol con Accept-Language: es', async () => {
    const res = await api()
      .get(`/api/v1/products/${nonExistentProductId}`)
      .set(auth(token))
      .set('Accept-Language', 'es');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe(es.products.notFound);
  });

  test('responde en espanol con ?lang=es', async () => {
    const res = await api()
      .get(`/api/v1/products/${nonExistentProductId}?lang=es`)
      .set(auth(token));

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe(es.products.notFound);
  });

  test('responde en ingles con Accept-Language: en', async () => {
    const res = await api()
      .get(`/api/v1/products/${nonExistentProductId}`)
      .set(auth(token))
      .set('Accept-Language', 'en');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe(en.products.notFound);
  });

  test('la variante regional es-MX se resuelve a es', async () => {
    // Via header Accept-Language
    const resHeader = await api()
      .get(`/api/v1/products/${nonExistentProductId}`)
      .set(auth(token))
      .set('Accept-Language', 'es-MX,es;q=0.9');

    expect(resHeader.statusCode).toBe(404);
    expect(resHeader.body.message).toBe(es.products.notFound);

    // Via parametro query ?lang=es-MX
    const resQuery = await api()
      .get(`/api/v1/products/${nonExistentProductId}?lang=es-MX`)
      .set(auth(token));

    expect(resQuery.statusCode).toBe(404);
    expect(resQuery.body.message).toBe(es.products.notFound);
  });

  test('un idioma no soportado (fr) responde en el idioma por defecto (en)', async () => {
    // Via header Accept-Language
    const resHeader = await api()
      .get(`/api/v1/products/${nonExistentProductId}`)
      .set(auth(token))
      .set('Accept-Language', 'fr');

    expect(resHeader.statusCode).toBe(404);
    expect(resHeader.body.message).toBe(en.products.notFound);

    // Via parametro query ?lang=fr
    const resQuery = await api()
      .get(`/api/v1/products/${nonExistentProductId}?lang=fr`)
      .set(auth(token));

    expect(resQuery.statusCode).toBe(404);
    expect(resQuery.body.message).toBe(en.products.notFound);
  });

  test('sin ?lang ni Accept-Language responde en el idioma por defecto (en)', async () => {
    const res = await api()
      .get(`/api/v1/products/${nonExistentProductId}`)
      .set(auth(token));

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(en.products.notFound);
  });

  test('?lang tiene prioridad sobre Accept-Language', async () => {
    const res = await api()
      .get(`/api/v1/products/${nonExistentProductId}?lang=es`)
      .set(auth(token))
      .set('Accept-Language', 'en');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(es.products.notFound);
  });

  test('el 401 y el 403 tambien salen traducidos', async () => {
    //401 sin token
    const sinToken = await api().get('/api/v1/products?lang=es');
    expect(sinToken.statusCode).toBe(401);
    expect(sinToken.body.message).toBe(es.common.unauthorized);

    //403 sales no puede consultar usuarios
    const salesToken = await login('sales');
    const denegadoEn = await api()
      .get('/api/v1/users')
      .set(auth(salesToken))
      .set('Accept-Language', 'en');
    expect(denegadoEn.statusCode).toBe(403);
    expect(denegadoEn.body.message).toBe(en.common.forbidden);

    const denegadoEs = await api()
      .get('/api/v1/users')
      .set(auth(salesToken))
      .set('Accept-Language', 'es');
    expect(denegadoEs.statusCode).toBe(403);
    expect(denegadoEs.body.message).toBe(es.common.forbidden);
  });
});
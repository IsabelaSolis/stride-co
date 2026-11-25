const { api, login, auth, waitForApi } = require('./helpers');
const es = require('../../locales/es.json');

// Borra los datos creados y verifica que cada borrado responda 200 (o 404 si la prueba ya lo borro)
async function cleanup(path, ids, token) {
  for (const id of ids) {
    const res = await api().delete(`${path}/${id}`).set(auth(token));
    expect([200, 404]).toContain(res.statusCode);
  }
}

describe('E2E - Productos (/api/v1/products)', () => {
  let adminToken;
  const createdProductIds = [];
  const createdVariantIds = [];

  // esto es el helper para verificar que ninguna respuesta exponga datos sensibles (password o salt_key)
  function assertNoSensitiveFields(body) {
    const raw = JSON.stringify(body || {});
    expect(raw).not.toMatch(/"password"/i);
    expect(raw).not.toMatch(/"salt_key"/i);
  }

  beforeAll(async () => {
    await waitForApi();
    adminToken = await login('admin');
  }, 95000);

  afterAll(async () => {
    await cleanup('/api/v1/variants', createdVariantIds, adminToken);
    await cleanup('/api/v1/products', createdProductIds, adminToken);
  });

  describe('Ciclo completo de vida de un producto (rol ADMIN)', () => {
    let productId;

    test('1. Crear producto (POST /api/v1/products) responde 201 y entrega el recurso creado', async () => {
      const payload = {
        name: 'Zapato E2E Test Runner',
        brand: 'Stride',
        price: 1599.99,
        description: 'Calzado running para pruebas automatizadas',
        active: true
      };

      const res = await api()
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(payload.name);
      expect(res.body.data.brand).toBe(payload.brand);
      expect(res.body.data.price).toBe(payload.price);
      assertNoSensitiveFields(res.body);

      productId = res.body.data.id;
      createdProductIds.push(productId);
    });

    test('2. Consultar producto por id (GET /api/v1/products/:id) responde 200 con el producto correcto', async () => {
      const res = await api()
        .get(`/api/v1/products/${productId}`)
        .set(auth(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.id).toBe(productId);
      expect(res.body.data.name).toBe('Zapato E2E Test Runner');
      assertNoSensitiveFields(res.body);
    });

    test('3. Listar productos (GET /api/v1/products) responde 200 e incluye el producto creado', async () => {
      const res = await api()
        .get('/api/v1/products')
        .set(auth(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);

      const found = res.body.data.some((item) => item.id === productId);
      expect(found).toBe(true);
      assertNoSensitiveFields(res.body);
    });

    test('4. Actualizar producto (PUT /api/v1/products/:id) responde 200 con los campos actualizados', async () => {
      const updatePayload = {
        name: 'Zapato E2E Test Runner Pro',
        price: 1799.50
      };

      const res = await api()
        .put(`/api/v1/products/${productId}`)
        .set(auth(adminToken))
        .send(updatePayload);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.id).toBe(productId);
      expect(res.body.data.name).toBe('Zapato E2E Test Runner Pro');
      expect(res.body.data.price).toBe(1799.50);
      assertNoSensitiveFields(res.body);
    });

    test('5. Eliminar producto (DELETE /api/v1/products/:id) responde 200', async () => {
      const res = await api()
        .delete(`/api/v1/products/${productId}`)
        .set(auth(adminToken));

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      assertNoSensitiveFields(res.body);

      // Remover del listado de limpieza ya que fue eliminado exitosamente
      const idx = createdProductIds.indexOf(productId);
      if (idx !== -1) createdProductIds.splice(idx, 1);
    });

    test('6. Consultar de nuevo tras la eliminacion responde 404', async () => {
      const res = await api()
        .get(`/api/v1/products/${productId}`)
        .set(auth(adminToken));

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
      assertNoSensitiveFields(res.body);
    });
  });

  describe('Relacion de variantes (un producto devuelve sus variantes)', () => {
    test('un producto creado con variantes devuelve la coleccion de variantes asociadas', async () => {
  //esto es para crear producto base
      const prodRes = await api()
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Tenis con Variantes E2E',
          brand: 'Stride',
          price: 999.00
        });

      expect(prodRes.statusCode).toBe(201);
      const testProdId = prodRes.body.data.id;
      createdProductIds.push(testProdId);

      // 2. Crear una variante asociada a ese producto
      const uniqueSku = `VAR-E2E-${Date.now()}`;
      const variantRes = await api()
        .post('/api/v1/variants')
        .set(auth(adminToken))
        .send({
          sku: uniqueSku,
          size: '27',
          color: 'rojo',
          product_id: testProdId
        });

      expect(variantRes.statusCode).toBe(201);
      createdVariantIds.push(variantRes.body.data.id);

      // 3. Consultar el producto y validar que incluye sus variantes
      const getRes = await api()
        .get(`/api/v1/products/${testProdId}`)
        .set(auth(adminToken));

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.data).toHaveProperty('variants');
      expect(Array.isArray(getRes.body.data.variants)).toBe(true);
      expect(getRes.body.data.variants.length).toBeGreaterThanOrEqual(1);

      const createdVariant = getRes.body.data.variants.find((v) => v.sku === uniqueSku);
      expect(createdVariant).toBeDefined();
      expect(createdVariant.size).toBe('27');
      expect(createdVariant.color).toBe('rojo');
      expect(createdVariant.product_id).toBe(testProdId);

      assertNoSensitiveFields(getRes.body);
    });

    test('la consulta al catalogo de productos devuelve variantes en los registros existentes', async () => {
      const listRes = await api()
        .get('/api/v1/products')
        .set(auth(adminToken));

      expect(listRes.statusCode).toBe(200);
      expect(Array.isArray(listRes.body.data)).toBe(true);

      // Al menos uno de los productos existentes tiene variantes (catalogo inicial del seed)
      const itemWithVariants = listRes.body.data.find((p) => Array.isArray(p.variants) && p.variants.length > 0);
      expect(itemWithVariants).toBeDefined();
      expect(itemWithVariants.variants[0]).toHaveProperty('sku');
      assertNoSensitiveFields(listRes.body);
    });
  });

  describe('Validacion de datos incorrectos e IDs mal formados', () => {
    test('datos invalidos al crear responden 400 (nombre vacio o precio negativo)', async () => {
      //caso 1 es de name vacio y precio negativo
      const resInvalid = await api()
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: '',
          price: -100
        });

      expect(resInvalid.statusCode).toBe(400);
      expect(resInvalid.body).toHaveProperty('message');
      assertNoSensitiveFields(resInvalid.body);

      //tipo caso 2 sin nombre ni precio requerido
      const resEmpty = await api()
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({});

      expect(resEmpty.statusCode).toBe(400);
      assertNoSensitiveFields(resEmpty.body);
    });

    test('datos invalidos al actualizar responden 400 (sobre un producto creado por la prueba)', async () => {
      // Se crea un producto propio para no tocar los datos del seed
      const created = await api()
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({ name: 'Producto para update invalido', brand: 'Stride', price: 100 });

      expect(created.statusCode).toBe(201);
      const ownId = created.body.data.id;
      createdProductIds.push(ownId);

      const res = await api()
        .put(`/api/v1/products/${ownId}`)
        .set(auth(adminToken))
        .send({ price: -500 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
      assertNoSensitiveFields(res.body);
    });

    test('id mal formado responde 400 en GET, PUT y DELETE', async () => {
      const malformedId = 'id-no-numerico';

      //get con id mal formado
      const resGet = await api()
        .get(`/api/v1/products/${malformedId}`)
        .set(auth(adminToken))
        .set('Accept-Language', 'es');

      expect(resGet.statusCode).toBe(400);
      expect(resGet.body).toHaveProperty('message');
      expect(resGet.body.message).toBe(es.common.invalidId);
      assertNoSensitiveFields(resGet.body);

      // PUT con id mal formado
      const resPut = await api()
        .put(`/api/v1/products/${malformedId}`)
        .set(auth(adminToken))
        .send({ name: 'Test' });

      expect(resPut.statusCode).toBe(400);
      expect(resPut.body).toHaveProperty('message');
      assertNoSensitiveFields(resPut.body);

      // DELETE con id mal formado
      const resDelete = await api()
        .delete(`/api/v1/products/${malformedId}`)
        .set(auth(adminToken));

      expect(resDelete.statusCode).toBe(400);
      expect(resDelete.body).toHaveProperty('message');
      assertNoSensitiveFields(resDelete.body);
    });
  });

  describe('Seguridad: ninguna respuesta incluye password ni salt_key', () => {
    test('las respuestas de listado y detalle nunca incluyen credenciales ni llaves sensibles', async () => {
      const listRes = await api()
        .get('/api/v1/products')
        .set(auth(adminToken));

      expect(listRes.statusCode).toBe(200);
      assertNoSensitiveFields(listRes.body);

      for (const prod of listRes.body.data) {
        expect(prod).not.toHaveProperty('password');
        expect(prod).not.toHaveProperty('salt_key');
        if (Array.isArray(prod.variants)) {
          for (const variant of prod.variants) {
            expect(variant).not.toHaveProperty('password');
            expect(variant).not.toHaveProperty('salt_key');
          }
        }
      }
    });
  });
});
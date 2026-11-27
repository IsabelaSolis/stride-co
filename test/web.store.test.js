/* global jest */
// F2: inicio y catalogo (vistas). El servicio de productos va simulado: sin base de datos.
jest.mock('../services/product.service', () => ({
  listActive: jest.fn(),
  listCategories: jest.fn(),
  listFeatured: jest.fn(),
  findActiveById: jest.fn()
}));

const request = require('supertest');
const productService = require('../services/product.service');
const app = require('../app');
const es = require('../locales/es.json');
const en = require('../locales/en.json');

const runner = { id: 1, name: 'Stride Runner X', brand: 'Stride-Co', category: 'Running', price: 1899 };
const motion = { id: 2, name: 'Street Motion', brand: 'Stride-Co', category: 'Urbanos', price: 1499 };

const page = (overrides = {}) => ({
  products: [runner, motion], total: 2, page: 1, totalPages: 1, pageSize: 6, ...overrides
});

beforeEach(() => {
  jest.clearAllMocks();
  productService.listFeatured.mockResolvedValue([runner, motion]);
  productService.listActive.mockResolvedValue(page());
  productService.listCategories.mockResolvedValue(['Running', 'Urbanos', 'Training']);
});

describe('F2 GET / (inicio)', () => {
  test('200 HTML en espanol con los destacados en el codigo fuente y <title>', async () => {
    const res = await request(app).get('/?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('<html lang="es">');
    expect(res.text).toContain(`<title>${es.store.home.title} | Stride-Co</title>`);
    expect(res.text).toContain(es.store.home.description);
    expect(res.text).toContain(es.store.home.featured);
    expect(res.text).toContain('Stride Runner X');
    expect(res.text).toContain('Street Motion');
    expect(res.text).toContain('href="/products/1"');
  });

  test('la misma pagina en ingles', async () => {
    const res = await request(app).get('/?lang=en');
    expect(res.text).toContain('<html lang="en">');
    expect(res.text).toContain(en.store.home.featured);
    expect(res.text).toContain(en.store.home.heroLine2);
  });

  test('sin productos muestra el estado vacio', async () => {
    productService.listFeatured.mockResolvedValue([]);
    const res = await request(app).get('/?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain(es.store.catalog.empty);
  });

  test('el menu de la tienda muestra Inicio y Productos', async () => {
    const res = await request(app).get('/?lang=es');
    expect(res.text).toContain('href="/products"');
    expect(res.text).toContain(es.layout.nav.products);
  });

  test('error del servicio -> 500 con la pagina de error (no 200)', async () => {
    productService.listFeatured.mockRejectedValue(new Error('boom'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/?lang=es');
    spy.mockRestore();
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain(es.errors.serverError.title);
  });
});

describe('F2 GET /products (catalogo)', () => {
  test('200 HTML con productos, precios con formato MXN y <title>', async () => {
    const res = await request(app).get('/products?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain(`<title>${es.store.catalog.title} | Stride-Co</title>`);
    expect(res.text).toContain('Stride Runner X');
    expect(res.text).toContain('Street Motion');
    expect(res.text).toMatch(/\$1,899\.00/);
    expect(res.text).toContain('2 productos');
  });

  test('en ingles', async () => {
    const res = await request(app).get('/products?lang=en');
    expect(res.text).toContain('<html lang="en">');
    expect(res.text).toContain(en.store.catalog.allCategories);
    expect(res.text).toContain('2 products');
  });

  test('pasa q, category y page al servicio y conserva los filtros en el formulario', async () => {
    const res = await request(app).get('/products?q=runner&category=Running&page=2');
    expect(productService.listActive).toHaveBeenCalledWith({ q: 'runner', category: 'Running', page: '2' });
    expect(res.text).toContain('value="runner"');
    expect(res.text).toMatch(/<option value="Running" selected>/);
    expect(res.text).toContain('<option value="Urbanos">');
  });

  test('si q viene repetido usa el primero y no truena', async () => {
    const res = await request(app).get('/products?q=a&q=b');
    expect(res.statusCode).toBe(200);
    expect(productService.listActive).toHaveBeenCalledWith(expect.objectContaining({ q: 'a' }));
  });

  test('paginacion: enlaces que conservan los filtros', async () => {
    productService.listActive.mockResolvedValue(page({ page: 2, totalPages: 3 }));
    const res = await request(app).get('/products?q=runner&page=2');
    expect(res.text).toContain('href="/products?q=runner&amp;page=3"');
    expect(res.text).toContain('href="/products?q=runner&amp;page=1"');
    expect(res.text).toContain('class="page-item active"');
  });

  test('una sola pagina: no muestra paginacion', async () => {
    const res = await request(app).get('/products');
    expect(res.text).not.toContain('class="pagination');
  });

  test('sin resultados: 200 con mensaje de lista vacia', async () => {
    productService.listActive.mockResolvedValue(page({ products: [], total: 0 }));
    const res = await request(app).get('/products?q=zzz&lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain(es.store.catalog.empty);
    expect(res.text).toContain(es.store.catalog.clear);
  });

  test('salida escapada: un nombre con HTML no se ejecuta', async () => {
    productService.listActive.mockResolvedValue(
      page({ products: [{ ...runner, name: '<script>alert(1)</script>' }], total: 1 })
    );
    const res = await request(app).get('/products');
    expect(res.text).not.toContain('<script>alert(1)</script>');
    expect(res.text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  test('el HTML nunca contiene password ni salt', async () => {
    const res = await request(app).get('/products');
    expect(res.text.toLowerCase()).not.toContain('salt_key');
    expect(res.text.toLowerCase()).not.toContain('password_hash');
  });
});
describe('F3 GET /products/:id (detalle)', () => {
  const detail = {
    id: 1, name: 'Stride Runner X', brand: 'Stride-Co', category: 'Running', price: 1899,
    description: 'Ligereza y amortiguación para tus kilómetros diarios.',
    inStock: true,
    variants: [
      { id: 11, sku: 'RUN-X-BLK-26', size: '26', color: 'Negro', available: 18 },
      { id: 12, sku: 'RUN-X-BLK-27', size: '27', color: 'Negro', available: 0 }
    ]
  };

  beforeEach(() => {
    productService.findActiveById.mockResolvedValue(detail);
  });

  test('200 HTML con nombre, precio, descripcion y variantes en el codigo fuente', async () => {
    const res = await request(app).get('/products/1?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('<html lang="es">');
    expect(res.text).toContain('Stride Runner X');
    expect(res.text).toMatch(/\$1,899\.00/);
    expect(res.text).toContain('Running / Stride-Co');
    expect(res.text).toContain('Talla 26 · Negro — 18 disponibles');
    expect(res.text).toContain('Talla 27 · Negro — Agotado');
    expect(productService.findActiveById).toHaveBeenCalledWith('1');
  });

  test('<title> y <meta description> salen del producto', async () => {
    const res = await request(app).get('/products/1');
    expect(res.text).toContain('<title>Stride Runner X | Stride-Co</title>');
    expect(res.text).toContain(
      '<meta name="description" content="Ligereza y amortiguación para tus kilómetros diarios.">'
    );
  });

  test('sin descripcion: la meta description usa nombre y marca', async () => {
    productService.findActiveById.mockResolvedValue({ ...detail, description: null });
    const res = await request(app).get('/products/1');
    expect(res.text).toContain('content="Stride Runner X - Stride-Co"');
  });

  test('la misma pagina en ingles', async () => {
    const res = await request(app).get('/products/1?lang=en');
    expect(res.text).toContain('<html lang="en">');
    expect(res.text).toContain('Size 26 · Negro — 18 available');
    expect(res.text).toContain(en.store.detail.back);
  });

  test('producto inexistente o inactivo -> 404 con la pagina de error', async () => {
    productService.findActiveById.mockResolvedValue(null);
    const res = await request(app).get('/products/999?lang=es');
    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain(es.errors.notFound.title);
  });

  test('id que no es numero -> 404 (no 500)', async () => {
    productService.findActiveById.mockResolvedValue(null);
    const res = await request(app).get('/products/abc');
    expect(res.statusCode).toBe(404);
  });

  test('todo agotado: avisa que no hay existencias', async () => {
    productService.findActiveById.mockResolvedValue({
      ...detail, inStock: false, variants: [{ ...detail.variants[1] }]
    });
    const res = await request(app).get('/products/1?lang=es');
    expect(res.text).toContain(es.store.detail.soldOut);
  });

  test('sin variantes: muestra el aviso', async () => {
    productService.findActiveById.mockResolvedValue({ ...detail, inStock: false, variants: [] });
    const res = await request(app).get('/products/1?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain(es.store.detail.noVariants);
  });

  test('salida escapada: la descripcion con HTML no se ejecuta', async () => {
    productService.findActiveById.mockResolvedValue({ ...detail, description: '<img src=x onerror=alert(1)>' });
    const res = await request(app).get('/products/1');
    expect(res.text).not.toContain('<img src=x onerror=alert(1)>');
    expect(res.text).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  test('error del servicio -> 500 con la pagina de error', async () => {
    productService.findActiveById.mockRejectedValue(new Error('boom'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/products/1');
    spy.mockRestore();
    expect(res.statusCode).toBe(500);
  });
});
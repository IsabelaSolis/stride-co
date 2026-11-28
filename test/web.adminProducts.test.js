/* global jest */
// F8: administracion de productos (vistas). Todo con mocks: sin base de datos.
jest.mock('../services/auth.service', () => ({
  authenticate: jest.fn(),
  signToken: jest.fn(() => 'token-falso'),
  verifyToken: jest.fn(() => ({ sub: '1' })),
  findActiveUser: jest.fn()
}));
jest.mock('../services/product.service', () => ({
  ...jest.requireActual('../services/product.service'), // parseProduct y formValues son logica pura
  listAll: jest.fn(),
  listCategories: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
}));
jest.mock('../models/relationals', () => {
  const names = { 1: 'admin', 2: 'sales', 3: 'sinpermisos' };
  return {
    User: {}, Product: {}, ProductVariant: {}, Inventory: {},
    Role: { findByPk: jest.fn(async (id) => ({ id, name: names[id] })) }
  };
});
jest.mock('../rbac/accessControl', () => {
  const { AccessControl } = require('accesscontrol');
  const grants = ['create', 'read', 'update', 'delete'].map((action) => (
    { role: 'admin', resource: 'products', action: `${action}:any`, attributes: '*' }
  ));
  grants.push({ role: 'sales', resource: 'products', action: 'read:any', attributes: '*' });
  const ac = new AccessControl(grants);
  return { getAccessControl: () => ac };
});

const request = require('supertest');
const authService = require('../services/auth.service');
const productService = require('../services/product.service');
const app = require('../app');
const es = require('../locales/es.json');
const en = require('../locales/en.json');

const ROLE_NAMES = { 1: 'admin', 2: 'sales', 3: 'sinpermisos' };
const runner = { id: 1, name: 'Stride Runner X', brand: 'Stride-Co', category: 'Running', price: 1899, active: true, description: 'Ligero' };
const hidden = { id: 2, name: 'Prototipo', brand: null, category: null, price: 99.5, active: false, description: null };

// agente con sesion iniciada para un rol (1 admin, 2 sales, 3 sin permisos)
async function sessionAs(roleId) {
  const user = { id: 1, email: 'demo@stride.com', role_id: roleId, role: { name: ROLE_NAMES[roleId] } };
  authService.authenticate.mockResolvedValue(user);
  authService.findActiveUser.mockResolvedValue(user);
  const agent = request.agent(app);
  await agent.post('/login').type('form').send({ email: 'demo@stride.com', password: 'x' });
  return agent;
}

beforeEach(() => {
  jest.clearAllMocks();
  authService.verifyToken.mockReturnValue({ sub: '1' });
  productService.listAll.mockResolvedValue({ products: [runner, hidden], total: 2, page: 1, totalPages: 1, pageSize: 10 });
  productService.listCategories.mockResolvedValue(['Running', 'Urbanos']);
  productService.findById.mockResolvedValue(runner);
  productService.create.mockResolvedValue(runner);
  productService.update.mockResolvedValue(runner);
  productService.remove.mockResolvedValue(true);
});

describe('F8 acceso y permisos', () => {
  test('sin sesion: todas las rutas redirigen (302) a /login', async () => {
    const list = await request(app).get('/admin/products');
    expect(list.statusCode).toBe(302);
    expect(list.headers.location).toBe('/login?next=%2Fadmin%2Fproducts');
    for (const [method, url] of [['get', '/admin/products/new'], ['post', '/admin/products'],
      ['get', '/admin/products/1/edit'], ['post', '/admin/products/1'], ['post', '/admin/products/1/delete']]) {
      const res = await request(app)[method](url);
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain('/login');
    }
  });

  test('sin el permiso de lectura: 403 con la pagina de error', async () => {
    const agent = await sessionAs(3);
    const res = await agent.get('/admin/products?lang=es');
    expect(res.statusCode).toBe(403);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain(es.errors.forbidden.title);
  });

  test('solo lectura (sales): ve el listado sin botones de crear, editar ni eliminar', async () => {
    const agent = await sessionAs(2);
    const res = await agent.get('/admin/products?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Stride Runner X');
    expect(res.text).not.toContain('href="/admin/products/new"');
    expect(res.text).not.toContain('/edit"');
    expect(res.text).not.toContain('/delete"');
  });

  test('solo lectura: el servidor rechaza crear, editar y eliminar aunque se escriba la URL (403)', async () => {
    const agent = await sessionAs(2);
    for (const [method, url] of [['get', '/admin/products/new'], ['post', '/admin/products'],
      ['get', '/admin/products/1/edit'], ['post', '/admin/products/1'], ['post', '/admin/products/1/delete']]) {
      const res = await agent[method](url).type('form').send({ name: 'Hack', price: '1' });
      expect(res.statusCode).toBe(403);
    }
    expect(productService.create).not.toHaveBeenCalled();
    expect(productService.update).not.toHaveBeenCalled();
    expect(productService.remove).not.toHaveBeenCalled();
  });
});

describe('F8 GET /admin/products (listado)', () => {
  test('admin: 200 HTML con productos, precios, estados y botones, en el codigo fuente', async () => {
    const agent = await sessionAs(1);
    const res = await agent.get('/admin/products?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<html lang="es">');
    expect(res.text).toContain(`<title>${es.admin.products.title} | Stride-Co</title>`);
    expect(res.text).toContain('Stride Runner X');
    expect(res.text).toMatch(/\$1,899\.00/);
    expect(res.text).toContain(es.admin.common.active);
    expect(res.text).toContain(es.admin.common.inactive);
    expect(res.text).toContain('href="/admin/products/new"');
    expect(res.text).toContain('href="/admin/products/1/edit"');
    expect(res.text).toContain('action="/admin/products/1/delete"');
    expect(res.text).toContain('data-confirm=');
  });

  test('el menu del panel muestra Productos y la pagina en ingles', async () => {
    const agent = await sessionAs(1);
    const res = await agent.get('/admin/products?lang=en');
    expect(res.text).toContain(en.admin.nav.products);
    expect(res.text).toContain(en.admin.products.new);
  });

  test('pasa q y page al servicio', async () => {
    const agent = await sessionAs(1);
    await agent.get('/admin/products?q=runner&page=2');
    expect(productService.listAll).toHaveBeenCalledWith({ q: 'runner', page: '2' });
  });

  test('lista vacia: 200 con mensaje', async () => {
    productService.listAll.mockResolvedValue({ products: [], total: 0, page: 1, totalPages: 1, pageSize: 10 });
    const agent = await sessionAs(1);
    const res = await agent.get('/admin/products?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain(es.admin.products.empty);
  });

  test('salida escapada y nunca expone password ni salt', async () => {
    productService.listAll.mockResolvedValue({
      products: [{ ...runner, name: '<script>alert(1)</script>' }], total: 1, page: 1, totalPages: 1, pageSize: 10
    });
    const agent = await sessionAs(1);
    const res = await agent.get('/admin/products');
    expect(res.text).not.toContain('<script>alert(1)</script>');
    expect(res.text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(res.text.toLowerCase()).not.toContain('salt_key');
  });
});

describe('F8 crear producto (PRG)', () => {
  test('GET /admin/products/new: 200 con el formulario vacio y activo marcado', async () => {
    const agent = await sessionAs(1);
    const res = await agent.get('/admin/products/new?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('action="/admin/products"');
    expect(res.text).toContain(es.admin.products.fields.name);
    expect(res.text).toMatch(/<input[^>]*id="active"[^>]*checked/);
  });

  test('datos invalidos: 400, errores por campo traducidos y valores conservados', async () => {
    const agent = await sessionAs(1);
    const res = await agent.post('/admin/products?lang=es').type('form')
      .send({ name: '', brand: 'Mi marca', price: 'abc', description: 'texto largo' });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain(es.admin.products.errors.name.required);
    expect(res.text).toContain(es.admin.products.errors.price.invalid);
    expect(res.text).toContain('value="Mi marca"');
    expect(res.text).toContain('texto largo');
    expect(res.text).toContain('is-invalid');
    expect(productService.create).not.toHaveBeenCalled();
  });

  test('errores tambien en ingles', async () => {
    const agent = await sessionAs(1);
    const res = await agent.post('/admin/products?lang=en').type('form').send({ name: 'A', price: '-5' });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain(en.admin.products.errors.name.tooShort);
    expect(res.text).toContain(en.admin.products.errors.price.invalid);
  });

  test('datos validos: 302 al listado, crea el producto y avisa una sola vez', async () => {
    const agent = await sessionAs(1);
    const res = await agent.post('/admin/products').type('form')
      .send({ name: ' Tenis Nuevo ', brand: 'Stride', category: 'Running', price: '1299.90', active: 'on' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/admin/products');
    expect(productService.create).toHaveBeenCalledWith({
      name: 'Tenis Nuevo', brand: 'Stride', category: 'Running', description: null, price: 1299.9, active: true
    });

    const first = await agent.get('/admin/products?lang=es');
    expect(first.text).toContain(es.admin.products.created);
    const second = await agent.get('/admin/products?lang=es');
    expect(second.text).not.toContain(es.admin.products.created);
  });

  test('casilla activo sin marcar guarda el producto como inactivo', async () => {
    const agent = await sessionAs(1);
    await agent.post('/admin/products').type('form').send({ name: 'Oculto', price: '10' });
    expect(productService.create).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
  });
});

describe('F8 editar producto (PRG)', () => {
  test('GET edit: 200 con los datos del producto', async () => {
    const agent = await sessionAs(1);
    const res = await agent.get('/admin/products/1/edit?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('action="/admin/products/1"');
    expect(res.text).toContain('value="Stride Runner X"');
    expect(res.text).toContain('value="1899"');
    expect(res.text).toContain(es.admin.products.edit);
  });

  test('producto inexistente: 404 en editar, actualizar y eliminar', async () => {
    productService.findById.mockResolvedValue(null);
    const agent = await sessionAs(1);
    expect((await agent.get('/admin/products/99/edit')).statusCode).toBe(404);
    expect((await agent.post('/admin/products/99').type('form').send({ name: 'Algo', price: '1' })).statusCode).toBe(404);
    expect((await agent.post('/admin/products/99/delete')).statusCode).toBe(404);
    expect(productService.update).not.toHaveBeenCalled();
    expect(productService.remove).not.toHaveBeenCalled();
  });

  test('actualizar con datos invalidos: 400 con el formulario de ese producto', async () => {
    const agent = await sessionAs(1);
    const res = await agent.post('/admin/products/1?lang=es').type('form').send({ name: 'Ok', price: '' });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('action="/admin/products/1"');
    expect(res.text).toContain(es.admin.products.errors.price.required);
    expect(productService.update).not.toHaveBeenCalled();
  });

  test('actualizar con datos validos: 302, guarda y avisa', async () => {
    const agent = await sessionAs(1);
    const res = await agent.post('/admin/products/1').type('form').send({ name: 'Runner Pro', price: '2000', active: 'on' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/admin/products');
    expect(productService.update).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Runner Pro', price: 2000 }));
    const page = await agent.get('/admin/products?lang=es');
    expect(page.text).toContain(es.admin.products.updated);
  });

  test('desactivar un producto: active llega en false', async () => {
    const agent = await sessionAs(1);
    await agent.post('/admin/products/1').type('form').send({ name: 'Runner Pro', price: '2000' });
    expect(productService.update).toHaveBeenCalledWith(1, expect.objectContaining({ active: false }));
  });
});

describe('F8 eliminar producto', () => {
  test('302 al listado, elimina y avisa', async () => {
    const agent = await sessionAs(1);
    const res = await agent.post('/admin/products/1/delete');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/admin/products');
    expect(productService.remove).toHaveBeenCalledWith(1);
    const page = await agent.get('/admin/products?lang=es');
    expect(page.text).toContain(es.admin.products.deleted);
  });

  test('error del servicio: 500 con la pagina de error', async () => {
    productService.remove.mockRejectedValue(new Error('boom'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const agent = await sessionAs(1);
    const res = await agent.post('/admin/products/1/delete');
    spy.mockRestore();
    expect(res.statusCode).toBe(500);
  });
});
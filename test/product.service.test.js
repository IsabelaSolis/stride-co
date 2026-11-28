/* global jest */
// Servicio de productos: se simulan los modelos (sin base de datos).
jest.mock('../models/relationals', () => ({
  Product: { count: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn() },
    ProductVariant: {},
  Inventory: {}
}));

const { Op } = require('sequelize');
const { Product } = require('../models/relationals');
const productService = require('../services/product.service');

beforeEach(() => {
  jest.clearAllMocks();
  Product.findAll.mockResolvedValue([]);
});

describe('product.service listActive', () => {
  test('solo productos activos, con busqueda y categoria', async () => {
    Product.count.mockResolvedValue(3);
    await productService.listActive({ q: 'run', category: 'Running' });
    const { where } = Product.findAll.mock.calls[0][0];
    expect(where.active).toBe(true);
    expect(where.category).toBe('Running');
    expect(where[Op.or][0].name[Op.iLike]).toBe('%run%');
  });

  test('escapa % y _ en la busqueda', async () => {
    Product.count.mockResolvedValue(0);
    await productService.listActive({ q: '50%_' });
    const { where } = Product.findAll.mock.calls[0][0];
    expect(where[Op.or][0].name[Op.iLike]).toBe('%50\\%\\_%');
  });

  test('calcula paginas y offset', async () => {
    Product.count.mockResolvedValue(14); // 6 por pagina -> 3 paginas
    const result = await productService.listActive({ page: '2' });
    expect(result).toMatchObject({ total: 14, page: 2, totalPages: 3 });
    expect(Product.findAll.mock.calls[0][0]).toMatchObject({ limit: 6, offset: 6 });
  });

  test('una pagina fuera de rango o invalida se corrige', async () => {
    Product.count.mockResolvedValue(14);
    expect((await productService.listActive({ page: '99' })).page).toBe(3);
    expect((await productService.listActive({ page: 'abc' })).page).toBe(1);
    expect((await productService.listActive({ page: '-4' })).page).toBe(1);
  });
});

describe('product.service listCategories', () => {
  test('regresa solo los nombres de categoria', async () => {
    Product.findAll.mockResolvedValue([{ category: 'Running' }, { category: 'Urbanos' }]);
    expect(await productService.listCategories()).toEqual(['Running', 'Urbanos']);
  });
});
describe('product.service availableOf', () => {
  test('disponible = stock - reserved, nunca menos de 0', () => {
    expect(productService.availableOf({ stock: 20, reserved: 2 })).toBe(18);
    expect(productService.availableOf({ stock: 5, reserved: 5 })).toBe(0);
    expect(productService.availableOf({ stock: 3, reserved: 9 })).toBe(0);
    expect(productService.availableOf(null)).toBe(0);
  });
});

describe('product.service findActiveById', () => {
  const record = (plain) => ({ get: () => plain });

  test('busca solo productos activos y calcula lo disponible por variante', async () => {
    Product.findOne.mockResolvedValue(record({
      id: 1, name: 'Runner', price: 100,
      variants: [
        { id: 11, sku: 'A', size: '26', color: 'Negro', inventory: { stock: 20, reserved: 2 } },
        { id: 12, sku: 'B', size: '27', color: 'Negro', inventory: null }
      ]
    }));
    const product = await productService.findActiveById('1');
    expect(Product.findOne.mock.calls[0][0].where).toEqual({ id: 1, active: true });
    expect(product.variants.map((v) => v.available)).toEqual([18, 0]);
    expect(product.inStock).toBe(true);
    expect(product.variants[0]).not.toHaveProperty('inventory'); // no se expone el inventario crudo
  });

  test('sin existencias en ninguna variante: inStock es false', async () => {
    Product.findOne.mockResolvedValue(record({
      id: 1, variants: [{ id: 11, inventory: { stock: 2, reserved: 2 } }]
    }));
    expect((await productService.findActiveById(1)).inStock).toBe(false);
  });

  test('producto sin variantes', async () => {
    Product.findOne.mockResolvedValue(record({ id: 1 }));
    const product = await productService.findActiveById(1);
    expect(product.variants).toEqual([]);
    expect(product.inStock).toBe(false);
  });

  test('no existe o esta inactivo -> null', async () => {
    Product.findOne.mockResolvedValue(null);
    expect(await productService.findActiveById(5)).toBeNull();
  });

  test('id invalido -> null sin consultar la base', async () => {
    for (const bad of ['abc', '-1', '0', '1.5', undefined, null]) {
      expect(await productService.findActiveById(bad)).toBeNull();
    }
    expect(Product.findOne).not.toHaveBeenCalled();
  });
});

describe('product.service parseProduct (formulario de administracion)', () => {
  const ok = { name: 'Tenis Runner', brand: 'Stride', category: 'Running', price: '1299.90', description: 'Ligero', active: 'on' };

  test('datos validos se normalizan', () => {
    const { data, errors } = productService.parseProduct({ ...ok, name: '  Tenis Runner  ' });
    expect(errors).toEqual({});
    expect(data).toEqual({
      name: 'Tenis Runner', brand: 'Stride', category: 'Running', description: 'Ligero', price: 1299.9, active: true
    });
  });

  test('campos opcionales vacios se guardan como null', () => {
    const { data } = productService.parseProduct({ name: 'Gorra', price: '99' });
    expect(data).toMatchObject({ brand: null, category: null, description: null, active: false });
  });

  test('nombre obligatorio, con minimo 2 y maximo 150 caracteres', () => {
    expect(productService.parseProduct({ ...ok, name: '' }).errors.name).toBe('required');
    expect(productService.parseProduct({ ...ok, name: 'A' }).errors.name).toBe('tooShort');
    expect(productService.parseProduct({ ...ok, name: 'x'.repeat(151) }).errors.name).toBe('tooLong');
  });

  test('precio: obligatorio, sin negativos, letras ni mas de 2 decimales', () => {
    expect(productService.parseProduct({ ...ok, price: '' }).errors.price).toBe('required');
    for (const bad of ['-5', 'abc', '1.999', '1,50', '1e3', '123456789']) {
      expect(productService.parseProduct({ ...ok, price: bad }).errors.price).toBe('invalid');
    }
    for (const good of ['0', '10', '10.5', '99999999.99']) {
      expect(productService.parseProduct({ ...ok, price: good }).errors).toEqual({});
    }
  });

  test('marca, categoria y descripcion respetan su longitud maxima', () => {
    const { errors } = productService.parseProduct({
      ...ok, brand: 'x'.repeat(101), category: 'x'.repeat(51), description: 'x'.repeat(2001)
    });
    expect(errors).toEqual({ brand: 'tooLong', category: 'tooLong', description: 'tooLong' });
  });

  test('conserva lo escrito para volver a mostrarlo y marca activo solo con on / true', () => {
    expect(productService.parseProduct({ ...ok, price: 'abc' }).values.price).toBe('abc');
    expect(productService.parseProduct({ ...ok, active: 'true' }).values.active).toBe(true);
    expect(productService.parseProduct({ ...ok, active: undefined }).values.active).toBe(false);
  });

  test('formValues prepara el formulario de edicion', () => {
    expect(productService.formValues({ name: 'A', brand: null, category: 'Running', price: 99.5, description: null, active: 1 }))
      .toEqual({ name: 'A', brand: '', category: 'Running', price: '99.5', description: '', active: true });
  });
});

describe('product.service administracion (listado, edicion y baja)', () => {
  test('listAll incluye inactivos, busca en nombre, marca y categoria y pagina de 10', async () => {
    Product.count.mockResolvedValue(25);
    const result = await productService.listAll({ q: 'run', page: '2' });
    const args = Product.findAll.mock.calls[0][0];
    expect(args.where.active).toBeUndefined();
    expect(args.where[Op.or]).toHaveLength(3);
    expect(args).toMatchObject({ limit: 10, offset: 10 });
    expect(result).toMatchObject({ total: 25, page: 2, totalPages: 3, pageSize: 10 });
  });

  test('findById: id invalido o inexistente -> null', async () => {
    expect(await productService.findById('abc')).toBeNull();
    expect(Product.findByPk).not.toHaveBeenCalled();
    Product.findByPk.mockResolvedValue(null);
    expect(await productService.findById(9)).toBeNull();
  });

  test('findById regresa el producto sin importar si esta activo', async () => {
    Product.findByPk.mockResolvedValue({ get: () => ({ id: 3, active: false }) });
    expect(await productService.findById('3')).toEqual({ id: 3, active: false });
  });

  test('update y remove: null / false si no existe', async () => {
    Product.findByPk.mockResolvedValue(null);
    expect(await productService.update(9, { name: 'X' })).toBeNull();
    expect(await productService.remove(9)).toBe(false);
  });

  test('update guarda los cambios y remove elimina', async () => {
    const record = { update: jest.fn(), destroy: jest.fn(), get: () => ({ id: 1, name: 'Nuevo' }) };
    Product.findByPk.mockResolvedValue(record);
    expect(await productService.update(1, { name: 'Nuevo' })).toEqual({ id: 1, name: 'Nuevo' });
    expect(record.update).toHaveBeenCalledWith({ name: 'Nuevo' });
    expect(await productService.remove(1)).toBe(true);
    expect(record.destroy).toHaveBeenCalled();
  });

  test('create regresa el producto creado', async () => {
    Product.create = jest.fn().mockResolvedValue({ get: () => ({ id: 7 }) });
    expect(await productService.create({ name: 'Nuevo' })).toEqual({ id: 7 });
  });
});
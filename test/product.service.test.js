/* global jest */
// Servicio de productos: se simulan los modelos (sin base de datos).
jest.mock('../models/relationals', () => ({
  Product: { count: jest.fn(), findAll: jest.fn(), findOne: jest.fn() },
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
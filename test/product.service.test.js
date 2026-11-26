/* global jest */
// Servicio de productos: se simulan los modelos (sin base de datos).
jest.mock('../models/relationals', () => ({
  Product: { count: jest.fn(), findAll: jest.fn() }
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
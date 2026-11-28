/* global jest */
//ervicio de inventario: se simulan los modelos (sin base de datos).
jest.mock('../models/relationals', () => ({
  Product: {},
  ProductVariant: { count: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() },
  Inventory: { create: jest.fn() }
}));

const { Op } = require('sequelize');
const { ProductVariant, Inventory } = require('../models/relationals');
const inventoryService = require('../services/inventory.service');

const variant = (overrides = {}) => ({
  id: 11, sku: 'RUN-27-NEG', size: '27', color: 'negro', active: true,
  product: { id: 1, name: 'Tenis Runner' },
  inventory: { stock: 15, reserved: 3 },
  ...overrides
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('inventory.service parseAdjustment (0 <= reserved <= stock)', () => {
  test('valores correctos', () => {
    const result = inventoryService.parseAdjustment({ stock: '20', reserved: '5' });
    expect(result.errors).toEqual({});
    expect(result.data).toEqual({ stock: 20, reserved: 5 });
  });

  test('acepta 0 y reservadas igual al stock', () => {
    expect(inventoryService.parseAdjustment({ stock: '0', reserved: '0' }).errors).toEqual({});
    expect(inventoryService.parseAdjustment({ stock: '7', reserved: '7' }).errors).toEqual({});
  });

  test('reservadas mayores que el stock -> exceedsStock', () => {
    const { errors } = inventoryService.parseAdjustment({ stock: '5', reserved: '6' });
    expect(errors).toEqual({ reserved: 'exceedsStock' });
  });

  test('campos vacios o ausentes -> required', () => {
    expect(inventoryService.parseAdjustment({ stock: '', reserved: ' ' }).errors)
      .toEqual({ stock: 'required', reserved: 'required' });
    expect(inventoryService.parseAdjustment(undefined).errors)
      .toEqual({ stock: 'required', reserved: 'required' });
  });

  test('negativos, decimales, letras y numeros enormes -> invalid', () => {
    for (const bad of ['-1', '2.5', 'abc', '1e3', '99999999999']) {
      expect(inventoryService.parseAdjustment({ stock: bad, reserved: '0' }).errors.stock).toBe('invalid');
    }
  });

  test('conserva lo que escribio la persona para volver a mostrarlo', () => {
    const { values } = inventoryService.parseAdjustment({ stock: ' 12 ', reserved: 'x' });
    expect(values).toEqual({ stock: '12', reserved: 'x' });
  });

  test('no marca exceedsStock si alguno de los dos es invalido', () => {
    const { errors } = inventoryService.parseAdjustment({ stock: 'abc', reserved: '9' });
    expect(errors).toEqual({ stock: 'invalid' });
  });
});

describe('inventory.service listVariants', () => {
  test('arma las filas con lo disponible = stock - reserved', async () => {
    ProductVariant.count.mockResolvedValue(2);
    ProductVariant.findAll.mockResolvedValue([variant(), variant({ id: 12, inventory: null })]);
    const result = await inventoryService.listVariants();
    expect(result.variants[0]).toMatchObject({
      id: 11, sku: 'RUN-27-NEG', productName: 'Tenis Runner', stock: 15, reserved: 3, available: 12
    });
    expect(result.variants[1]).toMatchObject({ stock: 0, reserved: 0, available: 0 });
  });

  test('busca por SKU o nombre de producto y escapa % y _', async () => {
    ProductVariant.count.mockResolvedValue(0);
    ProductVariant.findAll.mockResolvedValue([]);
    await inventoryService.listVariants({ q: '50%_' });
    const { where } = ProductVariant.findAll.mock.calls[0][0];
    expect(where[Op.or][0].sku[Op.iLike]).toBe('%50\\%\\_%');
    expect(where[Op.or][1]['$product.name$'][Op.iLike]).toBe('%50\\%\\_%');
  });

  test('pagina de 10 en 10 y corrige paginas invalidas', async () => {
    ProductVariant.count.mockResolvedValue(25);
    ProductVariant.findAll.mockResolvedValue([]);
    const result = await inventoryService.listVariants({ page: '2' });
    expect(result).toMatchObject({ total: 25, page: 2, totalPages: 3 });
    expect(ProductVariant.findAll.mock.calls[0][0]).toMatchObject({ limit: 10, offset: 10 });
    expect((await inventoryService.listVariants({ page: '99' })).page).toBe(3);
    expect((await inventoryService.listVariants({ page: 'x' })).page).toBe(1);
  });
});

describe('inventory.service findByVariantId', () => {
  test('regresa la fila de la variante', async () => {
    ProductVariant.findByPk.mockResolvedValue(variant());
    expect(await inventoryService.findByVariantId('11')).toMatchObject({ id: 11, available: 12 });
  });

  test('no existe -> null', async () => {
    ProductVariant.findByPk.mockResolvedValue(null);
    expect(await inventoryService.findByVariantId(99)).toBeNull();
  });

  test('id invalido -> null sin consultar la base', async () => {
    for (const bad of ['abc', '0', '-2', '1.5', undefined]) {
      expect(await inventoryService.findByVariantId(bad)).toBeNull();
    }
    expect(ProductVariant.findByPk).not.toHaveBeenCalled();
  });
});

describe('inventory.service updateInventory', () => {
  test('actualiza el registro existente', async () => {
    const update = jest.fn();
    ProductVariant.findByPk
      .mockResolvedValueOnce(variant({ inventory: { stock: 15, reserved: 3, update } }))
      .mockResolvedValueOnce(variant({ inventory: { stock: 30, reserved: 4 } }));
    const row = await inventoryService.updateInventory(11, { stock: 30, reserved: 4 });
    expect(update).toHaveBeenCalledWith({ stock: 30, reserved: 4 });
    expect(Inventory.create).not.toHaveBeenCalled();
    expect(row).toMatchObject({ stock: 30, reserved: 4, available: 26 });
  });

  test('crea el registro si la variante todavia no tenia inventario', async () => {
    ProductVariant.findByPk
      .mockResolvedValueOnce(variant({ inventory: null }))
      .mockResolvedValueOnce(variant({ inventory: { stock: 5, reserved: 0 } }));
    await inventoryService.updateInventory(11, { stock: 5, reserved: 0 });
    expect(Inventory.create).toHaveBeenCalledWith({ variant_id: 11, stock: 5, reserved: 0 });
  });

  test('variante inexistente -> null', async () => {
    ProductVariant.findByPk.mockResolvedValue(null);
    expect(await inventoryService.updateInventory(99, { stock: 1, reserved: 0 })).toBeNull();
    expect(Inventory.create).not.toHaveBeenCalled();
  });
});
const { Op } = require('sequelize');
const { Product, ProductVariant, Inventory } = require('../models/relationals');
const { availableOf } = require('./product.service');

const PAGE_SIZE = 10;
//este lo ponemos par limite integer de postgreesql
const MAX_UNITS = 2147483647;

// escapa % y _ para que se busquen como texto normal en un LIKE
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

const relations = () => [
  { model: Product, as: 'product', attributes: ['id', 'name'], required: true },
  { model: Inventory, as: 'inventory', required: false }
];

//ffila lista para la vista (la variante, su producto y sus existencias)
function toRow(variant) {
  const inventory = variant.inventory || null;
  return {
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    active: variant.active,
    productId: variant.product.id,
    productName: variant.product.name,
    stock: inventory ? inventory.stock : 0,
    reserved: inventory ? inventory.reserved : 0,
    available: availableOf(inventory)
  };
}

//Variantes con sus existencias
//busca por SKU o por nombre de producto
async function listVariants({ q, page } = {}) {
  const where = {};
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    where[Op.or] = [{ sku: { [Op.iLike]: pattern } }, { '$product.name$': { [Op.iLike]: pattern } }];
  }

  const total = await ProductVariant.count({ where, include: relations(), distinct: true });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(parseInt(page, 10) || 1, 1), totalPages);

  const rows = await ProductVariant.findAll({
    where,
    include: relations(),
    order: [[{ model: Product, as: 'product' }, 'name', 'ASC'], ['id', 'ASC']],
    limit: PAGE_SIZE,
    offset: (current - 1) * PAGE_SIZE,
    subQuery: false
  });

  return { variants: rows.map(toRow), total, page: current, totalPages, pageSize: PAGE_SIZE };
}

// Una variante con sus existencias; null si el id no es valido o no existe
async function findByVariantId(id) {
  const variantId = Number(id);
  if (!Number.isInteger(variantId) || variantId < 1) return null;
  const variant = await ProductVariant.findByPk(variantId, { include: relations() });
  return variant ? toRow(variant) : null;
}

// Convierte el texto del formulario en entero: null =vacio, NaN=invalido
function toInteger(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? value : NaN;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const text = value.trim();
  if (!/^\d+$/.test(text)) return NaN;
  const number = Number(text);
  return number > MAX_UNITS ? NaN : number;
}

// Regla de negocio: 0 <= reserved <= stock.
// Regresa {data, values, errors}; 
// //los errores son CODIGOS (required, invalid, exceedsStock)
// que el controller traduce.
function parseAdjustment(input) {
  const source = input || {};
  const values = {
    stock: source.stock === undefined || source.stock === null ? '' : String(source.stock).trim(),
    reserved: source.reserved === undefined || source.reserved === null ? '' : String(source.reserved).trim()
  };
  const stock = toInteger(source.stock);
  const reserved = toInteger(source.reserved);
  const errors = {};

  if (stock === null) errors.stock = 'required';
  else if (Number.isNaN(stock)) errors.stock = 'invalid';

  if (reserved === null) errors.reserved = 'required';
  else if (Number.isNaN(reserved)) errors.reserved = 'invalid';

  if (!errors.stock && !errors.reserved && reserved > stock) errors.reserved = 'exceedsStock';

  return { data: { stock, reserved }, values, errors };
}

// Guarda las existencias de una variante (las crea si todavia no tenia registro)
// Regresa la fila actualizada, o null si la variante no existe.
async function updateInventory(variantId, { stock, reserved }) {
  const variant = await ProductVariant.findByPk(variantId, {
    include: [{ model: Inventory, as: 'inventory' }]
  });
  if (!variant) return null;

  if (variant.inventory) await variant.inventory.update({ stock, reserved });
  else await Inventory.create({ variant_id: variant.id, stock, reserved });

  return findByVariantId(variantId);
}

module.exports = { PAGE_SIZE, listVariants, findByVariantId, parseAdjustment, updateInventory };
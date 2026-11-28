const { Op, fn, col } = require('sequelize');
const { Product, ProductVariant, Inventory } = require('../models/relationals');

const PAGE_SIZE = 6;
const ADMIN_PAGE_SIZE = 10;

// escapa % y _ para que se busquen como texto normal en un LIKE
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

// Productos activos con busqueda por nombre/marca, filtro por categoria y paginacion
async function listActive({ q, category, page } = {}) {
  const where = { active: true };
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    where[Op.or] = [{ name: { [Op.iLike]: pattern } }, { brand: { [Op.iLike]: pattern } }];
  }
  if (category) where.category = category;

  const total = await Product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(parseInt(page, 10) || 1, 1), totalPages);

  const products = await Product.findAll({
    where,
    order: [['id', 'ASC']],
    limit: PAGE_SIZE,
    offset: (current - 1) * PAGE_SIZE
  });

  return { products, total, page: current, totalPages, pageSize: PAGE_SIZE };
}

// Categorias que tienen al menos un producto activo (para el filtro)
async function listCategories() {
  const rows = await Product.findAll({
    attributes: [[fn('DISTINCT', col('category')), 'category']],
    where: { active: true, category: { [Op.ne]: null } },
    order: [['category', 'ASC']],
    raw: true
  });
  return rows.map((row) => row.category);
}

// Destacados del inicio: los productos activos mas recientes
async function listFeatured(limit = 4) {
  return Product.findAll({ where: { active: true }, order: [['id', 'DESC']], limit });
}
// disponible = stock - reserved (nunca menos de 0)
function availableOf(inventory) {
  if (!inventory) return 0;
  return Math.max(0, inventory.stock - inventory.reserved);
}

// Producto ACTIVO con sus variantes activas y las unidades disponibles de cada una.
// Regresa null si el id no es valido, no existe o el producto esta inactivo.
async function findActiveById(id) {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) return null;

  const record = await Product.findOne({
    where: { id: productId, active: true },
    include: [{
      model: ProductVariant,
      as: 'variants',
      required: false,
      where: { active: true },
      include: [{ model: Inventory, as: 'inventory' }]
    }],
    order: [[{ model: ProductVariant, as: 'variants' }, 'id', 'ASC']]
  });
  if (!record) return null;

  const product = record.get({ plain: true });
  product.variants = (product.variants || []).map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    available: availableOf(variant.inventory)
  }));
  product.inStock = product.variants.some((variant) => variant.available > 0);
  return product;
}

// ---------------------------------------------------------------------------
// Administracion de productos (panel)
// ---------------------------------------------------------------------------

// Todos los productos (activos e inactivos) con busqueda por nombre, marca o categoria
async function listAll({ q, page } = {}) {
  const where = {};
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    where[Op.or] = [
      { name: { [Op.iLike]: pattern } },
      { brand: { [Op.iLike]: pattern } },
      { category: { [Op.iLike]: pattern } }
    ];
  }

  const total = await Product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const current = Math.min(Math.max(parseInt(page, 10) || 1, 1), totalPages);

  const products = await Product.findAll({
    where,
    order: [['id', 'ASC']],
    limit: ADMIN_PAGE_SIZE,
    offset: (current - 1) * ADMIN_PAGE_SIZE
  });

  return { products, total, page: current, totalPages, pageSize: ADMIN_PAGE_SIZE };
}

// Un producto cualquiera (activo o no); null si el id no es valido o no existe
async function findById(id) {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) return null;
  const record = await Product.findByPk(productId);
  return record ? record.get({ plain: true }) : null;
}

// Valida y normaliza el formulario de producto (reglas del lado del servidor).
// Regresa { data, values, errors }
//  los errores son codgos que el controller traduce:
// name: required | tooShort | tooLong, brand/category/description: tooLong, price: required | invalid
function parseProduct(input) {
  const source = input || {};
  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const values = {
    name: text(source.name),
    brand: text(source.brand),
    category: text(source.category),
    price: text(source.price),
    description: text(source.description),
    active: source.active === 'on' || source.active === 'true' || source.active === true
  };
  const errors = {};

  if (!values.name) errors.name = 'required';
  else if (values.name.length < 2) errors.name = 'tooShort';
  else if (values.name.length > 150) errors.name = 'tooLong';

  if (values.brand.length > 100) errors.brand = 'tooLong';
  if (values.category.length > 50) errors.category = 'tooLong';
  if (values.description.length > 2000) errors.description = 'tooLong';

  if (!values.price) errors.price = 'required';
  else if (!/^\d{1,8}(\.\d{1,2})?$/.test(values.price)) errors.price = 'invalid'; // DECIMAL(10,2), sin negativos

  const data = {
    name: values.name,
    brand: values.brand || null,
    category: values.category || null,
    description: values.description || null,
    price: Number(values.price),
    active: values.active
  };
  return { data, values, errors };
}

// Valores iniciales del formulario de edicion
function formValues(product) {
  return {
    name: product.name,
    brand: product.brand || '',
    category: product.category || '',
    price: String(product.price),
    description: product.description || '',
    active: Boolean(product.active)
  };
}

async function create(data) {
  const record = await Product.create(data);
  return record.get({ plain: true });
}

// Regresa el producto actualizado, o null si no existe
async function update(id, data) {
  const record = await Product.findByPk(id);
  if (!record) return null;
  await record.update(data);
  return record.get({ plain: true });
}

// Elimina el producto (sus variantes e inventario se eliminan en cascada). false si no existe
async function remove(id) {
  const record = await Product.findByPk(id);
  if (!record) return false;
  await record.destroy();
  return true;
}

module.exports = {
  PAGE_SIZE,
  ADMIN_PAGE_SIZE,
  availableOf,
  listActive,
  listCategories,
  listFeatured,
  findActiveById,
  listAll,
  findById,
  parseProduct,
  formValues,
  create,
  update,
  remove
};
const { Op, fn, col } = require('sequelize');
const { Product } = require('../models/relationals');

const PAGE_SIZE = 6;

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

module.exports = { PAGE_SIZE, listActive, listCategories, listFeatured };
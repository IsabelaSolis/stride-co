const productService = require('../../services/product.service');

// Parametro de query como texto (si viene repetido, ?q=a&q=b, se usa el primero)
function asText(value) {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' ? first.trim() : '';
}

// GET /
async function home(req, res, next) {
  try {
    const products = await productService.listFeatured();
    res.render('store/home', {
      title: req.__('store.home.title'),
      metaDescription: req.__('store.home.description'),
      products
    });
  } catch (err) {
    next(err);
  }
}

// GET /products?q=&category=&page=
async function catalog(req, res, next) {
  try {
    const q = asText(req.query.q);
    const category = asText(req.query.category);
    const [result, categories] = await Promise.all([
      productService.listActive({ q, category, page: req.query.page }),
      productService.listCategories()
    ]);
    res.render('store/catalog', {
      title: req.__('store.catalog.title'),
      metaDescription: req.__('store.catalog.description'),
      ...result,
      categories,
      q,
      category
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { home, catalog };
const createError = require('http-errors');
const productService = require('../../services/product.service');

// codigo de error del servicio -> texto traducido: { name: 'required' } -> { name: 'El nombre es obligatorio' }
function translateErrors(req, errors) {
  const translated = {};
  for (const [field, code] of Object.entries(errors)) {
    translated[field] = req.__(`admin.products.errors.${field}.${code}`);
  }
  return translated;
}

async function renderForm(req, res, { status = 200, product = null, values, errors = {} }) {
  const categories = await productService.listCategories();
  res.status(status).render('admin/products/form', {
    title: product ? req.__('admin.products.edit') : req.__('admin.products.new'),
    formAction: product ? `/admin/products/${product.id}` : '/admin/products',
    values,
    errors,
    categories
  });
}

// GET /admin/products?q=&page=
async function list(req, res, next) {
  try {
    const first = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
    const q = typeof first === 'string' ? first.trim() : '';
    const result = await productService.listAll({ q, page: req.query.page });
    res.render('admin/products/index', { title: req.__('admin.products.title'), ...result, q });
  } catch (err) {
    next(err);
  }
}

// GET /admin/products/new
async function newForm(req, res, next) {
  try {
    const values = { name: '', brand: '', category: '', price: '', description: '', active: true };
    await renderForm(req, res, { values });
  } catch (err) {
    next(err);
  }
}

// POST /admin/products  (invalido: 400 + formulario con errores; valido: 302 -> listado)
async function create(req, res, next) {
  try {
    const { data, values, errors } = productService.parseProduct(req.body);
    if (Object.keys(errors).length > 0) {
      return await renderForm(req, res, { status: 400, values, errors: translateErrors(req, errors) });
    }
    await productService.create(data);
    res.flash('success', 'admin.products.created');
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
}

// GET /admin/products/:id/edit
async function editForm(req, res, next) {
  try {
    const product = await productService.findById(req.params.id);
    if (!product) return next(createError(404));
    await renderForm(req, res, { product, values: productService.formValues(product) });
  } catch (err) {
    next(err);
  }
}

// POST /admin/products/:id
async function update(req, res, next) {
  try {
    const product = await productService.findById(req.params.id);
    if (!product) return next(createError(404));

    const { data, values, errors } = productService.parseProduct(req.body);
    if (Object.keys(errors).length > 0) {
      return await renderForm(req, res, { status: 400, product, values, errors: translateErrors(req, errors) });
    }
    await productService.update(product.id, data);
    res.flash('success', 'admin.products.updated');
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
}

// POST /admin/products/:id/delete
async function destroy(req, res, next) {
  try {
    const product = await productService.findById(req.params.id);
    if (!product) return next(createError(404));
    await productService.remove(product.id);
    res.flash('success', 'admin.products.deleted');
    res.redirect('/admin/products');
  } catch (err) {
    next(err);
  }
}

module.exports = { list, newForm, create, editForm, update, destroy };
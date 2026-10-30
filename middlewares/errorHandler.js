// Manejador central de errores: convierte los errores en respuestas { message, data }
function errorHandler(err, req, res, next) {
  const t = (key) => (typeof req.__ === 'function' ? req.__(key) : key);
  let status = err.status || err.statusCode || 500;
  let message;
  let data;

  if (err.name === 'SequelizeValidationError') {
    status = 400;
    message = t('common.validationError');
    data = err.errors.map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    status = 400;
    message = t('common.duplicated');
    data = err.errors.map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    status = 400;
    message = t('common.invalidReference');
  } else if (err.name === 'SequelizeDatabaseError' && err.parent && ['22P02', '22003'].includes(err.parent.code)) {
    status = 400; // texto donde va un numero, numero fuera de rango
    message = t('common.validationError');
  } else if (status === 401) {
    message = t('common.unauthorized');
  } else if (status === 404) {
    message = t('common.notFound');
  } else if (status >= 400 && status < 500) {
    message = err.message;
  } else {
    status = 500;
    message = t('common.serverError');
    console.error(err);
  }

  // La API responde JSON; las demas rutas conservan la vista de error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(status).json({ message, data });
  }
  res.locals.message = message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(status);
  res.render('error');
}

module.exports = errorHandler;
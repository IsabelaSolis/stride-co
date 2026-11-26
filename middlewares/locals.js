const { URLSearchParams } = require('url');
const { STORE_MENU, ADMIN_MENU } = require('../config/menus');

const INTL_LOCALE = { es: 'es-MX', en: 'en-US' };

// Variables y helpers disponibles en TODAS las vistas Pug
function setLocals(req, res, next) {
  const lang = req.getLocale();
  const intl = INTL_LOCALE[lang] || INTL_LOCALE.en;

  res.locals.lang = lang;
  res.locals.currentPath = req.path;
  res.locals.currentUser = req.user || null;
  res.locals.cartCount = 0; // se calcula en F4 (bolsa)

  res.locals.storeMenu = STORE_MENU.filter((item) => item.enabled);
  res.locals.adminMenu = ADMIN_MENU.filter((item) => item.enabled);

  // enlace activo del menú
  res.locals.isActive = (href) =>
    (href === '/' || href === '/admin' ? req.path === href : req.path.startsWith(href));

  // misma URL pero cambiando el idioma (conserva el query string)
  res.locals.langUrl = (target) => {
    const params = new URLSearchParams(req.query);
    params.set('lang', target);
    return `${req.path}?${params.toString()}`;
  };

  // formato según el idioma
  res.locals.formatPrice = (value) =>
    new Intl.NumberFormat(intl, { style: 'currency', currency: 'MXN' }).format(Number(value) || 0);
  res.locals.formatDate = (value) =>
    new Intl.DateTimeFormat(intl, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

  next();
}

module.exports = setLocals;
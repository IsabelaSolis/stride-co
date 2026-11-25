const SUPPORTED = ['es', 'en'];
const DEFAULT = 'en';

const baseLang = (value) =>
  (typeof value === 'string' ? value.trim().toLowerCase().split(/[-_]/)[0] : '');

//?lang->Accept-Language (idioma por defecto)
function setLanguage(req, res, next) {
  let lang = baseLang(req.query.lang);
  if (!SUPPORTED.includes(lang)) {
    lang = req.headers['accept-language'] ? req.acceptsLanguages(...SUPPORTED) : false;
  }
  if (!SUPPORTED.includes(lang)) lang = DEFAULT; // por ejemplo fr
  req.setLocale(lang);
  next();
}

module.exports = setLanguage;
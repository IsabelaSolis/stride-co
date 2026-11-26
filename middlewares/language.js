const SUPPORTED = ['es', 'en'];
const DEFAULT = 'en';
const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

const baseLang = (value) =>
  (typeof value === 'string' ? value.trim().toLowerCase().split(/[-_]/)[0] : '');

// ?lang -> cookie lang -> Accept-Language -> idioma por defecto
function setLanguage(req, res, next) {
  let lang = baseLang(req.query.lang);
  const fromQuery = SUPPORTED.includes(lang);

  if (!fromQuery) lang = baseLang(req.cookies && req.cookies.lang);

  if (!SUPPORTED.includes(lang)) {
    lang = req.headers['accept-language'] ? req.acceptsLanguages(...SUPPORTED) : false;
  }
  if (!SUPPORTED.includes(lang)) lang = DEFAULT; // por ejemplo fr

  req.setLocale(lang);
  // la elección explícita (?lang=) se conserva al navegar
  if (fromQuery) res.cookie('lang', lang, { maxAge: ONE_YEAR, sameSite: 'lax' });
  next();
}

module.exports = setLanguage;
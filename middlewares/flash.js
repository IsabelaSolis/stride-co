// Mensaje de un solo uso (patron PRG): se guarda en una cookie, se muestra en la
// siguiente pagina y se borra. Se guarda la CLAVE de traduccion, no el texto.
const COOKIE = 'flash';
const TYPES = ['success', 'danger', 'warning', 'info'];
const KEY_FORMAT = /^[A-Za-z]+(\.[A-Za-z]+)+$/;

function flash(req, res, next) {
  const raw = req.cookies && req.cookies[COOKIE];
  if (raw) {
    const [type, key] = String(raw).split('|');
    if (TYPES.includes(type) && KEY_FORMAT.test(key || '')) {
      res.locals.flash = { type, message: req.__(key) };
    }
    res.clearCookie(COOKIE);
  }

  // uso: res.flash('success', 'auth.web.welcome')
  res.flash = (type, key) =>
    res.cookie(COOKIE, `${type}|${key}`, { httpOnly: true, sameSite: 'lax' });
  next();
}

module.exports = flash;
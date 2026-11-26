const authService = require('../../services/auth.service');
const { ACCESS_COOKIE } = require('../../middlewares/webSession');

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cuentas de demostracion (solo se muestran fuera de produccion; ver README)
const DEMO_USERS = ['admin@stride.com', 'sales@stride.com', 'user@stride.com'];

const isProduction = (req) => req.app.get('env') === 'production';

// Evita redirecciones abiertas: solo se permiten rutas internas
function safeNext(value) {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  if (value.startsWith('/login')) return '/';
  return value;
}

function renderLogin(req, res, { status = 200, email = '', redirectTo = '/', errors = {}, formError = null } = {}) {
  res.status(status).render('auth/login', {
    title: req.__('auth.web.title'),
    metaDescription: req.__('auth.web.description'),
    email,
    redirectTo,
    errors,
    formError,
    demoUsers: isProduction(req) ? null : DEMO_USERS
  });
}

function validate(req, body) {
  const errors = {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email) errors.email = req.__('auth.web.errors.emailRequired');
  else if (!EMAIL_FORMAT.test(email)) errors.email = req.__('auth.web.errors.emailInvalid');
  if (!password) errors.password = req.__('auth.web.errors.passwordRequired');

  return { email, password, errors };
}

// GET /login
function showLogin(req, res) {
  const redirectTo = safeNext(req.query.next);
  if (req.user) return res.redirect(redirectTo); // ya inicio sesion
  renderLogin(req, res, { redirectTo: redirectTo === '/' ? '' : redirectTo });
}

// POST /login
async function login(req, res, next) {
  try {
    const { email, password, errors } = validate(req, req.body || {});
    const redirectTo = safeNext(req.body && req.body.next);
    const formState = { email, redirectTo: redirectTo === '/' ? '' : redirectTo };

    if (Object.keys(errors).length > 0) {
      return renderLogin(req, res, { ...formState, status: 400, errors });
    }

    const user = await authService.authenticate(email, password);
    if (!user) {
      return renderLogin(req, res, {
        ...formState,
        status: 401,
        formError: req.__('auth.invalidCredentials')
      });
    }

    res.cookie(ACCESS_COOKIE, authService.signToken(user), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction(req)
    });
    res.flash('success', 'auth.web.welcome');
    res.redirect(redirectTo);
  } catch (err) {
    next(err);
  }
}

// POST /logout
function logout(req, res) {
  res.clearCookie(ACCESS_COOKIE);
  res.flash('success', 'auth.web.loggedOut');
  res.redirect('/');
}

module.exports = { showLogin, login, logout };
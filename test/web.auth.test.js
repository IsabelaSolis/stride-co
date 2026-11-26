/* global jest */
// F1: inicio y cierre de sesion (vistas). El servicio de autenticacion va simulado: sin base de datos.
jest.mock('../services/auth.service', () => ({
  authenticate: jest.fn(),
  signToken: jest.fn(() => 'token-falso'),
  verifyToken: jest.fn(),
  findActiveUser: jest.fn()
}));

const request = require('supertest');
const authService = require('../services/auth.service');
const app = require('../app');
const es = require('../locales/es.json');
const en = require('../locales/en.json');

const VALID = { email: 'admin@stride.com', password: 'Password123' };
const cookieOf = (res, name) => (res.headers['set-cookie'] || []).find((c) => c.startsWith(`${name}=`));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('F1 GET /login', () => {
  test('200 HTML en espanol con formulario, <title> y meta description', async () => {
    const res = await request(app).get('/login?lang=es');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('<html lang="es">');
    expect(res.text).toContain(`<title>${es.auth.web.title} | Stride-Co</title>`);
    expect(res.text).toContain(es.auth.web.description);
    expect(res.text).toContain('action="/login"');
    expect(res.text).toContain(es.auth.web.email);
  });

  test('la misma pagina en ingles', async () => {
    const res = await request(app).get('/login?lang=en');
    expect(res.text).toContain('<html lang="en">');
    expect(res.text).toContain(en.auth.web.title);
    expect(res.text).toContain(en.auth.web.password);
  });

  test('conserva ?next en un campo oculto', async () => {
    const res = await request(app).get('/login?next=/admin/products');
    expect(res.text).toContain('name="next" value="/admin/products"');
  });

  test('con sesion activa redirige', async () => {
    authService.verifyToken.mockReturnValue({ sub: '1' });
    authService.findActiveUser.mockResolvedValue({ id: 1, email: VALID.email });
    const res = await request(app).get('/login').set('Cookie', 'access_token=abc');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/');
  });
});

describe('F1 POST /login', () => {
  test('datos vacios -> 400 con errores por campo traducidos', async () => {
    const res = await request(app).post('/login?lang=es').type('form').send({ email: '', password: '' });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain(es.auth.web.errors.emailRequired);
    expect(res.text).toContain(es.auth.web.errors.passwordRequired);
    expect(authService.authenticate).not.toHaveBeenCalled();
  });

  test('correo con formato invalido -> 400 y conserva lo escrito', async () => {
    const res = await request(app).post('/login?lang=en').type('form').send({ email: 'no-es-correo', password: 'x' });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain(en.auth.web.errors.emailInvalid);
    expect(res.text).toContain('value="no-es-correo"');
  });

  test('credenciales incorrectas -> 401, mensaje traducido, conserva el correo y no la contrasena', async () => {
    authService.authenticate.mockResolvedValue(null);
    const res = await request(app).post('/login?lang=es').type('form').send({ email: VALID.email, password: 'MalaContra1' });
    expect(res.statusCode).toBe(401);
    expect(res.text).toContain(es.auth.invalidCredentials);
    expect(res.text).toContain(`value="${VALID.email}"`);
    expect(res.text).not.toContain('MalaContra1');
    expect(cookieOf(res, 'access_token')).toBeUndefined();
  });

  test('credenciales correctas -> 302, cookie httpOnly con el JWT (PRG)', async () => {
    authService.authenticate.mockResolvedValue({ id: 1, email: VALID.email });
    const res = await request(app).post('/login').type('form').send(VALID);
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/');
    const cookie = cookieOf(res, 'access_token');
    expect(cookie).toContain('token-falso');
    expect(cookie).toMatch(/HttpOnly/i);
    expect(authService.authenticate).toHaveBeenCalledWith(VALID.email, VALID.password);
  });

  test('regresa a la pagina solicitada (?next) y bloquea redirecciones externas', async () => {
    authService.authenticate.mockResolvedValue({ id: 1, email: VALID.email });
    const ok = await request(app).post('/login').type('form').send({ ...VALID, next: '/admin/products' });
    expect(ok.headers.location).toBe('/admin/products');

    for (const evil of ['//evil.com', 'https://evil.com', '/\\evil.com']) {
      const res = await request(app).post('/login').type('form').send({ ...VALID, next: evil });
      expect(res.headers.location).toBe('/');
    }
  });

  test('el mensaje de bienvenida se muestra una sola vez', async () => {
    authService.authenticate.mockResolvedValue({ id: 1, email: VALID.email });
    const agent = request.agent(app);
    await agent.post('/login').type('form').send(VALID);
    const first = await agent.get('/no-existe?lang=es');
    expect(first.text).toContain(es.auth.web.welcome);
    const second = await agent.get('/no-existe?lang=es');
    expect(second.text).not.toContain(es.auth.web.welcome);
  });
});

describe('F1 POST /logout', () => {
  test('borra la cookie y regresa a la tienda', async () => {
    const res = await request(app).post('/logout').set('Cookie', 'access_token=abc');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/');
    expect(cookieOf(res, 'access_token')).toMatch(/access_token=;/);
  });
});

describe('F1 sesion en las vistas', () => {
  test('cookie invalida o vencida: se ignora y se borra', async () => {
    authService.verifyToken.mockImplementation(() => { throw new Error('jwt expired'); });
    const res = await request(app).get('/login').set('Cookie', 'access_token=vencido');
    expect(res.statusCode).toBe(200);
    expect(cookieOf(res, 'access_token')).toMatch(/access_token=;/);
  });

  test('con sesion el encabezado muestra cerrar sesion y nunca el hash ni el salt', async () => {
    authService.verifyToken.mockReturnValue({ sub: '1' });
    authService.findActiveUser.mockResolvedValue({
      id: 1, email: VALID.email, password: 'HASH-SECRETO', salt_key: 'SALT-SECRETO'
    });
    const res = await request(app).get('/no-existe?lang=es').set('Cookie', 'access_token=abc');
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('action="/logout"');
    expect(res.text).toContain(es.layout.logout);
    expect(res.text).not.toContain('HASH-SECRETO');
    expect(res.text).not.toContain('SALT-SECRETO');
  });

  test('el recuadro de demostracion no aparece en produccion', async () => {
    app.set('env', 'production');
    const res = await request(app).get('/login');
    app.set('env', 'test');
    expect(res.text).not.toContain('admin@stride.com');
  });
});
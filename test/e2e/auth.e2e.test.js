const jwt = require('jsonwebtoken');
const { api, login, auth, waitForApi, DEMO_USERS } = require('./helpers');

describe('E2E - Autenticacion (/api/v1/auth)', () => {
  // Esperar a que la API responda 200 en Render u otro entorno antes de comenzar las pruebas
  beforeAll(async () => {
    await waitForApi();
  }, 95000);

  describe('POST /api/v1/auth/login', () => {
    test('login correcto devuelve un JWT', async () => {
      const res = await api()
        .post('/api/v1/auth/login')
        .send({
          email: DEMO_USERS.admin.email,
          password: DEMO_USERS.admin.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('token');
      expect(typeof res.body.data.token).toBe('string');

      // Validar estructura del JWT (3 partes separadas por punto: header.payload.signature)
      const tokenParts = res.body.data.token.split('.');
      expect(tokenParts).toHaveLength(3);
      expect(res.body.data.token_type).toBe('Bearer');
      expect(res.body.data).toHaveProperty('expires_in');
    });

    test('login con otros usuarios de demostracion (sales y user) tambien devuelve un JWT', async () => {
      for (const role of ['sales', 'user']) {
        const res = await api()
          .post('/api/v1/auth/login')
          .send({
            email: DEMO_USERS[role].email,
            password: DEMO_USERS[role].password
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.token.split('.')).toHaveLength(3);
      }
    });

    test('credenciales incorrectas responden 401', async () => {
      // Caso 1: Password equivocado
      const resWrongPassword = await api()
        .post('/api/v1/auth/login')
        .send({
          email: DEMO_USERS.admin.email,
          password: 'PasswordInvalido123'
        });

      expect(resWrongPassword.statusCode).toBe(401);
      expect(resWrongPassword.body).toHaveProperty('message');

      // Caso 2: Usuario que no existe en la base de datos
      const resNonExistent = await api()
        .post('/api/v1/auth/login')
        .send({
          email: 'usuario.inexistente@stride.com',
          password: 'Password123'
        });

      expect(resNonExistent.statusCode).toBe(401);
      expect(resNonExistent.body).toHaveProperty('message');
    });
  });

  describe('Rutas protegidas sin token o con token invalido', () => {
    test('una ruta protegida sin token responde 401', async () => {
      // /api/v1/auth/me sin header Authorization
      const resMe = await api().get('/api/v1/auth/me');
      expect(resMe.statusCode).toBe(401);
      expect(resMe.body).toHaveProperty('message');

      // Ruta de recursos /api/v1/users sin header Authorization
      const resUsers = await api().get('/api/v1/users');
      expect(resUsers.statusCode).toBe(401);
      expect(resUsers.body).toHaveProperty('message');
    });

    test('una ruta protegida con token invalido responde 401', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token.invalido';

      // /api/v1/auth/me con token invalido
      const resMe = await api()
        .get('/api/v1/auth/me')
        .set(auth(invalidToken));
      expect(resMe.statusCode).toBe(401);
      expect(resMe.body).toHaveProperty('message');

      // Ruta de recursos /api/v1/users con token invalido
      const resUsers = await api()
        .get('/api/v1/users')
        .set(auth(invalidToken));
      expect(resUsers.statusCode).toBe(401);
      expect(resUsers.body).toHaveProperty('message');
    });
        test('un token bien formado pero firmado con otro secreto responde 401', async () => {
      const forged = jwt.sign({ sub: '1' }, 'otro-secreto-que-no-es-el-real', { algorithm: 'HS256' });
      const res = await api().get('/api/v1/auth/me').set(auth(forged));
      expect(res.statusCode).toBe(401);
    });

        test('login sin email ni password responde 400', async () => {
      const res = await api().post('/api/v1/auth/login').send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    test('GET /api/v1/auth/me con token valido devuelve el usuario sin password ni salt_key', async () => {
      const token = await login('admin');

      const res = await api()
        .get('/api/v1/auth/me')
        .set(auth(token));

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('data');

      const userData = res.body.data;
      expect(userData).toHaveProperty('id');
      expect(userData.email).toBe(DEMO_USERS.admin.email);
      expect(userData.first_name).toBe('Admin');
      expect(userData.last_name).toBe('Stride');
      expect(userData).toHaveProperty('role');

      // Verificacion explicita: password y salt_key NO deben estar expuestos en la respuesta
      expect(userData.password).toBeUndefined();
      expect(userData.salt_key).toBeUndefined();
      expect(userData).not.toHaveProperty('password');
      expect(userData).not.toHaveProperty('salt_key');
    });

    test('GET /api/v1/auth/me devuelve datos validos sin campos sensibles para sales y user', async () => {
      for (const role of ['sales', 'user']) {
        const token = await login(role);

        const res = await api()
          .get('/api/v1/auth/me')
          .set(auth(token));

        expect(res.statusCode).toBe(200);
        expect(res.body.data.email).toBe(DEMO_USERS[role].email);
        expect(res.body.data).not.toHaveProperty('password');
        expect(res.body.data).not.toHaveProperty('salt_key');
      }
    });
  });

  describe('Helpers de autenticacion (login y auth)', () => {
    test('login(rol) almacena en cache el token para no repetir llamadas', async () => {
      const token1 = await login('admin');
      const token2 = await login('admin');
      expect(token1).toBe(token2);
    });

    test('auth(token) devuelve el header Authorization esperado', () => {
      const header = auth('test-token');
      expect(header.Authorization).toBe('Bearer test-token');
      expect(String(header)).toBe('Bearer test-token');
    });
  });
});

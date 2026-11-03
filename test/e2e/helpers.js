/* global setTimeout */
const request = require('supertest');
const config = require('config');

// La URL base se lee con config.get('e2e.baseUrl') (por defecto http://localhost:3000).
// Se permite sobrescribirla con la variable de entorno E2E_BASE_URL.
let defaultBaseUrl = 'http://localhost:3000';
try {
  if (config.has('e2e.baseUrl')) {
    defaultBaseUrl = config.get('e2e.baseUrl');
  }
} catch {
  // En caso de que config no este disponible
}

const baseUrl = process.env.E2E_BASE_URL || defaultBaseUrl;

/**
 * Regresa una instancia de supertest asociada a baseUrl.
 * Permite realizar peticiones HTTP reales contra la API en ejecucion.
 */
function api() {
  return request(baseUrl);
}

// Usuarios de demostracion generados por scripts/seed.js
const DEMO_USERS = {
  admin: { email: 'admin@stride.com', password: 'Password123' },
  sales: { email: 'sales@stride.com', password: 'Password123' },
  user: { email: 'user@stride.com', password: 'Password123' }
};

// Cache de tokens para no repetir el login innecesariamente
const tokenCache = {};

/**
 * Realiza POST /api/v1/auth/login con el usuario demo del rol ('admin', 'sales' o 'user')
 * y regresa el token JWT (utiliza cache para llamadas subsecuentes).
 *
 * @param {'admin' | 'sales' | 'user'} rol
 * @returns {Promise<string>} Token JWT
 */
async function login(rol) {
  if (!rol || typeof rol !== 'string') {
    throw new Error("Se debe especificar un rol valido: 'admin', 'sales' o 'user'.");
  }

  const normalizedRole = rol.toLowerCase().trim();
  if (tokenCache[normalizedRole]) {
    return tokenCache[normalizedRole];
  }

  const credentials = DEMO_USERS[normalizedRole];
  if (!credentials) {
    throw new Error(`Rol demo no reconocido: '${rol}'. Opciones validas: 'admin', 'sales', 'user'.`);
  }

  const res = await api()
    .post('/api/v1/auth/login')
    .send(credentials);

  if (res.statusCode !== 200 || !res.body || !res.body.data || !res.body.data.token) {
    throw new Error(
      `Fallo el login para el rol '${rol}' (status ${res.statusCode}): ${JSON.stringify(res.body)}`
    );
  }

  const token = res.body.data.token;
  tokenCache[normalizedRole] = token;
  return token;
}

/**
 * Regresa el header Authorization formateado con el prefijo Bearer.
 * Es compatible tanto con `.set(auth(token))` como con `.set('Authorization', auth(token))`.
 *
 * @param {string | { token: string }} token
 * @returns {{ Authorization: string, toString: () => string }}
 */
function auth(token) {
  const rawToken = (typeof token === 'object' && token !== null)
    ? (token.token || token.data?.token || '')
    : token;

  const value = rawToken
    ? (String(rawToken).startsWith('Bearer ') ? String(rawToken) : `Bearer ${rawToken}`)
    : '';

  const headerObj = {
    Authorization: value
  };

  Object.defineProperty(headerObj, 'toString', {
    value: () => value,
    enumerable: false,
    configurable: true
  });

  return headerObj;
}

/**
 * Consulta GET /health reiteradamente hasta recibir status 200 (maximo 90 segundos).
 * Permite esperar a que servicios como instancias gratuitas de Render terminen de despertar.
 *
 * @param {number} [timeoutMs=90000] - Tiempo maximo de espera en ms.
 * @param {number} [intervalMs=1000] - Intervalo entre reintentos en ms.
 * @returns {Promise<object>} Respuesta HTTP de supertest.
 */
async function waitForApi(timeoutMs = 90000, intervalMs = 1000) {
  const start = Date.now();
  let lastError = null;

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await api().get('/health');
      if (res.statusCode === 200) {
        return res;
      }
      lastError = new Error(`Respuesta no exitosa de /health con codigo ${res.statusCode}`);
    } catch (err) {
      lastError = err;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `La API en ${baseUrl} no respondio 200 en /health en ${timeoutMs / 1000}s. ` +
    `Ultimo error: ${lastError ? lastError.message : 'Timeout superado'}`
  );
}

module.exports = {
  baseUrl,
  api,
  login,
  auth,
  waitForApi,
  DEMO_USERS,
  tokenCache
};

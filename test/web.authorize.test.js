/* global jest */
// authorize en rutas web (redirige / pagina 403) y en la API (JSON). Sin base de datos.
jest.mock('../models/relationals', () => ({
  User: {},
  Role: { findByPk: jest.fn(async (id) => ({ id, name: id === 3 ? 'user' : 'sinpermisos' })) }
}));
jest.mock('../rbac/accessControl', () => {
  const { AccessControl } = require('accesscontrol');
  const ac = new AccessControl([{ role: 'user', resource: 'products', action: 'read:any', attributes: '*' }]);
  return { getAccessControl: () => ac };
});

const path = require('path');
const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const i18n = require('../config/i18n');
const setLanguage = require('../middlewares/language');
const setLocals = require('../middlewares/locals');
const authorize = require('../middlewares/authorize');
const errorHandler = require('../middlewares/errorHandler');
const es = require('../locales/es.json');

function buildApp(user) {
  const app = express();
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'pug');
  app.use(cookieParser());
  app.use(i18n.init);
  app.use(setLanguage);
  app.use((req, res, next) => { req.user = user; next(); });
  app.use(setLocals);
  app.get('/protegida', authorize('products', 'read', 'any'), (req, res) => res.send('contenido'));
  app.get('/api/protegida', authorize('products', 'read', 'any'), (req, res) => res.json({ ok: true }));
  app.use((req, res, next) => next(createError(404)));
  app.use(errorHandler);
  return app;
}

describe('authorize en rutas web', () => {
  test('sin sesion redirige (302) a /login conservando la pagina pedida', async () => {
    const res = await request(buildApp(null)).get('/protegida?x=1');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login?next=%2Fprotegida%3Fx%3D1');
  });

  test('sin permiso -> 403 con la pagina de error traducida', async () => {
    const res = await request(buildApp({ id: 9, role_id: 9 })).get('/protegida?lang=es');
    expect(res.statusCode).toBe(403);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain(es.errors.forbidden.title);
    expect(res.text).toContain(es.common.forbidden);
  });

  test('con permiso deja pasar', async () => {
    const res = await request(buildApp({ id: 3, role_id: 3 })).get('/protegida');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('contenido');
  });
});

describe('authorize en la API', () => {
  test('sin sesion -> 401 JSON', async () => {
    const res = await request(buildApp(null)).get('/api/protegida');
    expect(res.statusCode).toBe(401);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  test('sin permiso -> 403 JSON', async () => {
    const res = await request(buildApp({ id: 9, role_id: 9 })).get('/api/protegida');
    expect(res.statusCode).toBe(403);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
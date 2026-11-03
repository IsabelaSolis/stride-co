const { api, waitForApi } = require('./helpers');

describe('E2E - Health Check', () => {
  // Esperar a que la API responda 200 en Render u otro entorno antes de correr las pruebas
  beforeAll(async () => {
    await waitForApi();
  }, 95000);

  test('GET /health responde 200 con {"status":"UP"}', async () => {
    const res = await api().get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'UP' });
    expect(res.body.status).toBe('UP');
  });
});

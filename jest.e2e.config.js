// npm run test:e2e: solo pruebas contra la API en ejecucion y bases reales
module.exports = {
  testMatch: ['<rootDir>/test/e2e/**/*.e2e.test.js'],
  testTimeout: 90000 // el plan gratuito de Render puede tardar en despertar
};
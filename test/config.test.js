const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');

// Ejecuta un fragmento de Node en un proceso aparte con el entorno que es
function runNode(code, env = {}) {
  const baseEnv = { ...process.env, NODE_ENV: 'test' };
  delete baseEnv.PORT;
  delete baseEnv.NODE_CONFIG;
  return spawnSync(process.execPath, ['-e', code], {
    cwd: root,
    env: { ...baseEnv, ...env },
    encoding: 'utf8'
  });
}

// Lista los .js del proyecto que no son pruebas ni dependencias
function sourceFiles(dir, found = []) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    if (['node_modules', '.git', 'test', 'public', 'docs'].includes(entry.name)) return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, found);
    else if (entry.name.endsWith('.js') || entry.name === 'www') found.push(full);
  });
  return found;
}

describe('Archivos de configuracion', () => {
  test.each([
    'default.json',
    'production.json',
    'test.json',
    'custom-environment-variables.json',
    'local-development.example.json',
    'local-production.example.json'
  ])('existe config/%s', (file) => {
    expect(fs.existsSync(path.join(root, 'config', file))).toBe(true);
  });

  test('los archivos que van en git no traen jwt.secret', () => {
    ['default.json', 'production.json'].forEach((file) => {
      const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config', file), 'utf8'));
      expect((cfg.jwt || {}).secret).toBeFalsy();
    });
  });

  test('.gitignore y .dockerignore excluyen config/local*.json', () => {
    ['.gitignore', '.dockerignore'].forEach((file) => {
      const text = fs.readFileSync(path.join(root, file), 'utf8');
      expect(text).toContain('config/local*.json');
    });
  });
});

describe('Uso de la configuracion', () => {
  test('el codigo de la aplicacion no lee process.env directamente', () => {
    const offenders = sourceFiles(root).filter((file) =>
      fs.readFileSync(file, 'utf8').includes('process.env'));
    expect(offenders).toEqual([]);
  });

  test('con NODE_ENV=test se cargan los valores de config/test.json', () => {
    const res = runNode("const c = require('config'); console.log(String(c.get('bcrypt.saltRounds')));");
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe('4');
  });
  test('PORT se enlaza con server.port', () => {
    const res = runNode("console.log(require('config').get('server.port'));", { PORT: '8080' });
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe('8080');
  });
});

describe('Validacion de jwt.secret', () => {
  test('con jwt.secret definido el servidor puede arrancar', () => {
    const res = runNode("require('./config/validate'); console.log('ok');");
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe('ok');
  });

  test('sin jwt.secret el proceso termina con error y un mensaje claro', () => {
    const res = runNode("require('./config/validate'); console.log('arranco');", {
      NODE_CONFIG: JSON.stringify({ jwt: { secret: '' } })
    });
    expect(res.status).toBe(1);
    expect(res.stderr).toContain('jwt.secret');
    expect(res.stdout).not.toContain('arranco');
  });
});
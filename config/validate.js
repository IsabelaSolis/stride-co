const config = require('config');

if (!config.has('jwt.secret') || !config.get('jwt.secret')) {
    const env = config.util.getEnv('NODE_ENV');
    console.error(
        `ERROR: falta "jwt.secret" en la configuracion (entorno: ${env}).\n` +
        `Crea config/local-${env}.json a partir de config/local-${env}.example.json ` +
        'y define ahi el secreto.'
    );
    process.exit(1);
}
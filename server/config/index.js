const nconf = require('nconf');

nconf.argv().env('__').file({ file: './config.json' });
nconf.defaults({
    environment: 'dev',
    postgres: {
        port: 5432
    },
    http: {
        port: 3000
    },
    log: {
        level: 'info'
    }
});

nconf.required([
    'environment',
    'postgres:host',
    'postgres:user',
    'postgres:password',
    'postgres:database',
]);
module.exports = nconf;
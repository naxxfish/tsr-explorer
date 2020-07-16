const nconf = require('nconf')

nconf.argv().env('__').file({ file: './config.json' })
nconf.defaults({
  environment: 'dev',
  postgres: {
    port: 5432,
    host: 'localhost'
  },
  log: {
    level: 'info'
  }
})

nconf.required([
  'environment',
  'postgres:host',
  'postgres:user',
  'postgres:password',
  'postgres:database'
])

module.exports = nconf

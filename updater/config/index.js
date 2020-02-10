const nconf = require('nconf')
const path = require('path')

nconf.argv().env('__').file({ file: path.join(__dirname, 'config.json') })
nconf.defaults({
  environment: 'dev',
  feeds: {
    port: 61618,
    system_name: 'tsr-viewer',
    durability: true
  },
  tsr_logfile: 'tsrs.jsonl',
  rtppm_logfile: 'rtppm.jsonl',
  postgres: {
    port: 5432
  }
})

nconf.required([
  'feed:host',
  'feed:username',
  'feed:password',
  'environment',
  'postgres:host',
  'postgres:user',
  'postgres:password',
  'postgres:database'
])

module.exports = nconf

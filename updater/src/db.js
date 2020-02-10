const config = require('../config')
const Pool = require('pg').Pool
const pgConnectionSettings = {
  user: config.get('postgres:user'),
  host: config.get('postgres:host'),
  password: config.get('postgres:password'),
  database: config.get('postgres:database'),
  port: config.get('postgres:port')
}

const pool = new Pool(pgConnectionSettings)

module.exports = {
  query: (text, params) => {
    return pool.query(text, params)
  }
}

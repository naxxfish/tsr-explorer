const { Pool } = require('pg');
const config = require('../config')

const pgConnectionSettings = {
  user: config.get('postgres:user'),
  host: config.get('postgres:host'),
  password: config.get('postgres:password'),
  database: config.get('postgres:database'),
  port: config.get('postgres:port'),
  max: 5
}

const pool = new Pool(pgConnectionSettings)

module.exports = {
  query: (text, params) => {
    return pool.query(text, params)
  },
  getClient: () => {
    return pool.connect()
  }
}

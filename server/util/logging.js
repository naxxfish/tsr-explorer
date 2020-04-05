const pino = require('pino')
const config = require('../config')
const expressPino = require('express-pino-logger')

const logger = pino(
    {
        level: config.get('log:level')
    }
)

module.exports = {
    use: function (app) {
        app.use(expressPino({ logger }))
    },
    logger
}
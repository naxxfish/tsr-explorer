const express = require('express');
const routes = require('./routes');
const Pool = require('pg').Pool;
const config = require('./config');
const logging = require('./util/logging')

const app = express();
logging.use(app);
routes(app);


app.listen(config.get('http:port'), () => {
    logging.logger.info(`TSR Explorer Backend listening on port ${config.get('http:port')}`)
});

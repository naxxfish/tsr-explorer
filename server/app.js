const express = require('express');
const routes = require('./routes');
const Pool = require('pg').Pool;
const config = require('./config');



const app = express();
routes(app);
app.use(express.static('/','./client'));

app.listen(config.get('http:port'), () => {
    console.log(`Listening on port ${config.get('http:port')}`)
});

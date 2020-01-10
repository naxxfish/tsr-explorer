const tsr = require('./tsr');
const routeInfo = require('./route_info');
module.exports = app => {
    app.use('/tsr', tsr);
    app.use('/routeInfo', routeInfo);
};

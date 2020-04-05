const tsr = require('./tsr');
const routeInfo = require('./route_info');
module.exports = app => {
    app.use('/api/tsr', tsr);
    app.use('/api/routes', routeInfo);
};

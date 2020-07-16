const tsr = require('./tsr');
const routes = require('././routes');
module.exports = app => {
    app.use('/api/tsr', tsr);
    app.use('/api/routes', routes);
};

const express = require('express');
const router = express.Router();
const TSRModel = require('../models/tsr')

router.get('/count', async (req, res) => {
    try {
        const tsrCount = await TSRModel.countTotal();
        res.send({
            total_tsrs: tsrCount
        });
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/by-route-code/:routeCode', async (req, res) => {
    try {
        const tsrsByRoute = await TSRModel.findByRoute(req.params['routeCode'], {
            historic: false
        })
        res.status(200).send(tsrsByRoute);
    } catch (e) {
        res.status(500).send(e);
        req.log.error(e);
    }
});

router.get('/by-route-group/:routeGroupCode', async (req, res) => {
    try {
        req.log.info(req.params['routeGroupCode'])
        if (isNaN(req.params['routeGroupCode'])) {
            res.status(500).send({
                status: 'error',
                message: 'Route group codes are always numbers'
            });
            return;
        }
        const tsrsByRouteGroup = await TSRModel.findByRouteGroup(parseInt(req.params['routeGroupCode']), {
            historic: false
        })
        res.status(200).send(tsrsByRouteGroup);
    } catch (e) {
        res.status(500).send(e);
        req.log.error(e);
    }
});

router.get('/by-reference/*', async (req, res) => {
    try {
        const tsrRecordResult = await TSRModel.findByTsrReference(req.params[0], { historic: false })
        res.status(200).send(tsrRecordResult);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;

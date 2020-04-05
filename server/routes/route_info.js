const express = require('express');
const router = express.Router();
const db = require('../db');
const reference = require('../util/reference');

/**
 * Get a list of unique route codes that have active TSRs
 */
router.get('/', async (req, res) => {
    try {
        req.log.info('looking up route codes in database')
        const routeCodesQuery = await db.query('SELECT DISTINCT route_group_code, route_group_name, route_code FROM tsrs')
        req.log.info('route code query came back')
        req.log.debug(routeCodesQuery)
        const routes = {}
        routeCodesQuery.rows.forEach((row) => {
            if (routes[row.route_group_code] === undefined) {
                routes[row.route_group_code] = {
                    groupName: row.route_group_name,
                    routeCodes: []
                }
            }
            routes[row.route_group_code].routeCodes.push(
                {
                    code: row.route_code,
                    name: reference.routeCodes[row.route_code]
                })
            if (routes[row.route_group_code].groupName !== row.route_group_name) {
                req.log.info(`Inconsistent route group names! '${routes[row.route_group_code].groupName}' is not '${row.route_group_name}'`)
                req.log.error(row)
                req.log.error(routes[row.route_group_code])
            }
        })
        res.status(200).send(routes)
    } catch (e) {
        req.log.error(e)
        res.status(500).send(e);
    }
})

router.get('/groups', async (req, res) => {
    req.log.info('request to groups')
    res.send({
        routeCodes: {
            '10': 'Scotland',
            '2526': 'London North Western (South)',
            '2551': 'East Midlands',
            '3': 'Anglia',
            '5': 'Western',
            '511': 'London North Eastern (South)',
            '512': 'London North Eastern (Central)',
            '513': 'London North Eastern (North)',
            '7': 'London North Western (North)',
            '8': 'Kent & Sussex',
            '9': 'Wessex'

        }
    });
});

module.exports = router;
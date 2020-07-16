const express = require('express');
const router = express.Router();
const db = require('../db');
const reference = require('../util/reference');

/**
 * Get a list of unique route codes that have active TSRs
 */
router.get('/all', async (req, res) => {
    try {
        res.status(200).send(reference.routeCodes)
    } catch (e) {
        req.log.error(e)
        res.status(500).send(e);
    }
})

router.get('/groups', async (req, res) => {
    req.log.info('request to groups')
    res.send({
        routeCodes: [
            { code: '10', name: 'Scotland' },
            { code: '2526', name: 'London North Western (South)' },
            { code: '2551', name: 'East Midlands' },
            { code: '3', name: 'Anglia' },
            { code: '5', name: 'Western' },
            { code: '511', name: 'London North Eastern (South)' },
            { code: '512', name: 'London North Eastern (Central)' },
            { code: '513', name: 'London North Eastern (North)' },
            { code: '7', name: 'London North Western (North)' },
            { code: '8', name: 'Kent & Sussex' },
            { code: '9', name: 'Wessex' }
        ]
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();

router.get('/groups', async (req, res) => {
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
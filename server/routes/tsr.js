const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');
const moment = require('moment');

router.get('/count', async (req, res) => {
    try {
        const tsrCount = await db.query('SELECT  COUNT(DISTINCT tsr_reference) AS total_tsrs FROM tsrs');
        if (tsrCount.rows[0]) {
            res.send(tsrCount.rows[0]);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/by-reference/*', async (req, res) => {
    try {
        const tsrRecordResult = await db.query('SELECT * FROM tsrs WHERE tsr_reference = $1 ORDER BY version LIMIT 1', [ req.params[0] ]);
        if (tsrRecordResult.rows[0]) {
            res.send(tsrRecordResult.rows[0]);
        } else {
            res.send({msg: 'No records'});
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/current/:area?', async (req, res) => {
    try {
        let tsrRecordResult;
        if (req.params['area'] !== undefined) {
            tsrRecordResult = await db.query(`
                SELECT * FROM tsrs alltsr 
                INNER JOIN 
                    (SELECT tsr_id, MAX(version) AS current_version FROM tsrs GROUP BY tsr_id) grouped_tsr
                ON grouped_tsr.tsr_id = alltsr.tsr_id AND grouped_tsr.current_version = alltsr.version
                WHERE 
                    alltsr.route_group_name = $2 AND
                    alltsr.valid_from < $1 AND
                    alltsr.valid_to > $1
                `, [ moment().toISOString(), req.params['area'] ]);
        } else {
            tsrRecordResult = await db.query(`
                SELECT * FROM tsrs alltsr 
                INNER JOIN 
                    (SELECT tsr_id, MAX(version) AS current_version FROM tsrs GROUP BY tsr_id) grouped_tsr
                ON grouped_tsr.tsr_id = alltsr.tsr_id AND grouped_tsr.current_version = alltsr.version
                WHERE 
                alltsr.valid_from < $1 AND
                alltsr.valid_to > $1`,
                [ moment().toISOString() ]);
        }
        
        if (tsrRecordResult.rows[0]) {
            res.send(tsrRecordResult.rows);
        } else {
            res.send({msg: 'No records'});
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/all/:area?', async (req, res) => {
    try {
        let tsrRecordResult;
        if (req.params['area'] !== undefined) {
            tsrRecordResult = await db.query(`
                SELECT * FROM tsrs alltsr 
                INNER JOIN 
                    (SELECT tsr_id, MAX(version) AS current_version FROM tsrs GROUP BY tsr_id) grouped_tsr
                ON grouped_tsr.tsr_id = alltsr.tsr_id AND grouped_tsr.current_version = alltsr.version
                WHERE alltsr.route_group_name = $1`, [ req.params['area'] ]);
        } else {
            tsrRecordResult = await db.query(`
                SELECT * FROM tsrs alltsr 
                INNER JOIN 
                    (SELECT tsr_id, MAX(version) AS current_version FROM tsrs GROUP BY tsr_id) grouped_tsr
                ON grouped_tsr.tsr_id = alltsr.tsr_id AND grouped_tsr.current_version = alltsr.version`);
        }
        
        if (tsrRecordResult.rows[0]) {
            res.send(tsrRecordResult.rows);
        } else {
            res.send({msg: 'No records'});
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;

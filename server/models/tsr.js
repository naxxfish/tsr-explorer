const db = require('../db');
const moment = require('moment');
const reference = require('../util/reference');

function hydrateTsrArrayWithReferenceData(tsrArray) {
    tsrArray.map(row => {
        row.route_name = reference.routeCodes[row.route_code]
        return row
    })
    return tsrArray
}

module.exports = {
    countTotal: async function (config) {
        let whereClause = "";
        let valueParams = [];
        if (config && config.historic !== undefined) {
            whereClause = 'WHERE valid_from < $1 AND valid_to > $1',
            valueParams = [ moment().toISOString() ]
        }
        const tsrCount = await db.query(`SELECT COUNT(DISTINCT tsr_reference) AS total_tsrs FROM tsrs ${whereClause}`, valueParams);
        if (tsrCount.rows[0]) {
            return tsrCount.rows[0].total_tsrs;
        } else {
            return 0;
        }
    },
    findByRoute: async function (routeCode, config) {
        let whereClause = "";
        let valueParams = [ routeCode ];
        if (config && config.historic) {
            whereClause = 'AND valid_from < $2 AND valid_to > $2',
            valueParams = [ routeCode, moment().toISOString() ]
        }
        const tsrByRouteCode = await db.query(`
        SELECT * FROM tsrs tsrs1 
            WHERE tsrs1.version = (SELECT max(version) FROM tsrs tsrs2 WHERE tsrs2.tsr_id = tsrs1.tsr_id) 
            AND route_code = $1 ${whereClause}`, 
            valueParams);
            
        return hydrateTsrArrayWithReferenceData(tsrByRouteCode.rows);
    },
    findByRouteGroup: async function (routeGroupId, config) {
        let whereClause = "";
        let valueParams = [ routeGroupId ];
        if (config && config.historic) {
            whereClause = 'AND valid_from < $2 AND valid_to > $2',
            valueParams = [ routeGroupId, moment().toISOString() ]
        }
        const tsrRecordResult = await db.query(`SELECT * FROM tsrs WHERE route_group_code = $1 ${whereClause} ORDER BY version DESC LIMIT 1`, valueParams);
        return hydrateTsrArrayWithReferenceData(tsrRecordResult.rows);
    },
    findByTsrReference: async function (tsrReference, config) {
        let whereClause = "";
        let valueParams = [ tsrReference ];
        if (config && config.historic) {
            whereClause = 'AND valid_from < $2 AND valid_to > $2',
            valueParams = [ tsrReference, moment().toISOString() ]
        }
        const tsrRecordResult = await db.query(`SELECT * FROM tsrs WHERE tsr_reference = $1 ${whereClause} ORDER BY version DESC LIMIT 1`, valueParams);
        return hydrateTsrArrayWithReferenceData(tsrRecordResult.rows);
    }
}
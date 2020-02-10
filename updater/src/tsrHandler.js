const config = require('../config')
const db = require('./db')
const fs = require('fs')
const moment = require('moment')

const TSR_LOGFILE_NAME = config.get('tsr_logfile')
function logTsrMessage (tsrMessage) {
  fs.appendFileSync(TSR_LOGFILE_NAME, JSON.stringify(tsrMessage) + '\n')
}

function tsrReformatData (inputDate) {
  return moment.unix((parseInt(inputDate) / 1000).toFixed(0)).toISOString()
}

function handleTSRBatchMsgV1 (tsrMessage) {
  const batchMessage = tsrMessage['TSRBatchMsg']
  logTsrMessage(batchMessage)
  /*
    const wonData = {
        routeGroup: batchMessage.routeGroup,
        routeGroupCode: batchMessage.routeGroupCode,
        publishSource: batchMessage.publishSource,
        WONStartDate: tsrReformatData(batchMessage.WONStartDate),
        WONEndDate: tsrReformatData(batchMessage.WONEndDate)
    } */
  batchMessage.tsr.forEach(async (tsr) => {
    let version = 1
    try {
      const versionRes = await db.query('SELECT max(version) FROM tsrs WHERE tsr_id = $1', [tsr.TSRID])
      if (versionRes.rowCount === 1 && versionRes.rows[0].max !== null) {
        version = versionRes.rows[0].max + 1
      }
    } catch (e) {
      console.log(`couldnt query for previous version ${e}`)
    }
    const compoundKey = `${tsr.TSRReference}_${version}`
    const dbFieldToValueMap = {
      version: version,
      tsr_key: compoundKey,
      tsr_id: tsr.TSRID,
      tsr_reference: tsr.TSRReference,
      creation_date: tsrReformatData(tsr.creationDate),
      publish_date: tsrReformatData(tsr.publishDate),
      route_code: tsr.RouteCode,
      route_order: tsr.RouteOrder,
      from_location: tsr.FromLocation,
      to_location: tsr.ToLocation,
      line_name: tsr.LineName,
      subunit_type: tsr.SubunitType,
      mileage_from: tsr.MileageFrom,
      mileage_to: tsr.MileageTo,
      subunit_from: tsr.SubunitFrom,
      subunit_to: tsr.SubunitTo,
      speed_passenger: tsr.PassengerSpeed,
      speed_freight: tsr.FreightSpeed,
      valid_from: tsrReformatData(tsr.ValidFromDate),
      valid_to: tsrReformatData(tsr.ValidToDate),
      reason: tsr.Reason,
      comments: tsr.Comments,
      requestor: tsr.Requestor,
      direction: tsr.Direction,
      route_group_name: tsr.RouteGroupName,
      won_valid_from: (tsr.WONValidFrom) ? tsrReformatData(tsr.WONValidFrom) : null,
      won_valid_to: (tsr.WONValidTo) ? tsrReformatData(tsr.WONValidTo) : null,
      last_published_in_won: batchMessage.publishSource,
      route_group_code: parseInt(batchMessage.routeGroupCode)
    }
    let columnNames = []
    let valuesPlaceholders = []
    let values = []
    let i = 1
    Object.keys(dbFieldToValueMap).forEach((field) => {
      columnNames.push(field)
      valuesPlaceholders.push(`$${i++}`)
      values.push(dbFieldToValueMap[field])
    })
    const query = `INSERT INTO tsrs (${columnNames.join(',')}) VALUES(${valuesPlaceholders.join(',')})`
    try {
      const insertResponse = await db.query({
        text: query,
        values
      })
      console.log(`inserted ${insertResponse.rowCount} rows`)
    } catch (e) {
      throw new Error(`Couldn't insert TSR record: ${e}`)
    }
  })
}

module.exports = handleTSRBatchMsgV1

const db = require('../db')
const config = require('../config')
const fs = require('fs')
const parse = require('csv-parse')
const moment = require('moment')
const crypto = require('crypto')

function clearLocations () {
  return db.query(`DELETE FROM "locations"`)
}

function clearLinks () {
  return db.query(`DELETE FROM "links"`)
}

module.exports = async function step () {
  const BPLAN_FILE = config.get('files:bplan')
  if (!fs.existsSync(BPLAN_FILE)) {
    console.error('[importBplan] Input file does not exist!')
    throw new Error('BPLAN file does not exist')
  }

  console.log('[importBplan] Streaming input file')
  const bplanRecords = fs.createReadStream(BPLAN_FILE).pipe(parse({
    skip_empty_lines: true,
    relax_column_count: true,
    delimiter: '\t'
  }))
  clearLinks()
  clearLocations()
  console.log('[importBplan] inserting into database')
  let locations = 0
  let networkLinks = 0
  let timingLinks = 0
  let referenceRecords = 0
  let recordCount = 0
  for await (const record of bplanRecords) {
    recordCount++
    if ((recordCount % 100) === 0) {
      console.log(`[importBplan] Records: ${recordCount} locations: ${locations} timingLink: ${timingLinks} networkLink: ${networkLinks} `)
    }
    const row = {
      recordType: record[0],
      actionCode: record[1],
      remainingFields: record.slice(2)
    }
    try {
      switch (row.recordType) {
        case 'LOC':
          locations++
          const location = parseLocationRow(row.remainingFields)
          await insertRow('locations', location)
          break
        case 'NWK':
          networkLinks++
          const networkLink = parseNetworkLink(row.remainingFields)
          await insertRow('links', networkLink)
          break
        /*case 'TLK':
          timingLinks++
          const timingLink = parseTimingLink(row.remainingFields)
          await insertRow('links', timingLink)
          break
        */
        case 'REF':
          referenceRecords++
          const referenceEntry = parseReference(row.remainingFields)
          await insertRow('reference', referenceEntry)
      }
    } catch (e) {
      console.error(`[importBplan] Problem importing BPLAN row: ${e.message}`)
      console.error(record)
    }
  }
  console.log('[importBplan] Finished!')
  console.log(`[importBplan] Records: ${recordCount} locations: ${locations} timingLink: ${timingLinks} networkLink: ${networkLinks} `)
}

async function insertRow (tableName, row) {
  const fieldNames = []
  const values = []
  const valuePlaceholders = []
  let i = 1
  for (let [key, value] of Object.entries(row)) {
    fieldNames.push(`"${key}"`)
    values.push(value)
    valuePlaceholders.push(`$${i}`)
    i++
  }
  return db.query(`INSERT INTO ${tableName} (${fieldNames.join(', ')}) VALUES(${valuePlaceholders.join(', ')})`, values)
}

function parseBplanDate (bplanDate) {
  if (bplanDate === '' || bplanDate === undefined) {
    return null
  }
  if (bplanDate.match(/\w+/)) {
    return moment(bplanDate.trim(), 'DD-MM-YYYY HH:mm:ss')
  } else {
    return null
  }
}

function parseLocationRow (locationFields) {
  return {
    locationCode: locationFields.shift(),
    locationName: locationFields.shift(),
    startDate: parseBplanDate(locationFields.shift()),
    endDate: parseBplanDate(locationFields.shift()),
    easting: locationFields.shift(),
    northing: locationFields.shift(),
    timingPointType: locationFields.shift(),
    zone: locationFields.shift(),
    stanoxCode: locationFields.shift(),
    offNetwork: locationFields.shift(),
    forceLPB: locationFields.shift()
  }
}

function parseNetworkLink (linkFields) {
  const link = {
    linkType: 'network',
    originLocation: linkFields.shift(),
    destinationLocation: linkFields.shift(),
    runningLineCode: linkFields.shift(),
    additionalLinkData: {
      runningLineDescription: linkFields.shift(),
      startDate: linkFields.shift(),
      endDate: linkFields.shift(),
      initialDirection: linkFields.shift(),
      finalDirection: linkFields.shift(),
      distance: linkFields.shift(),
      dooPassenger: linkFields.shift(),
      dooNonPassenger: linkFields.shift(),
      radioElectricToken: linkFields.shift(),
      zone: linkFields.shift(),
      reversible: linkFields.shift(),
      powerSupply: linkFields.shift(),
      raNumber: linkFields.shift(),
      maxTrainLength: linkFields.shift()
    }
  }
  link.startDate = parseBplanDate(link.additionalLinkData.startDate)
  link.endDate = parseBplanDate(link.additionalLinkData.endDate)
  link.additionalLinkData = JSON.stringify(link.additionalLinkData)
  link.linkHash = crypto.createHash('sha1').update(JSON.stringify(link)).digest('base64')
  return link
}

function parseTimingLink (linkFields) {
  const link = {
    linkType: 'timing',
    originLocation: linkFields.shift(),
    destinationLocation: linkFields.shift(),
    runningLineCode: linkFields.shift(),
    additionalLinkData: {
      tractionType: linkFields.shift(),
      trailingLoad: linkFields.shift(),
      speed: linkFields.shift(),
      raGauge: linkFields.shift(),
      entrySpeed: linkFields.shift(),
      exitSpeed: linkFields.shift(),
      startDate: linkFields.shift(),
      endDate: linkFields.shift(),
      sectionalRunningTime: linkFields.shift(),
      description: linkFields.shift()
    }
  }
  link.startDate = parseBplanDate(link.additionalLinkData.startDate)
  link.endDate = parseBplanDate(link.additionalLinkData.endDate)
  link.additionalLinkData = JSON.stringify(link.additionalLinkData)
  link.linkHash = crypto.createHash('sha1').update(JSON.stringify(link)).digest('base64')
  return link
}

function parseReference (referenceFields) {
  const referenceRow = {
    type: referenceFields.shift(),
    code: referenceFields.shift(),
    value: referenceFields.shift()
  }
  return referenceRow
}

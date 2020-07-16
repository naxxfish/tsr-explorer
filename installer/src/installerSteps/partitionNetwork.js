const db = require('../db')
const { v4 } = require('uuid')
const crypto = require('crypto')

async function getLocations (pageSize, offset) {
  return db.query('SELECT "locationCode" from "locations" ORDER BY "locationCode" LIMIT $1 OFFSET $2', [pageSize, offset])
}

async function findNeighbours (originLocation) {
  const neighbourQuery = await db.query({
    text: `SELECT "destinationLocation" AS "nextHop", "originLocation" AS "lastHop", "additionalLinkData" from "links" WHERE ("originLocation" = $1 OR "destinationLocation" = $1) AND "linkType" = 'network     '`,
    values: [originLocation]
  })
  const neighbours = []
  neighbourQuery.rows.forEach((row) => {
    if (row.nextHop !== originLocation) {
      neighbours.push(row.nextHop)
    }
    if (row.lastHop !== originLocation) {
      neighbours.push(row.lastHop)
    }
  })
  return neighbours
}

function insertPartitionLink (location, partition) {
  return db.query({
    text: `INSERT INTO partitions (location, partition) VALUES($1, $2)`,
    values: [ location, partition ]
  })
}

async function clearPartitionsTable () {
  return db.query('DELETE FROM "partitions"')
}

function hashLocation (location) {
  const digest = crypto.createHash('sha1').update(location).digest('hex')
  return parseInt(`0x${digest}`)
}

module.exports = async function step () {
  await clearPartitionsTable()
  const PAGE_SIZE = 100
  let originLocationRows
  let originOffset = 0
  const processedLocations = []
  do {
    const { rows: originRows, rowCount } = await getLocations(PAGE_SIZE, originOffset)
    originLocationRows = rowCount
    for (let originRow of originRows) {
      const startingPoint = originRow.locationCode
      console.log(`[partitonNetwork] ${processedLocations.length} locations processed so far`)
      if (!processedLocations.includes(hashLocation(startingPoint))) {
        const partitionIdentifier = v4()
        const locationsToVisit = [ originRow.locationCode ]
        while (locationsToVisit.length > 0) {
          let currentLocationCode = locationsToVisit.shift()
          const possibleNextLocations = await findNeighbours(currentLocationCode)
          for (let candidateNextLocation of possibleNextLocations) {
            if (
              !(processedLocations.includes(hashLocation(candidateNextLocation))) &&
              !(locationsToVisit.includes(candidateNextLocation))
            ) {
              locationsToVisit.push(candidateNextLocation)
            }
          }
          await insertPartitionLink(currentLocationCode, partitionIdentifier)
          processedLocations.push(hashLocation(currentLocationCode))
        }
      }
    }
    originOffset += PAGE_SIZE
  } while (originLocationRows > 0)
}

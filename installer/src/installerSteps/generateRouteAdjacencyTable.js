const db = require('../db')
const crypto = require('crypto')

async function getPartitions () {
  return db.query('SELECT partition, COUNT(*) as count FROM "partitions" GROUP BY partition ORDER BY count DESC')
}

async function getLocations (pageSize, offset, partition) {
  return db.query('SELECT "location" from "partitions" WHERE "partition" = $3 ORDER BY "location" LIMIT $1 OFFSET $2', [pageSize, offset, partition])
}

async function enqueueRoute (origin, destination) {
  return db.query({
    text: 'INSERT INTO "routePlans" ("origin","destination","route") VALUES($1,$2,NULL)',
    values: [origin, destination]
  })
}

function hashLocation (location) {
  const digest = crypto.createHash('sha1').update(location).digest('hex')
  return parseInt(`0x${digest}`)
}

async function getUnplannedRoute () {
  const routeQuery = await db.query({
    text: 'SELECT "origin", "destination" FROM "routePlans" WHERE "route" IS NULL LIMIT 1'
  })
  if (routeQuery.rowCount === 0) {
    return null
  } else {
    return {
      origin: routeQuery.rows[0].origin,
      destination: routeQuery.rows[0].destination
    }
  }
}

async function updateRoutePlan (origin, destination, route) {
  const query = await db.query({
    text: 'UPDATE "routePlans" SET "route" = $1 WHERE "origin" = $2 AND "destination" = $3',
    values: [JSON.stringify(route), origin, destination]
  })
  if (query.rowCount === 0) {
    return null
  } else {
    return {
      origin: query.rows[0].origin,
      destination: query.rows[0].destination
    }
  }
}

async function findNeighbours (originLocation) {
  const neighbourQuery = await db.query({
    text: `SELECT "destinationLocation" AS "nextHop", "additionalLinkData" from "links" WHERE "originLocation" = $1 AND "linkType" = 'network     '`,
    values: [originLocation]
  })
  const neighbours = []
  neighbourQuery.rows.forEach((row) => {
    neighbours.push({
      locationCode: row.nextHop,
      distance: (isNaN(parseInt(row.additionalLinkData.distance))) ? 1000 : parseInt(row.additionalLinkData.distance) + 1000
    })
  })
  neighbours.sort((a, b) => {
    return a.distance - b.distance
  })
  return neighbours
}

function lowestCostNode (costs, processed) {
  return Object.keys(costs).reduce((lowest, node) => {
    if (lowest === null || costs[node] < costs[lowest]) {
      if (!processed.includes(hashLocation(node))) {
        lowest = node
      }
    }
    return lowest
  }, null)
}

async function findRoute (origin, destination) {
  const originNeighbours = await findNeighbours(origin)
  const parents = { }
  parents[destination] = null
  for (let child of originNeighbours) {
    parents[child.locationCode] = origin
  }
  const costs = {}
  costs[destination] = Infinity
  for (let child of originNeighbours) {
    costs[child.locationCode] = child.distance
  }
  const processed = []
  let currentNode
  console.log(`findRoute: [START] (${origin}->${destination}) costs: ${JSON.stringify(costs)} parents: ${JSON.stringify(parents)} processed: ${JSON.stringify(processed)}`)
  do {
    currentNode = lowestCostNode(costs, processed)
    let cost = costs[currentNode]
    let currentNodeNeighbours = await findNeighbours(currentNode)
    for (let neighbour of currentNodeNeighbours) {
      let newCost = cost + neighbour.distance
      if (!costs[neighbour.locationCode]) {
        costs[neighbour.locationCode] = newCost
        parents[neighbour.locationCode] = currentNode
      }
      if (costs[neighbour.locationCode] > newCost) {
        costs[neighbour.locationCode] = newCost
        parents[neighbour.locationCode] = currentNode
      }
    }
    console.log(`findRoute: [IN-PROGRESS] (${origin}->${destination}) costs: ${JSON.stringify(costs)} parents: ${JSON.stringify(parents)} processed: ${JSON.stringify(processed)}`)
    if (!processed.includes(hashLocation(currentNode))) {
      processed.push(hashLocation(currentNode))
    }
  } while (currentNode)

  console.log(`findRoute: [END] (${origin}->${destination}) costs: ${JSON.stringify(costs)} parents: ${JSON.stringify(parents)} processed: ${JSON.stringify(processed)}`)
  let optimalPath = [destination]
  let parent = parents[destination]
  while (parent) {
    optimalPath.push(parent)
    parent = parents[parent]
  }
  optimalPath.reverse()

  return [origin, destination, optimalPath]
}

async function clearRoutePlanTable () {
  return db.query('DELETE FROM "routePlans"')
}

module.exports = async function step () {
  const PAGE_SIZE = 100
  let originLocationRows = 1
  let originOffset = 0
  await clearRoutePlanTable()
  const partitionsQuery = await getPartitions()
  for (let partitionRow of partitionsQuery.rows) {
    const partition = partitionRow.partition
    console.log(`[${partition}] - planning routes for a partition with ${partitionRow.count} locations`)
    while (originLocationRows > 0) {
      const { rows: originRows } = await getLocations(PAGE_SIZE, originOffset, partition)
      originLocationRows = originRows.length
      originRows.forEach(async (originRow) => {
        const origin = originRow.location
        let destinationLocationRows = 1
        let destinationOffset = 0
        while (destinationLocationRows > 0) {
          const { rows: destinationRows } = await getLocations(PAGE_SIZE, destinationOffset, partition)
          destinationLocationRows = destinationRows.length
          destinationRows.forEach(async (destinationRow) => {
            const destination = destinationRow.location
            if (origin !== destination) {
              await enqueueRoute(origin, destination)
            }
          })
          destinationOffset += PAGE_SIZE
        }
      })
      originOffset += PAGE_SIZE
    }
  }
  console.log(`ALL ROUTES HAVE BEEN ENQUEUED`)
  let routeQuery
  do {
    routeQuery = await getUnplannedRoute()
    const origin = routeQuery.origin
    const destination = routeQuery.destination
    console.log(`[${origin}->${destination}] starting routing`)
    const route = await findRoute(origin, destination)
    console.log(`[${origin}->${destination}] adding route to database`)
    await updateRoutePlan(origin, destination, route)
    console.log(`[${origin}->${destination}] finished routing`)
  } while (routeQuery != null)
}

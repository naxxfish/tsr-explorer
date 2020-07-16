const db = require('../db')

async function checkPartition (dbClient, origin, destination) {
  const originQuery = await dbClient.query('SELECT "partition" FROM "partitions" WHERE location = $1', [ origin ])
  if (originQuery.rowCount === 0) {
    throw new Error(`${origin} is not in the partition table`)
  }
  const originPartition = originQuery.rows[0].partition

  const destinationQuery = await dbClient.query('SELECT partition FROM "partitions" WHERE location = $1', [ origin ])
  if (destinationQuery.rowCount === 0) {
    throw new Error(`${destination} is not in the partition table`)
  }
  const destinationPartition = destinationQuery.rows[0].partition
  if (destinationPartition !== originPartition) {
    throw new Error(`${origin} and ${destination} are not in the same network partition`)
  }
  return true
}

async function lookupLocation (locationCode) {
  const query = await db.query({
    text: `SELECT "locationName", "locationCode" FROM locations WHERE "locationCode" = $1 LIMIT 1`,
    values: [ locationCode ]
  })

  if (query.rowCount === 0) {
    throw new Error('location not matched')
  }
  return {
    locationCode: query.rows[0].locationCode,
    locationName: query.rows[0].locationName
  }
}

function parseDistance (distanceString) {
  return (isNaN(parseInt(distanceString))) ? 1000 : parseInt(distanceString) + 100
}

async function getFrontier (dbClient, origins) {
  const frontrierQuery = await dbClient.query({
    name: 'get-frontier',
    text: `SELECT "originLocation", "destinationLocation", "additionalLinkData"->>'distance' as "distance" from "links" 
    WHERE "originLocation" = ANY ($1) AND 
    "linkType" = 'network     ' AND 
    ("endDate" IS NULL OR "endDate" > current_date) AND 
    "runningLineCode" != 'BUS'`,
    values: [origins]
  })
  return frontrierQuery.rows
}

async function findRoute (origin, destination) {
  const dbClient = await db.getClient()
  try {
    checkPartition(dbClient, origin, destination)
  } catch (e) {
    dbClient.release()
    throw new Error(`Partition check failed: ${e.message}`)
  }
  const processed = new Set([])
  let initialFrontier = await getFrontier(dbClient, [origin])
  if (initialFrontier.length === 0) {
    dbClient.release()
    throw new Error('Origin location has no neighbours')
  }
  const parents = {}
  const costs = {}
  parents[destination] = null
  costs[destination] = Infinity
  for (let child of initialFrontier) {
    parents[child.destinationLocation] = child.originLocation
    costs[child.destinationLocation] = parseDistance(child.distance)
  }
  let nextFrontierList = []
  do {
    nextFrontierList = Object.keys(costs).filter((node) => {
      const beenProcessed = processed.has(node)
      if (!beenProcessed) {
        processed.add(node)
      }
      return !beenProcessed
    })

    let nextFrontier = await getFrontier(dbClient, nextFrontierList)
    for (let nextLink of nextFrontier) {
      if (nextLink.originLocation !== destination) {
        let cost = costs[nextLink.originLocation]
        let newCost = cost + parseDistance(nextLink.distance)
        if (!costs[nextLink.destinationLocation]) {
          costs[nextLink.destinationLocation] = newCost
          parents[nextLink.destinationLocation] = nextLink.originLocation
        }
        if (costs[nextLink.destinationLocation] > newCost) {
          costs[nextLink.destinationLocation] = newCost
          parents[nextLink.destinationLocation] = nextLink.originLocation
        }
      }
    }
  } while (nextFrontierList.length > 0)

  if (costs[destination] === Infinity) {
    dbClient.release()
    throw new Error(`No route between ${origin} and ${destination}`)
  }
  let optimalPath = [destination]
  let parent = parents[destination]
  while (parent !== false) {
    optimalPath.unshift(parent)
    parent = (parents[parent] !== origin) ? parents[parent] : false
  }
  optimalPath.unshift(origin)
  dbClient.release()
  return optimalPath
}

module.exports = async function step () {
  const origin = 'BHAMNWS'
  const destination = 'LTNBZRD'
  try {
    console.log(`[${origin}->${destination}] starting routing`)
    console.time('findRoute')
    const route = await findRoute(origin, destination)
    console.timeEnd('findRoute')
    console.log(`[${origin}->${destination}] found route!`)
    for (let hop of route) {
      const locationName = (await lookupLocation(hop)).locationName
      console.log(`-> ${hop} - ${locationName}`)
    }
    console.log(`[${origin}->${destination}] finished routing`)
  } catch (e) {
    console.error(`Cannot plan route: ${e.message}`)
  }
}

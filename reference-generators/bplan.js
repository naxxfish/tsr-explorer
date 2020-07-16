const argv = require('yargs').argv
const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const windows1252 = require('windows-1252')

function main () {
  const BPLAN_FILE = argv.file
  if (!fs.existsSync(BPLAN_FILE)) {
    console.error('Input file does not exist!')
    process.exit(1)
  }
  
  console.log('Loading input file ...')
  const bplanFileContents = fs.readFileSync(BPLAN_FILE)
  console.log('Finished loading file.')
  console.log('Decoding')
  
  console.log('Extracting all rows')
  const bplanRecords = parse(bplanFileContents, {
    skip_empty_lines: true,
    relax_column_count: true,
    delimiter: '\t',
    to: 20000
  })
  const outputObject = {
    locations: {},
    links: []
  }
  bplanRecords.forEach((record) => {
    if (!record) {
      return
    }
    const row = {
      recordType: record[0],
      actionCode: record[1],
      remainingFields: record.slice(2)
    }
    switch (row.recordType) {
      case 'LOC':
        const location = parseLocationRow(row.remainingFields)
        outputObject.locations[location.locationCode] = location
        break
      case 'NWK':
        const networkLink = parseNetworkLink(row.remainingFields)
        outputObject.links.push(networkLink)
        break
      case 'TLK':
        const timingLink = parseTimingLink(row.remainingFields)
        outputObject.links.push(timingLink)
        break
    }
  })
  console.log('Writing JSON to file')
  fs.writeFileSync('output.json', JSON.stringify(outputObject,null,2))
  console.log('And done') 
}

function parseLocationRow (locationFields) {
  return {
    locationCode: locationFields.shift(),
    locationName: locationFields.shift(),
    startDate: locationFields.shift(),
    endDate: locationFields.shift(),
    easting: locationFields.shift(),
    northing: locationFields.shift(),
    timingPointType: locationFields.shift(),
    zone: locationFields.shift(),
    stanox: locationFields.shift(),
    offNetwork: locationFields.shift(),
    forceLPB: locationFields.shift()
  }
}

function parseNetworkLink (linkFields) {
  return {
    linkType: 'network',
    originLocation: linkFields.shift(),
    destinationLocation: linkFields.shift(),
    runningLineCode: linkFields.shift(),
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

function parseTimingLink (linkFields) {
  return {
    linkType: 'timing',
    originLocation: linkFields.shift(),
    destinationLocation: linkFields.shift(),
    runningLineCode: linkFields.shift(),
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

main()


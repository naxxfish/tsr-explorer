const argv = require('yargs').argv
const fs = require('fs')

function main () {
  const ROUTECODES_FILE = argv.routecodes
  if (!fs.existsSync(ROUTECODES_FILE)) {
    console.error('Input file does not exist!')
    process.exit(1)
  }
  const BPLAN_FILE = argv.bplan
  if (!fs.existsSync(BPLAN_FILE)) {
    console.error('Input file does not exist!')
    process.exit(1)
  }

  console.log('locating routecodes file')
  const routeCodesFileContents = fs.readFileSync(ROUTECODES_FILE)
  console.log('parsing routecodes file')
  const routeCodes = JSON.parse(routeCodesFileContents)

  console.log('locating bplan file')
  const bplanFileContents = fs.readFileSync(BPLAN_FILE)
  console.log('parsing bplan file')
  const bplan = JSON.parse(bplanFileContents)
  console.log('Done, lets lookup some locations')
  for (let [key, value] of Object.entries(routeCodes)) {
    // split into two locations
    let [from, to] = value.split(/ to /)
    if (to === undefined) {
      to = from
    }
    //console.log(`from: ${from} || to: ${to}`)
    to = to.replace(/ *\([^)]*\) */g, "")
    from = from.replace(/ *\([^)]*\) */g, "")
    //console.log(`from: ${from} || to: ${to}`)
    toTiploc = findLocation(to, bplan)
    fromTiploc = findLocation(from, bplan)
    
    console.log(`from: ${from} ${fromTiploc} || to: ${to} ${toTiploc}`)
  } 
}

function findLocation (location, bplan) {
  for (let [tiploc, locationRow] of Object.entries(bplan)) {
    if (locationRow.locationName.match(`^(${location})\.?$`)) {
      return tiploc
    }
  }
  return null
}

main()

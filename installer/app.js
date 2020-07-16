console.log('TSR Viewer installer')
async function main () {
  //await require('./src/installerSteps/initialiseBplanData')()
  //await require('./src/installerSteps/partitionNetwork')()
  await require('./src/installerSteps/testRoutePlanning')()
}
main()

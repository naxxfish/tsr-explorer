const stompConnection = require('./src/stompConnect')
const handleTSRBatchMsgV1 = require('./src/tsrHandler')
const handleRTPPMDataMsgV1 = require('./src/rtppmHandler')

function handleMessage (stompClient, message) {
  message.readString('utf-8', (error, messageString) => {
    if (error) {
      console.log(`error reading message: ${error}`)
      stompClient.nack(message)
      return
    }
    let parsedMessage
    try {
      parsedMessage = JSON.parse(messageString)
    } catch (e) {
      console.error(`Malformed JSON message recieved: ${e}`)
      stompClient.nack(message)
      return
    }
    const topLevelKeys = Object.keys(parsedMessage)
    topLevelKeys.forEach((topLevelKey) => {
      switch (topLevelKey) {
        case 'TSRBatchMsgV1':
          handleTSRBatchMsgV1(parsedMessage['TSRBatchMsgV1'])
          break
        case 'RTPPMDataMsgV1':
          handleRTPPMDataMsgV1(parsedMessage['RTPPMDataMsgV1'])
          break
        default:
          console.error(`Unknown top level message ${topLevelKey} recieved`)
      }
    })
  })
}

function main () {
  stompConnection.connect(handleMessage)
  console.log('listening for data')
}

main()

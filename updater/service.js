const stompConnection = require('./src/stompConnect')
const handleTSRBatchMsgV1 = require('./src/tsrHandler')
const handleRTPPMDataMsgV1 = require('./src/rtppmHandler')
const config = require('./config')
const fs = require('fs')

function handleMessage (messageString) {
  let parsedMessage
  try {
    parsedMessage = JSON.parse(messageString)
  } catch (e) {
    throw new Error(`Malformed JSON message recieved: ${e}`)
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
}

function handleStompMessage (stompClient, message) {
  message.readString('utf-8', (error, messageString) => {
    if (error) {
      console.log(`error reading message: ${error}`)
      stompClient.nack(message)
      return
    }
    try {
      handleMessage(messageString)
    } catch (e) {
      console.error(`Malformed JSON message recieved: ${e}`)
      stompClient.nack(message)
    }
  })
}

function main () {
  if (config.get('initial_log_file') !== undefined) {
    const readline = require('readline')
    const fileIn = fs.createReadStream(config.get('initial_log_file'))
    const rl = readline.createInterface({
      input: fileIn
    })
    rl.on('line', (line) => {
      try {
        const TSRMessage = JSON.parse(line)
        handleTSRBatchMsgV1({ TSRBatchMsg: TSRMessage })
      } catch (e) {
        console.error(e)
      }
    })
  }
  stompConnection.connect(handleStompMessage)
  console.log('listening for data')
}

main()

const config = require('../config');
const fs = require('fs');
const moment = require('moment');

const RPPM_LOGFILE_NAME = config.get('rtppm_logfile');

function logRtppmMessage(rtppmMessage) {
    fs.appendFileSync(RPPM_LOGFILE_NAME, JSON.stringify(rtppmMessage) + '\n');
}

function printRTPPMReport(rtppmMessage) {
    if (rtppmMessage.RTPPMData.NationalPage.WebFixedMsg1) {
        console.log(rtppmMessage.RTPPMData.NationalPage.WebFixedMsg1);
    }
    if (rtppmMessage.RTPPMData.NationalPage.WebFixedMsg2) {
        console.log(rtppmMessage.RTPPMData.NationalPage.WebFixedMsg2);
    }
    if (rtppmMessage.RTPPMData.NationalPage.WebMsgOfMoment) {
        console.log(rtppmMessage.RTPPMData.NationalPage.WebMsgOfMoment);
    }
    rtppmMessage.RTPPMData.NationalPage.Operator.forEach((operator) => {
        console.log(`${operator.name}: RAG: ${operator.PPM.rag}`)
    });
}

function handleRTPPMDataMsgV1(rtppmMessage) {
    logRtppmMessage(rtppmMessage);
    printRTPPMReport(rtppmMessage);
}

module.exports = handleRTPPMDataMsgV1;
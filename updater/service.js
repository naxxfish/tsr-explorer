const stompConnection = require('./src/stompConnect');
const config = require('./config');

const fs = require('fs');

const handleTSRBatchMsgV1 = require('./src/tsrHandler');
const handleRTPPMDataMsgV1 = require('./src/rtppmHandler');

function handleMessage(stompClient, message) {
    message.readString('utf-8', (error, messageString) => {
        if (error) {
            console.log('error reading message: ${error}');
            stompClient.nack(message);
            return;
        }
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(messageString);
        } catch (e) {
            console.error(`Malformed JSON message recieved: ${e}`);
            stompClient.nack(message);
            return;
        }
        const topLevelKeys = Object.keys(parsedMessage);
        topLevelKeys.forEach((topLevelKey) => {
            switch (topLevelKey) {
                case 'TSRBatchMsgV1':
                    handleTSRBatchMsgV1(parsedMessage['TSRBatchMsgV1']);
                    break;
                case 'RTPPMDataMsgV1':
                    handleRTPPMDataMsgV1(parsedMessage['RTPPMDataMsgV1']);
                    break;
                default: 
                    console.error(`Unknown top level message ${topLevelKey} recieved`);
            }
        });
    });
}

function main() {
    stompConnection.connect(handleMessage);
    console.log('listening for data');
}

main();

handleTSRBatchMsgV1(
{
            "schemaLocation": "http://xml.hiav.networkrail.co.uk/schema/net/tsr/1 net_tsr_messaging_v1.xsd",
            "owner": "Network Rail",
            "timestamp": "1422868697000",
            "originMsgId": "2015-02-02T09:18:23.718+00:00-9PPS",
            "classification": "industry",
            "systemEnvironmentCode": "Production",
            "Sender": {
                "organisation": "Network Rail",
                "application": "HUB",
                "applicationDomain": "net",
                "instance": "",
                "component": "",
                "userID": "",
                "sessionID": "",
                "conversationID": "",
                "messageID": ""
            },
            "Publication": {
                "TopicID": "TSR/9"
            },
            "TSRBatchMsg": {
                "routeGroup": "Wessex",
                "routeGroupCode": "9",
                "publishDate": "1422597602000",
                "publishSource": "WON_1415_46_F",
                "routeGroupCoverage": "full",
                "batchPublishEvent": "publishWON",
                "WONStartDate": "1423267260000",
                "WONEndDate": "1423871940000",
                "tsr": [
                    {
                        "TSRID": "105556",
                        "creationDate": "1390985378000",
                        "publishDate": "1422597602000",
                        "publishEvent": "nonSpecific",
                        "RouteGroupName": "Wessex",
                        "RouteCode": "SW105",
                        "RouteOrder": "701",
                        "TSRReference": "T2013/105556",
                        "FromLocation": "Wool",
                        "ToLocation": "Wool",
                        "LineName": "Up",
                        "SubunitType": "chains",
                        "MileageFrom": "126",
                        "SubunitFrom": "26",
                        "MileageTo": "123",
                        "SubunitTo": "45",
                        "MovingMileage": "false",
                        "PassengerSpeed": "50",
                        "FreightSpeed": "50",
                        "ValidFromDate": "1392026400000",
                        "ValidToDate": "64060675199000",
                        "Reason": "Condition Of Track",
                        "Requestor": "Network Rail Wessex (Eastleigh MDUM)",
                        "Comments": null,
                        "Direction": "up"
                    }
                ]
            }
        }
);

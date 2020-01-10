const Stomp = require('stompit');
const config = require('../config');


function dieGracefully(stompClient) {
    console.log('Disconnecting from STOMP');
    stompClient.disconnect(() => { process.exit(1) });
}

function stompClientError(error, stompClient, reconnect) {
    console.error(`STOMP client had an error: ${error} - reconnecting in 5 seconds`);
    setTimeout(reconnect, 5000);
}

function subscribeToTopic(stompClient, identifier, topic, messageHandler) {
    let subscribeHeaders = {
        'destination': topic,
        'ack': 'client-individual',
        'activemq.subscriptionName': `${config.get('feed:system_name')}-${identifier}-${config.get('environment')}`
    };

    stompClient.subscribe(subscribeHeaders, (subscribeError, message) => {
        if (subscribeError) {
            console.error(`Error with subscription to topic ${topic} - ${subscribeError}`);
            dieGracefully(stompClient);
        } else {
            console.log(`Subscribed to ${topic}`);
            messageHandler(stompClient, message);
        }
    });
}

function connect(messageHandler) {
    /**
    * Connect to the STOMP broker
    */
    const stompServers = [
        {
            host: config.get('feed:host'),
            port: config.get('feeds:port'),
            connectHeaders: {
                login: config.get('feed:username'),
                passcode: config.get('feed:password'),
                'heart-beat': '5000:5000',
                'client-id': `${config.get('feed:system_name')}-${config.get('feed:username')}-${config.get('environment')}`
            }
        }
    ];
    const reconnectOptions = {
        'maxReconnects': 30
    };
    const manager = new Stomp.ConnectFailover(stompServers, reconnectOptions);

    manager.connect((error, stompClient, reconnect) => {
        if (error) {
            console.error(`Fatal error connecting to STOMP: ${error}`);
            process.exit(1);
        }
        stompClient.on('error', () => { stompClientError(error, stompClient, reconnect) });
        process.once('SIGINT', () => { dieGracefully(stompClient) });
        /**
         * Subscribe to the topics
         */
        config.get('feed:topics').forEach((topic) => {
            subscribeToTopic(stompClient, topic.id, topic.topicName, messageHandler);
        });
    });
}
module.exports = {
    connect
};

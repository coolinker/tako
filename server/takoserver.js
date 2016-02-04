var WebSocketServer = require('ws').Server;
var http = require('http');
var ACCOUNT_TYPES = require("../accounttypes");
var feelerConnections = {};

var takoApiDispatcher = require("./takoapidispatcher.js");
require('./sslserver').setApiDispatcher(takoApiDispatcher);

var WebSocketServer = require('ws').Server;
var serverForWS = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

serverForWS.listen(8081, function() {
    console.log((new Date()) + ' Server is listening on port 8081');
});

wsServer = new WebSocketServer({
    server: serverForWS
});

wsServer.on('connection', function connection(ws) {
    console.log((new Date()) + ' Connection accepted.');
    ws.on('message', function(message) {
        console.log("onmessage", message)
        data = JSON.parse(message);

        if (takoApiDispatcher[data.action]) {
            takoApiDispatcher[data.action](data.body, function(responseJson) {
                console.log("onmessage callback", responseJson)
            }, ws);
        } else {
            console.log("action not existed in takoapidispatcher", data.aciton, data)
        }

    });

    ws.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + ws.remoteAddress + ' disconnected.');
    });
});

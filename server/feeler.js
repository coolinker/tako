var request = require("request");
var logutil = require("../logutil");
var simplehttp = require('../simplehttp');
var feelerController = require("./feelercontroller");
var takoIp = process.argv[2];

var WebSocket = require('ws');
var ws;
function registerFeeler() {
    if (ws) {
        logutil.log("Connection existed!");
    }
    ws = new WebSocket('ws://'+takoIp+":8081");
    
    feelerController.setWebSocket(ws);

    ws.on ('open', function (){
            logutil.log("Connection open!");
            var params = {
                action: "registerFeeler",
                body: ['lu', 'rrd']
            }
            ws.send(JSON.stringify(params), function(param){
                console.log("feeler send callback", param)
            });
    });

    ws.on('onerror',  function (error) {
        logutil.log("Connection failed:", error);
    });
     ws.on('close',  function (code) {
        logutil.log("Connection closed:", code);
        ws.terminate();
    });
    
    ws.on('message',  function (data, flags) {
        logutil.log("Connection message:", data, flags);
        data = JSON.parse(data);
        if (data.action === "registerFeeler") {
            console.log("Register feeler succeed!");
            return;
        }
        feelerController[data.action](data.body, function (responseJson) {
            if (responseJson) {
                ws.send(JSON.stringify(responseJson));
            }
        }) ;
    });
}

registerFeeler();


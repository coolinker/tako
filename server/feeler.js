var request = require("request");
var logutil = require("../logutil").config("feeler");
var simplehttp = require('../simplehttp');
var feelerController = require("./feelercontroller");
var takoIp = process.argv[2];
var services =  process.argv[3].split(',');
console.log("tako server ip:", takoIp, "services:", services);

var WebSocket = require('ws');
var ws;
function registerFeeler() {
    if (ws) {
        logutil.info("Connection existed!");
    }
    ws = new WebSocket('ws://'+takoIp+":8081");
    
    feelerController.setWebSocket(ws);

    ws.on ('open', function (){
            logutil.info("Connection open!");
            var params = {
                action: "registerFeeler",
                body: services
            }
            ws.send(JSON.stringify(params), function(param){
                console.log("feeler send callback", param)
            });
    });

    ws.on('onerror',  function (error) {
        logutil.info("Connection failed:", error);
    });
     ws.on('close',  function (code) {
        logutil.info("Connection closed:", code);
        ws.terminate();
    });
    
    ws.on('message',  function (data, flags) {
        logutil.info("Connection message:", data);
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


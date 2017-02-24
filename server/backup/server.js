var simplehttp = require('../simplehttp');
var httpProxy = require('http-proxy');
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    apiDispatcher = require("./serverapidispatcher"),
    port = process.argv[3] || 80,
    serverIp = process.argv[2] || "localhost";

var proxy = httpProxy.createProxyServer({
    target: {
        host: 'localhost',
        port: 8080
    }
});

var server = http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname;
    if (uri === "/api" && handleApiRequest(req, res)) {
        return;
    } else {
        if (req.url === "/index.html") {
            req.url = "/compositions/tako/client/takoclient.dre?screen=default";
        }
        proxy.web(req, res);
    }
   
}).listen(parseInt(port, 10));
server.on('upgrade', function(req, socket, head) {
    if (req.url === "/index.html") {
        req.url = "/compositions/tako/client/takoclient.dre?screen=default";
    }
    proxy.ws(req, socket, head);
});


console.log("Static file server running at\n  => http://"+serverIp+":" + port + "/\nCTRL + C to shutdown");

function handleApiRequest(request, response) {
    var query = url.parse(request.url, true).query;
    var action = query.action;
    // console.log("handleApiRequest", action);
    if (!apiDispatcher[action]) return false;
    if (request.method == 'POST') {
        var jsonString = '';

        request.on('data', function(data) {
            jsonString += data;
        });

        request.on('end', function() {
            var postJson = JSON.parse(jsonString);
            apiDispatcher[action](postJson, function(output) {
                response.writeHead(200, {
                    "Content-Type": "application/x-javascript; charset=utf-8",
                        // 'Content-Length': output.length
                    "Access-Control-Allow-Origin": "http://" + serverIp
                });
                response.write(output);
                response.end();
            });
        });
    }

    return true;
}

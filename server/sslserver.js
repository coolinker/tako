var https = require('https'),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    httpProxy = require('http-proxy'),
    os = require("os");

var port = 80;
var networkInterfaces = os.networkInterfaces();
var globalIPAddress =  process.argv[2] || (os.platform() === "linux" ? networkInterfaces.eth1[0].address :  networkInterfaces.WLAN[1].address);

console.log("globalIPAddress", globalIPAddress)
var apiDispatcher ;//= process.argv[2] === "tako" ? require("./takoapidispatcher.js") : require("./serverapidispatcher.js");
exports.setApiDispatcher = setApiDispatcher;
function setApiDispatcher(dispatcher) {
    apiDispatcher = dispatcher;
    return this;
}

var options = {
    key: fs.readFileSync('cert/server-key.pem'),
    cert: fs.readFileSync('cert/server-crt.pem'),
    ca: fs.readFileSync('cert/ca-crt.pem')
};

var proxy = httpProxy.createProxyServer({
    target: {
        host: 'localhost',
        port: 8080
    }
});

var server = http.createServer( function(req, res) {
    var uri = url.parse(req.url).pathname;
    if (uri === "/api" /*&& handleApiRequest(req, res)*/) {
        console.log("api should be using https...")
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

var sslserver = https.createServer(options, function(req, res) {
    var uri = url.parse(req.url).pathname;
    if (uri === "/api" && handleApiRequest(req, res)) {
        console.log("443 port api call", uri)
        return;
    } else {
        res.writeHead(301,
          {Location: 'http://'+globalIPAddress+'/index.html'}
        );
        res.end();
    }
 }).listen(443);

console.log("Static file server running at\n  => http://"+globalIPAddress+":" + port + "/\nCTRL + C to shutdown");

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
                    "Access-Control-Allow-Origin": "http://" + globalIPAddress
                });
                console.log("output", output)
                response.write(output);
                response.end();
            });
        });
    }

    return true;
}

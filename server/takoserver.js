var https = require('https'),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    httpProxy = require('http-proxy'),
    os = require("os");
var logutil = require("../logutil").config("takoserver");
var querystring = require('querystring');
var port = 443;
var networkInterfaces = os.networkInterfaces();
var globalIPAddress = process.argv[2] || (os.platform() === "linux" ? networkInterfaces.eth1[0].address : networkInterfaces['Wireless Network Connection'][1].address);
console.log("globalIPAddress", globalIPAddress)

var options = {
    key: fs.readFileSync('cert/server-key.pem'),
    cert: fs.readFileSync('cert/server-crt.pem'),
    ca: fs.readFileSync('cert/ca-crt.pem')
};


var sslserver = https.createServer(options, function (req, res) {
    var uri = url.parse(req.url).pathname;
    if (uri === "/api" && handleApiRequest(req, res)) {
        //logutil.info("443 port api call", uri)
        return;
    } else if (uri === "/test") {
        fs.readFile("test.html", "binary", function (err, file) {
            res.writeHead(200);
            res.write(file, "binary");
            res.end();
        });
    } else {
        res.writeHead(200);
        res.write("Wrong url");
        res.end();
    }
}).listen(port);

logutil.info("Static file server running at\n  => http://" + globalIPAddress + ":" + port + "/\nCTRL + C to shutdown");

function handleApiRequest(request, response) {
    var query = url.parse(request.url, true).query;
    var action = query.action;
    logutil.info("handleApiRequest", action);
    if (!apiDispatcher[action]) return false;
    if (request.method == 'POST') {
        var jsonString = '';

        request.on('data', function (data) {
            jsonString += data;
        });
        request.on('end', function () {
            var postJson = JSON.parse(jsonString);
            apiDispatcher[action](postJson, function (output) {
                response.writeHead(200, {
                    "Content-Type": "application/x-javascript; charset=utf-8",
                    // 'Content-Length': output.length
                    "Access-Control-Allow-Origin": "http://" + globalIPAddress
                });
                //logutil.info("output", output)
                response.write(output);
                response.end();
            });
        });
    }

    return true;
}


var takoController = require("./takocontroller");
var apiDispatcher = {
    updateAccount: function (json, callback) {
        var responseInfo = takoController.updateAccount(json.body, json.timestamp);
        callback(JSON.stringify({
            action: "updateAccount",
            body: responseInfo
        }));
    },

    feelerInfoIO: function (info, callback) {
        var accountJson = takoController.feelerInfoIO(info.body);
        callback(JSON.stringify({
            action: "feelerInfoIO",
            body: accountJson
        }));
    },

    // getAccounts: function(params, callback){
    //     var accountsJson = takoController.getAccounts(params);
    //     callback(JSON.stringify({
    //         action: "getAccounts",
    //         body: accountsJson
    //     }));
    // }

}
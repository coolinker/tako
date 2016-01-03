var https = require('https'),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    apiDispatcher = require("./apidispatcher");
port = process.argv[3] || 80,
serverIp = process.argv[2] || "localhost";

var httpProxy = require('http-proxy');

var options = {
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-crt.pem'),
    ca: fs.readFileSync('ca-crt.pem')
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
    // console.log("upgrade", req.url)
    proxy.ws(req, socket, head);
});

var sslserver = https.createServer(options, function(req, res) {
    var uri = url.parse(req.url).pathname;
    
    if (uri === "/api" && handleApiRequest(req, res)) {
        console.log("443 port api call", uri)
        return;
    } else {
        console.log("443 port", uri)
        //proxy.web(req, res);
        res.writeHead(301,
          {Location: 'http://'+serverIp+'/index.html'}
        );
        res.end();
    }
 }).listen(443);
// https.createServer(options, function(request, response) {
//     var uri = url.parse(request.url).pathname;
//     if (uri === "/api" && handleApiRequest(request, response)) {
//         return;
//     }
//     uri = "/app"+uri;
//     filename = path.join(process.cwd(), uri);

//     fs.exists(filename, function(exists) {
//         if (!exists) {
//             response.writeHead(404, {
//                 "Content-Type": "text/plain"
//             });
//             response.write("404 Not Found\n");
//             response.end();
//             return;
//         }

//         if (fs.statSync(filename).isDirectory()) filename += '/index.html';

//         fs.readFile(filename, "binary", function(err, file) {
//             if (err) {
//                 response.writeHead(500, {
//                     "Content-Type": "text/plain"
//                 });
//                 response.write(err + "\n");
//                 response.end();
//                 return;
//             }

//             response.writeHead(200);
//             response.write(file, "binary");
//             response.end();
//         });
//     });
// }).listen(parseInt(port, 10));

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

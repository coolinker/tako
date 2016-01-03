var request = require("request");
var pixelsUtil = require("get-pixels");
var logutil = require("./logutil");
exports.GET = sendGet;

function sendGet(url, options, callback) {
    options.uri = url;
    options.method = "GET";
    sendRequest(options, callback);
}

exports.POST = sendPost;
function sendPost(url, options, callback) {
    options.uri = url;
    options.method = "POST";
    sendRequest(options, callback);
}

exports.image = image;

function image(url, options, callback) {
    options.encoding = null;
    sendGet(url, options, function(err, response, body) {
        if (err) {
            callback(err)
            return
        }
        // console.log("response.headers", response.headers, body)
        var type = options.type;
        if (!type) {
            if (response.getHeader !== undefined) {
                type = response.getHeader('content-type');
            } else if (response.headers !== undefined) {
                type = response.headers['content-type'];
            }
        }

        //var type = "image/jpeg"//response.headers['content-type'];
        if (!type) {
            callback(new Error('Invalid content-type'))
            return
        }
        
        pixelsUtil(body, type, callback)
        
    })
}

// function sendRequest(url, method, options, callback) {
//     var timeout = options["../timeout"];
//     delete options["../timeout"];
//     var jar = options["../cookieJar"];
//     delete options["../cookieJar"];

//     var form = options;
//     request({
//         uri: url,
//         method: method,
//         form: form,
//         jar: jar,
//         timeout: timeout
//     }, function(error, response, body) {
//         callback(error, response, body);
//     });
// }

function sendRequest(options, callback) {
    if (options.cookieJar) {
        options.jar = options.cookieJar;
        delete options.cookieJar;
    }
    
    var req = request(options, function(error, response, body) {
        callback(error, response, body);
    });
    req.__options = options;
    
}

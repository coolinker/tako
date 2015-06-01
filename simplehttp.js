var request = require("request");

exports.GET = sendGet;
function sendGet(url, options, callback) {
    sendRequest(url, "GET", options, callback);
}
exports.POST = sendPost;
function sendPost(url, options, callback) {
    sendRequest(url, "POST", options, callback);
}

function sendRequest(url, method, options, callback) {
    var timeout = options["../timeout"];
    delete options["../timeout"];
    var jar = options["../cookieJar"];
    delete  options["../cookieJar"];
    var form = options;
    request({
        uri: url,
        method: method,
        form: form,
        jar: jar,
        timeout: timeout
    }, function(error, response, body) {
        callback(error, response, body);
    });
}

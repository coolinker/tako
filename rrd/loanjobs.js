require('seajs');
var loopjob = require("../loopjob").config({
    url:"http://www.renrendai.com/lend/loanList!json.action?pageIndex=1",
    loopInterval: 1000,
    responseHandler: function (error, request, body) {
        if (!error) {
            var json = JSON.parse(body);
            console.log(json.data.loans.length);
            console.log(json.data.loans[0]);
        }
    }
});

loopjob.startLooping();

var request = require("request");
var encrypt = require('./rsa');
var publicKey = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDMO0o8vYsqInbD/8uraIdWqP8Y\ncc7KQuLS7w0VbCWocyMRYu582LwzycBOPvbbEKt2feqpUKQ+F3peq+HQnI6gL9d6\n6l0ZG3KjflZTQJ8M847USfUNGVbAi3PJG/NiwQHddUUudmjIEAXwadelp/g+/p97\nYcBAz8caQDcEyI0AjQIDAQAB\n-----END PUBLIC KEY-----;";
var userName = "13810394810";
var password = "B3ijingr19";


// login(userName, password, publicKey, function(cookieJar) {
//     getUserInfo(cookieJar);
// })

function login(user, password, publicKey, callback) {
    var cncryptPassword = encrypt(password, publicKey);
    var cookieJar = request.jar();
    console.log("login:", user, password)
    sendPost('https://www.renrendai.com/j_spring_security_check', {
            j_username: user,
            j_password: cncryptPassword, //"Q/MynOar3B/EqCu8xzMiO5/Z+mAckfCnpjJaEUca4VQ+8dQVmV6qhUEyDl4WAZpCYhAVXLMZkTrLYnMcpGuvqbpOfyeGjYr7ReACixQH2GtDwGjWEtFQit92rTy0e8N37j9mPg+3g53TIknEGKBuAVj7+5P/6gYyZ0CsfSl4yxQ=",
            ememberme: "on",
            targetUrl: "http://www.renrendai.com/",
            returnUrl: ""
        },
        cookieJar,
        function(err, httpResponse, body) {
            var cookie_string = cookieJar.getCookieString("https://www.renrendai.com");
            console.log("cookie_string-----", cookie_string)
            callback(cookieJar);
        });
}

function getUserInfo(cookieJar) {
    var url = 'https://www.renrendai.com/account/getHomePageUserInfo.action?timeout=5000&_=' + new Date().getTime();
    sendGet(url, {}, cookieJar, function(error, request, body) {
        console.log("error", error)
        console.log("getUserInfo:", body);
    });
}

function sendGet(url, options, callback) {
    sendRequest(url, "GET", options, callback);
}

function sendPost(url, options, callback) {
    sendRequest(url, "POST", options, callback);
}

function sendRequest(url, method, options, callback) {
    var timeout = options["../timeout"];
    delete options["../timeout"];
    var jar = options["../cookieJar"];
    delete  options["../cookieJar"];
    request({
        uri: url,
        method: method,
        form: form,
        jar: jar
    }, function(error, response, body) {
        callback(error, response, body);
    });
}

// var NodeRSA = require('node-rsa');
// var d = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDMO0o8vYsqInbD/8uraIdWqP8Y\ncc7KQuLS7w0VbCWocyMRYu582LwzycBOPvbbEKt2feqpUKQ+F3peq+HQnI6gL9d6\n6l0ZG3KjflZTQJ8M847USfUNGVbAi3PJG/NiwQHddUUudmjIEAXwadelp/g+/p97\nYcBAz8caQDcEyI0AjQIDAQAB\n-----END PUBLIC KEY-----;";
// var key = new NodeRSA(d, "pkcs8-public-pem");

// var text = '123';
// var encrypted = key.encrypt(text, 'base64');
// console.log('encrypted: ', encrypted);

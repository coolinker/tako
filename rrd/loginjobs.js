require('seajs');
var logutil = require("../logutil");
var request = require("request");
var encrypt = require('./rsa');
var simplehttp = require('../simplehttp');
var publicKey = require("./publickey");

exports.login = login;
function login(logininfo, callback) {
    var user = logininfo.user;
    var password = logininfo.password;

    var cncryptPassword = encrypt(password, publicKey);
    var cookieJar = request.jar();
    logutil.log("login", user, cncryptPassword);
    simplehttp.POST('https://www.renrendai.com/j_spring_security_check', {
            j_username: user,
            j_password: cncryptPassword,
            ememberme: "on",
            targetUrl: "http://www.renrendai.com/",
            returnUrl: "",
            "../cookieJar": cookieJar
        },        
        function(err, httpResponse, body) {
            var cookie_string = cookieJar.getCookieString("https://www.renrendai.com");
            logutil.log("login function", cookie_string);

            if (cookie_string.indexOf("rrd_key")) {
                callback(cookieJar);
            } else {
                callback(null);
            }
        });
}

function getUserInfo(cookieJar) {
    var url = 'https://www.renrendai.com/account/getHomePageUserInfo.action?timeout=5000&_=' + new Date().getTime();
    sendGet(url, {}, cookieJar, function(error, request, body) {
        console.log("error", error)
        console.log("getUserInfo:", body);
    });
}



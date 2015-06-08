require('seajs');
var logutil = require("../logutil");
var request = require("request");
var encrypt = require('./rsa');
var simplehttp = require('../simplehttp');
var publicKey = require("./publickey");

exports.login = login;

function login(account, callback) {
    var user = account.user;
    var password = account.password;

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
                account.cookieJar = cookieJar;
                getUserInfo(account, function(userInfo) {
                    account.avaliableBalance = Number(userInfo.avaliableBalance.replace(",", ""));
                    callback(cookieJar);
                })                
            } else {
                callback(null);
            }


        });
}

exports.extendLogin = extendLogin;

function extendLogin(account, callback) {
    var url = 'https://www.renrendai.com/account/getHomePageUserInfo.action?timeout=5000&_=' + new Date().getTime();
    simplehttp.GET(url, {
        "../cookieJar": account.cookieJar
    }, function(error, request, body) {
        var cookieJar = account.cookieJar;
        var cookie_string = cookieJar.getCookieString("https://www.renrendai.com");
        if (cookie_string.indexOf("rrd_key")) {
            callback(cookieJar);
        } else {
            account.cookieJar = null;
            callback(null);
        }
    });
}

function getUserInfo(account, callback) {
    var url = 'https://www.renrendai.com/account/getHomePageUserInfo.action?timeout=5000&_=' + new Date().getTime();
    simplehttp.GET(url, {
        "../cookieJar": account.cookieJar
    }, function(error, request, body) {
        console.log("getUserInfo:", body);
        var info = JSON.parse(body);
        callback(info)
    });
}

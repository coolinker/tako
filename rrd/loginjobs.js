require('seajs');
var logutil = require("../logutil").config("rrdlogin");
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
    logutil.info("login", user, cncryptPassword);
    simplehttp.POST('https://www.we.com/j_spring_security_check', {
            form: {
                j_username: user,
                j_password: cncryptPassword,
                ememberme: "on",
                targetUrl: "http://www.we.com/",
                returnUrl: ""
            },
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            var cookie_string = cookieJar.getCookieString("https://www.we.com");
            if (cookie_string.indexOf("jforumUserInfo")>=0) {
                logutil.info("login succeed", account.user, account.source, cookie_string);
                account.cookieJar = cookieJar;
                getUserInfo(account, function(userInfo) {
                    account.availableBalance = Number(userInfo.availableBalance.replace(",", ""));
                    account.loginTime = new Date();
                    callback(cookieJar, account.JSONInfo());
                })                
            } else {
                console.log("cookie_string------:", cookie_string)
                console.log("body------:", body)
                callback(null, {"resultId":"01", resultMsg: "LOGIN_ERROR", failedMessage: "登录失败！"});
            }
        });
}

exports.extendLogin = extendLogin;

function extendLogin(account, callback) {
    var url = 'https://www.we.com/account/getHomePageUserInfo.action?timeout=5000&_=' + new Date().getTime();
    simplehttp.GET(url, {
        "cookieJar": account.cookieJar
    }, function(error, request, body) {
        var cookieJar = account.cookieJar;
        var cookie_string = cookieJar.getCookieString("https://www.we.com");
        if (cookie_string.indexOf("rrd_key")) {
            callback(cookieJar);
        } else {
            account.cookieJar = null;
            callback(null);
        }
    });
}

function getUserInfo(account, callback) {
    var url = 'https://www.we.com/account/getHomePageUserInfo.action?timeout=5000&_=' + new Date().getTime();
    simplehttp.GET(url, {
        "cookieJar": account.cookieJar
    }, function(error, request, body) {
        console.log("getUserInfo:", body);
        var info = JSON.parse(body);

        info.availableBalance = info.avaliableBalance
        callback(info)
    });
}

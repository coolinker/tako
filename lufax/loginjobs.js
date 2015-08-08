var request = require("request");

var captchaUtil = require('./captchautil.js');

var RSAKey = require('./rsa.js');
var logutil = require("../logutil");

var simplehttp = require('../simplehttp');
var htmlparser = require('../htmlparser');

exports.login = login;

function login(account, callback) {
    var user = account.user;
    var password = account.password;

    // var cncryptPassword = encrypt(password, publicKey);
    var cookieJar = request.jar();
    var rsakey = new RSAKey();

    logutil.log("login", user, password);

    simplehttp.GET('https://user.lufax.com/user/login', {
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {

            var publicKey = htmlparser.getValueFromBody('id="publicKey" name="publicKey" value="', '" />', body);
            var rsaExponent = htmlparser.getValueFromBody('id="rsaExponent" name="rsaExponent" value="', '" />', body);

            rsakey.setPublic(publicKey, rsaExponent);
            var cncryptPassword = rsakey.encrypt(password);
            // console.log("cncryptPassword", cncryptPassword)

            captchaUtil.guessCaptchaForLogin("login", cookieJar, function(captachStr) {
                doLogin(user, cncryptPassword, captachStr, cookieJar, function(info) {
                    account.availableBalance = info.availableFund;
                    account.uid = info.uid;
                    console.log("account.availableBalance:", account.availableBalance, account.uid)
                    callback(cookieJar, info);
                })
            })
        });
}

function doLogin(userNameLogin, cncryptPassword, captcha, cookieJar, callback) {
    simplehttp.POST('https://user.lufax.com/user/login?returnPostURL=http%3A%2F%2Fwww.lufax.com%2F&lufax_ref=http%3A%2F%2Fwww.lufax.com%2F', {
            form: {
                userNameLogin: userNameLogin,
                password: cncryptPassword,
                validNum: captcha
            },
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            var cookie_string = cookieJar.getCookieString("https://user.lufax.com");
            logutil.log("login status:", cookie_string.indexOf("lufaxSID") > 0, userNameLogin);
            if (cookie_string.indexOf("lufaxSID") < 0) {
                callback(null);
            } else {
                getUserInfo(cookieJar, callback);
            }
        });
}

function getUserInfo(cookieJar, callback) {
    simplehttp.GET('https://my.lufax.com/my/account?lufax_ref=http%3A%2F%2Fwww.lufax.com%2F', {
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            var info = htmlparser.getValueFromBody('<input id="assetOverview" type="hidden" value=\'', '\'/>', body);
            info = JSON.parse(info);
            // console.log("---------", info) 18270.60
            //callback(info);
            getUserId(cookieJar, function(json) {
                for (var att in json) {
                    info[att] = json[att];
                }
                callback(info);
            });
        });
}

function getUserId(cookieJar, callback) {
    simplehttp.GET('https://user.lufax.com/user/service/user/current-user-info-for-homepage', {
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            var info = JSON.parse(body);
            // console.log("---------", info) 18270.60
            callback(info);
        });
}
exports.extendLogin = extendLogin;

function extendLogin(account, callback) {
    login(account, callback);
}

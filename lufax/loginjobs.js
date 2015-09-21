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

    // logutil.log("login...", user);

    simplehttp.GET('https://user.lu.com/user/login', {
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {

            var publicKey = htmlparser.getValueFromBody('id="publicKey" name="publicKey" value="', '" />', body);
            var rsaExponent = htmlparser.getValueFromBody('id="rsaExponent" name="rsaExponent" value="', '" />', body);
            rsakey.setPublic(publicKey, rsaExponent);
            var cncryptPassword = rsakey.encrypt(password);

            // captchaAuthorize("PC", user, cookieJar, function(body) {
                captchaUtil.guessCaptchaForLogin("login", cookieJar, function(captachStr) {
                    doLogin(user, cncryptPassword, captachStr, cookieJar, function(info) {
                        account.cookieJar = cookieJar;
                        account.availableBalance = info.availableFund;
                        account.uid = info.uid;

                        console.log("account.availableBalance:", account.availableBalance, account.uid)
                        callback(cookieJar, info);
                    })
                })

            // })


        });
}

function captchaAuthorize(source, username, cookieJar, callback) {
    simplehttp.POST('https://user.lu.com/user/service/login/captcha-authorize', {
            form: {
                source: source,
                username: username
            },
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            callback(body)
        })
}

function doLogin(userNameLogin, cncryptPassword, captcha, cookieJar, callback) {
    simplehttp.POST('https://user.lu.com/user/login', {
            form: {
                userNameLogin: userNameLogin,
                password: cncryptPassword,
                validNum: captcha,
                loginagree: "on",
                isTrust: "Y"
            },
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            var cookie_string = cookieJar.getCookieString("https://user.lu.com");
            logutil.log("login status:", cookie_string.indexOf("lufaxSID") > 0, userNameLogin);
            if (cookie_string.indexOf("lufaxSID") < 0) {
                callback(null);
            } else {
                getUserInfo(cookieJar, callback);
            }
        });
}

function getUserInfo(cookieJar, callback) {
    simplehttp.GET('https://my.lu.com/my/account?lufax_ref=http%3A%2F%2Fwww.lu.com%2F', {
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            var info = htmlparser.getValueFromBody('<input id="assetOverview" type="hidden" value=\'', '\'/>', body);
            info = JSON.parse(info);
            if (!info) logutil.log("ERROR getUserInfo:", info)
            getUserId(cookieJar, function(json) {
                for (var att in json) {
                    info[att] = json[att];
                }
                callback(info);
            });
        });
}

function getUserId(cookieJar, callback) {
    simplehttp.GET('https://user.lu.com/user/service/user/current-user-info-for-homepage', {
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            var info = JSON.parse(body);
            // console.log("---------", info) 18270.60
            if (!info) logutil.log("ERROR getUserId:", body)
            callback(info);
        });
}
exports.extendLogin = extendLogin;

function extendLogin(account, callback) {
    login(account, function(cookieJar, info) {
        callback(cookieJar);
    });
}

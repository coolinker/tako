var request = require("request");
var captchaUtil = require('./captchautil.js');
var RSAKey = require('./rsa.js');
var logutil = require("../logutil").config('lulogin');
var simplehttp = require('../simplehttp');
var htmlparser = require('../htmlparser');
var mobileheaderutil = require("./mobileheaderutil");

exports.login = login;

function login(account, callback) {
    login_mobile(account, callback);
    //login_brwoser(account, callback)
}


function login_mobile(account, callback) {
    var publicKey, rsaExponent;
    var rsakey = new RSAKey();
    securityValid(function (pkey, exp) {
        if (!pkey) {
            callback(null);
            return;
        }

        publicKey = pkey;
        rsaExponent = exp;
        rsakey.setPublic(publicKey, rsaExponent);

        var cookieJar = request.jar();
        var cncryptPassword = rsakey.encrypt(account.password);

        //{"userNameLogin":"coolinker","password":"8139CA3D93FAA7D50498E37642EED8D106C486771DC220E22AE63BDF3545A394DD440790B33EA5DF30213940AED9EDC710EC05C7D70352FF9E45BABAF25EFFBC1A111BEBEFCD3632DFD2D47E9B2E300DD3BCCD621D15B2CBB4B27596C0A558913DBC822B0C2FBBE46B27563D47C52CEDEED743E9A6ED348B2951DFCBBA5BD5CB",
        //"validNum":"","IMVC":"","mobileSerial":"868191022314031"}
        //{"userNameLogin":"luhuiqing","password":"0A63B5746D1E545C76D9F39F2189D6FF7EA32FB9EA9CAF2A7D044B28B4B134301844088971AD36FDFF328E17E6008E4B4505AE8AD89E2D1065438661C94C8024E1D8D42C3FA8FDE600082180BE639655CFFCF759F916EC97B33E2A9962BBF634AAAD40F248B39DEC112686A9365659190CE4DD172D9EA6AD152C008C76F9FA32","validNum":"kwp7","IMVC":"","mobileSerial":"868191022314031"}
        captchaUtil.guessCaptchaForLogin("login", cookieJar, function (captachStr) {
            // var t = new Date().getTime() - 2345;
            // var sig = mobilesigutil.genSig(null, t);
            simplehttp.POST('https://ma.lu.com/mapp/service/public?M8001', {
                "cookieJar": cookieJar,
                form: {
                    requestCode: "M8001",
                    version: "3.4.9",
                    params: '{"userNameLogin":"' + account.user + '","password":"' + cncryptPassword + '","validNum":"' + captachStr + '","IMVC":"","mobileSerial":"868191022314031"}'
                },
                headers: mobileheaderutil.getHeaders()
                // {
                //     "mobile_agent": "appVersion:3.4.9,platform:android,osVersion:17,device:GT-P5210,resourceVersion:2.7.0,channel:H5",
                //     "X-LUFAX-MOBILE-DATA-AGENT": "qFgr54W0EdddXNHAEiURy9j3gNNZl1XtNIyKJrjynMS6LEhmOA1dqIM9+BhHucXUY1FcS/OK5No62MHrRqwHcm/lXEhbeygM8rp8Zevk9E2Ze7+1z3geqdnEDfAGN/eKFrgIzRQIR5jItWwVv8UZ6w==",
                //     "x-lufax-mobile-t": t,
                //     "x-lufax-mobile-signature": sig
                // }
            },
                function (err, httpResponse, body) {
                    var cookie_string = cookieJar.getCookieString("https://user.lu.com");
                    logutil.info("login status:", cookie_string.indexOf("lufaxSID") > 0, account.user);
                    if (cookie_string.indexOf("lufaxSID") < 0) {
                        callback(null);
                    } else {
                        var info = JSON.parse(body);
                        account.cookieJar = cookieJar;
                        account.uid = info.result.userOverview.userId;
                        account.loginTime = new Date();

                        userInfo_mobile(account, function (result) {
                            //account.uid = result.userInfo.userName;
                            // if (result.asset) {
                            //     account.availableBalance = Number(result.asset.availableAmount.text);
                            //     account.allIncomeAmount = Number(result.asset.allIncomeAmount.text);
                            //     account.ongoingTotalBuyBackAmount = Number(result.ongoingTotalBuyBackAmount);
                            //     account.totalAssets = account.allIncomeAmount + account.ongoingTotalBuyBackAmount/9;
                            // }
                            // logutil.info("account.availableBalance:", account.availableBalance, account.uid, account.totalAssets);
                            callback(cookieJar, account.JSONInfo());

                        });

                    }

                });
        });


    });
}

function userInfo_mobile(account, callback) {
    simplehttp.POST('https://ma.lu.com/mapp/service/private?M6057', {
        "cookieJar": account.cookieJar,
        form: {
            requestCode: "M6057",
            version: "3.4.9",
            params: '{"ver":"1.0" , "source":"android"}'
        },
        headers: mobileheaderutil.getHeaders(account.uid)
    },
        function (err, httpResponse, body) {

            var info = JSON.parse(body);
            if (info.code !== '0000') console.log(body);
            var result = info.result;
            totalBuyBack_mobile(account, function (buyback) {
                result.ongoingTotalBuyBackAmount = buyback;

                if (result.asset) {
                    account.availableBalance = Number(result.asset.availableAmount.text);
                    account.allIncomeAmount = Number(result.asset.allIncomeAmount.text);
                    account.ongoingTotalBuyBackAmount = Number(result.ongoingTotalBuyBackAmount);
                    account.totalAssets = account.allIncomeAmount + account.ongoingTotalBuyBackAmount / 9;
                }
                logutil.info("account.availableBalance:", account.availableBalance, account.uid, account.totalAssets);

                callback(result);
            })


        });
}

function totalBuyBack_mobile(account, callback) {
    simplehttp.POST('https://ma.lu.com/mapp/service/private?M3205', {
        "cookieJar": account.cookieJar,
        form: {
            requestCode: "M3205",
            version: "3.4.9",
            params: '{"type":"list","page":1}'
        },
        headers: mobileheaderutil.getHeaders(account.uid)
    },
        function (err, httpResponse, body) {

            var info = JSON.parse(body);
            var buyback = Number(info.result.ongoingTotalBuyBackAmount);

            callback(buyback);

        });
}


function login_brwoser(account, callback) {
    var user = account.user;
    var password = account.password;

    // var cncryptPassword = encrypt(password, publicKey);
    var cookieJar = request.jar();
    var rsakey = new RSAKey();

    //logutil.info("login...", user);

    simplehttp.GET('https://user.lu.com/user/login', {
        "cookieJar": cookieJar
    },
        function (err, httpResponse, body) {

            var publicKey = htmlparser.getValueFromBody('id="publicKey" name="publicKey" value="', '" />', body);
            var rsaExponent = htmlparser.getValueFromBody('id="rsaExponent" name="rsaExponent" value="', '" />', body);
            rsakey.setPublic(publicKey, rsaExponent);
            var cncryptPassword = rsakey.encrypt(password);

            captchaUtil.guessCaptchaForLogin("login", cookieJar, function (captachStr) {
                doLogin(user, cncryptPassword, captachStr, cookieJar, function (info) {
                    if (info.uid) {
                        account.cookieJar = cookieJar;
                        account.availableBalance = info.availableFund;
                        account.uid = info.uid;
                        account.loginTime = new Date();
                        callback(cookieJar, account.JSONInfo());
                    } else {
                        account.cookieJar = null;
                        callback(null, info);
                    }
                    // logutil.info("account.availableBalance:", account.availableBalance, account.uid, info)

                })
            })
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
        function (err, httpResponse, body) {
            callback(body)
        })
}

function doLogin(userNameLogin, cncryptPassword, captcha, cookieJar, callback) {
    simplehttp.POST('https://user.lu.com/user/login', {
        form: {
            userName: userNameLogin,
            password: cncryptPassword,
            validNum: captcha,
            loginagree: "on",
            isTrust: "Y"
        },
        "cookieJar": cookieJar
    },
        function (err, httpResponse, body) {
            var cookie_string = cookieJar.getCookieString("https://user.lu.com");
            logutil.info("doLogin -> login status:", cookie_string.indexOf("lufaxSID") > 0, userNameLogin, body);
            if (cookie_string.indexOf("lufaxSID") < 0) {
                callback(JSON.parse(body));
            } else {
                getUserInfo(cookieJar, callback);
            }
        });
}

function getUserInfo(cookieJar, callback) {
    getUserId(cookieJar, function (info) {
        getFundInfo(cookieJar, info.uid, function (json) {
            for (var att in json) {
                info[att] = json[att];
            }
            callback(info);
        })

    });
}

function getFundInfo(cookieJar, uid, callback) {
    simplehttp.GET('https://cashier.lu.com/cashier/service/users/' + uid + '/account-system/overview', {
        "cookieJar": cookieJar
    },
        function (err, httpResponse, body) {
            var info = JSON.parse(body);
            if (!info) logutil.error("ERROR getFundInfo:", body)
            callback(info);
        });
}

function getUserId(cookieJar, callback) {
    simplehttp.GET('https://user.lu.com/user/service/user/current-user-info-for-homepage', {
        "cookieJar": cookieJar
    },
        function (err, httpResponse, body) {
            var info = JSON.parse(body);
            // logutil.info("---------", info) 18270.60
            if (!info) logutil.error("ERROR getUserId:", body)
            callback(info);
        });
}
exports.extendLogin = extendLogin;

function extendLogin(account, callback) {
    // login(account, function (cookieJar, info) {
    //     logutil.info("extendLogin======", account.user, account.source);

    //     account.loginExtendedTime = new Date();
    //     callback(cookieJar);
    // });
    userInfo_mobile(account, function(result){
        account.loginExtendedTime = new Date();
        callback(account.cookieJar)
    });
}

function securityValid(callback) {
    simplehttp.GET('https://static.lufaxcdn.com/trading/resource/securityValid/main/1be866c2e005.securityValid.js', {},
        function (err, httpResponse, body) {
            try {
                var publicKey = htmlparser.getValueFromBody('encryptPwd:function(e){var t="', '",n=', body);
                var rsaExponent = htmlparser.getValueFromBody('n.setPublic(t,"', '"),n.', body);

                callback(publicKey, rsaExponent);
            } catch (e) {
                console.log("************", err, e.stack)
                callback(null);
            }

        });
}

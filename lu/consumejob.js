var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var mobilesigutil = require("./mobilesigutil");
var simplehttp = require('../simplehttp');

var captchaUtil = require('./captchautil.js');
var RSAKey = require('./rsa.js');

//var LoopJob = require("../loopjob");

var CONSUMING_INTERVAL_MIN = 5000;

var publicKey, rsaExponent;
var rsakey = new RSAKey();
securityValid(function(pkey, exp) {
    publicKey = pkey;
    rsaExponent = exp;
    rsakey.setPublic(publicKey, rsaExponent);
    // 1443080746730
    //MMSR5QFS6NWISQKDGHZJIMATDM4DOUEEG8SZ15QEWZLNOYTMZH35ATABHUGDXUW=
    var cncryptPassword = rsakey.encrypt("1443080746730");

});

exports.consume = consume;

function consume(account, toBeConsumed, callback) {
    var finished = consume_brwoser(account, toBeConsumed, callback);
    return finished;
}

// function consume_mobile(account, toBeConsumed, callback) {
//     //rollInvestCheck(account, product, function() {});
//     if (!ableToConsume(account, toBeConsumed)) return false;
//     account.lock();
//     var productId = toBeConsumed.productId;
//     var cookieJar = account.cookieJar;
//     mobileGetSID(account, productId, function(sid) {
//         logutil.log("mobileGetSID", productId, sid)
//         if (!sid) {
//             account.unlock();
//             return;
//         }
//         var st = new Date();
//         mobileContract(account, productId, sid, function(info) {
//             //if (!info) return;
//             logutil.log("mobileContract duration:", new Date()-st);
//         });
//         setTimeout(function() {
//             var st = new Date();
//             mobileContractConfirm(account, productId, sid, function(sucess) {
//                 // mobileInvestmentRequest(account, productId, sid, function(info) {
//                 //     account.unlock();
//                 // });
//                 logutil.log("mobileContractConfirm duration:", new Date()-st);
//             });
//         }, 150)

//         setTimeout(function() {
//             var st = new Date();
//             mobileInvestmentRequest(account, productId, sid, function(info){
//                 logutil.log("mobileInvestmentRequest duration:", new Date()-st);
//                 account.unlock();
//             });
//         }, 300)
//     })
// }

function consume_brwoser(account, toBeConsumed, callback) {
    if (!ableToConsume(account, toBeConsumed)) return false;
    account.lock();

    logutil.log("lufax doConsume:", account.user, account.availableBalance, toBeConsumed.productId, toBeConsumed.publishTime, toBeConsumed.interest, toBeConsumed.price);
    var productId = toBeConsumed.productId;
    var cookieJar = account.cookieJar;

    var investmentRequestCallback = function(json) {

        logutil.log("investmentRequestCallback", new Date() - consumeStart, JSON.stringify(json))
        if (!json) {
            logutil.log("investmentRequest failed.", productId, account.uid);
        } else {
            if (json.code === '01') {
                var ab = account.availableBalance;
                account.availableBalance -= toBeConsumed.price;
                account.lastConsumingTime = new Date();
                confirmConsuming(account, toBeConsumed);
            } else if (json.code === '15') {//Captcha incorrect
                account.unlock();
                consume_brwoser(account, toBeConsumed, callback)
                return;
            } else {
                 //confirmConsuming(account, toBeConsumed);
                logutil.log("json.code", json.code, json)
            }

        }

        if (callback) callback();
        account.unlock();
    }
    var consumeStart = new Date();
    investCheck(account.uid, productId, cookieJar, function(sid) {
        if (!sid) {
            logutil.log("Get sid failed")
            account.unlock();
            if (callback) callback();
            return;
        }

        var captachStr, imageId, traceOtpDone;
        var cncryptPassword = rsakey.encrypt(account.tradePassword);
        var traceInfoDone = false
        traceInfo(account.uid, productId, sid, cookieJar, function() {
            traceInfoDone = true;
            // if (traceOtpDone && traceInfoDone && captachStr && imageId) {
            //     investmentRequest(account.uid, productId, sid, cncryptPassword, captachStr, imageId, cookieJar, investmentRequestCallback);
            // }

        });

        logutil.log("investCheck done", sid, new Date() - consumeStart);

        setTimeout(function() {
            traceOtp(productId, sid, cookieJar, function() {
                traceOtpDone = true;
            })
            logutil.log("guessCaptchaForTrading start", sid, new Date() - consumeStart);
            captchaUtil.guessCaptchaForTrading(productId, sid, cookieJar, function(capStr, imgid) {
                if (!capStr) {
                    logutil.log("guessCaptchaForTrading failed");
                    if (callback) callback();
                    account.unlock();
                    return;
                } else {
                    captachStr = capStr;
                    imageId = imgid;
                    logutil.log("guessCaptchaForTrading done", productId, sid, captachStr, imageId, new Date() - consumeStart);
                    investmentRequest(account.uid, productId, sid, cncryptPassword, captachStr, imageId, cookieJar, investmentRequestCallback);
                }
            })

        }, 500)

    });

    return true;
}

function confirmConsuming(account, product) {
    setTimeout(function() {
        confirmSpent(product.productId, account, function(pobj) {
            console.log("pobj.productStatus", pobj.productStatus, account.user, pobj.buyerUserName)
             if (pobj.productStatus === "ONLINE") {
                confirmConsuming(account, product)
            } else if (pobj.productStatus === "DONE") {
                if (matchUserName(account.user, pobj.buyerUserName)) {
                    account.addToConsumeHistory({
                        tradeTime: pobj.lastUpdateTime,
                        productType: pobj.productType,
                        displayName: pobj.displayName,
                        price: pobj.price,
                        interest: pobj.interestRateDisplay,
                        publishedAtDateTime: pobj.publishedAtDateTime,
                        tradingMode: pobj.tradingMode
                    })
                } else {
                    console.log("confirmConsuming DONE***************", account.user, pobj.buyerUserName)
                }
            } else {
                console.log("confirmConsuming else***************", pobj.productStatus, pobj)
            }
            logutil.log("confirmSpent***********", pobj.price, pobj.productStatus, pobj.buyerUserName, pobj.lastUpdateTime);
        })
    }, 5000)
}

function matchUserName(name, ellipsisName){
    var charstart_0 = name.charAt(0);
    var charend_0 = name.charAt(name.length-1);
    var charstart_1 = ellipsisName.charAt(0);
    var charend_1 = ellipsisName.charAt(ellipsisName.length-1);

    return charstart_0 === charstart_1 && charend_0 === charend_1
}

function getProductDetail(productId, callback) {
    simplehttp.GET('https://list.lu.com/list/service/product/' + productId + '/productDetail', {},
        function(err, request, body) {
            try {
                var json = JSON.parse(body);
                if (json.productId != 0 && json.tradingMode != "06")
                    logutil.log("getProductDetail", json.productId, json.productStatus, json.publishedAtDateTime, json.productType, json.tradingMode, json.price)
                callback(json);
            } catch (e) {
                logutil.log("****************getDetail failed", productId)
                    //getProductDetail(productId, callback)
                    // callback({
                    //     body: body
                    // });
            }
        });
}

function confirmSpent(productId, account, callback) {
    simplehttp.GET('https://list.lu.com/list/service/product/' + productId + '/productDetail', {},
        function(err, request, body) {
            try {
                var json = JSON.parse(body);
                callback(json);
            } catch (e) {
                callback({
                    body: body
                });
            }
        });
}

function ableToConsume(account, toBeConsumed) {
    //console.log(account.locked, account.availableBalance, toBeConsumed.price, account.interestLevel, toBeConsumed.interest, toBeConsumed)
    return !account.locked && account.pricePerBidMax >= toBeConsumed.price && account.pricePerBidMin <= toBeConsumed.price && account.availableBalance > toBeConsumed.price && account.availableBalance - toBeConsumed.price > account.reservedBalance && account.interestLevelMin <= toBeConsumed.interest && (account.lastConsumingTime === null || (new Date() - account.lastConsumingTime) > CONSUMING_INTERVAL_MIN)
}

function mobileHeaders(account) {
    var t = new Date().getTime() - 2345;
    var sig = mobilesigutil.genSig(account.uid, t);
    var h = {
            "mobile_agent": "appVersion:2.8.1,platform:android,osVersion:19,device:2014813,resourceVersion:2.7.0,channel:JLX01",
            "X-LUFAX-MOBILE-DATA-AGENT": "qFgr54W0EdfGbMA3ChG0SNf0NUhMxPEQ2PeA01mXVe00jIomuPKcxLosSGY4DV2ogz34GEe5xdRjUVxL84rk2jrYwetGrAdyb+VcSFt7KAzyunxl6+T0TZl7v7XPeB6p2cQN8AY394oWuAjNFAhHmMi1bBW/xRnr",
            //"qFgr54W0EdfGbMA3ChG0SORJG0q4eZU9daj6/Zozlsf8mp/0Hv7zJ5TFel1eZmsjvyaDI5j7pHAA2GHszyYPs4l9olywf9v/wK8uB2Bf4dBK23vMoOHfZJl7v7XPeB6pmXu/tc94HqllUQ3cIeh29/8oHE6eGbuc",
            "x-lufax-mobile-t": t,
            "x-lufax-mobile-signature": sig
        }
        // console.log("mobileHeaders", h)
    return h;
}

function mobileGetSID(account, productId, callback) {
    //https://ms.lufax.com/mobile/service/investment/2518232/trade-info?_46489
    // https://ms.lufax.com/mobile/service/investment/2548266/trade-info?_66069
    simplehttp.GET("https://ms.lufax.com/mobile/service/investment/" + productId + "/trade-info?_" + randomNumber(), {
            "cookieJar": account.cookieJar,
            "headers": mobileHeaders(account)
        },
        function(err, httpResponse, body) {
            try {
                var info = JSON.parse(body).checkInvest;
                if (!info.sid) {
                    logutil.log("investCheck failed", body);
                }
                callback(info.sid);
            } catch (e) {
                logutil.log("investCheck exception:", productId, err, body);
                callback(null);
            }
        });
}

function mobileContract(account, productId, sid, callback) {
    simplehttp.GET("https://ms.lufax.com/mobile/service/investment/product/" + productId + "/contract?sid=" + sid + "&_" + randomNumber(), {
            "cookieJar": account.cookieJar,
            "headers": mobileHeaders(account)
        },
        function(err, httpResponse, body) {
            try {
                var info = JSON.parse(body);
                callback(info);
                //logutil.log("mobileContract", body)
            } catch (e) {
                logutil.log("mobileContract exception:", productId, err, body);
                callback(null);
            }
        });
}

function mobileContractConfirm(account, productId, sid, callback) {
    // https://ms.lufax.com/mobile/service/investment/contract/product/2548266/confirm?sid=17742654&_17996
    simplehttp.POST("https://ms.lufax.com/mobile/service/investment/contract/product/" + productId + "/confirm?sid=" + sid + "&_" + randomNumber(), {
            "cookieJar": account.cookieJar,
            "headers": mobileHeaders(account)
        },
        function(err, httpResponse, body) {
            //try {
            callback(body);
            logutil.log("mobileContractConfirm", sid, body)
                // } catch (e) {
                //     logutil.log("mobileContractConfirm exception:", sid, productId, err, body);
                //     callback(null);
                // }
        });
}

function mobileInvestmentRequest(account, productId, sid, callback) {
    //https://ms.lufax.com/mobile/service/investment/investment-request?_92357
    simplehttp.POST("https://ms.lufax.com/mobile/service/investment/investment-request?_" + randomNumber(), {
            "cookieJar": account.cookieJar,
            "headers": mobileHeaders(account),
            "form": {
                sid: sid,
                coinString: "",
                from: "list",
                password: rsakey.encrypt(account.tradePassword),
                otpValidationCode: "",
                productId: productId
            }
        },
        function(err, httpResponse, body) {
            try {
                var info = JSON.parse(body);
                callback(info);
                logutil.log("mobileInvestmentRequest", sid, productId, body)

            } catch (e) {
                logutil.log("productId exception:", sid, productId, err, body);
                callback(null);
            }
        });
}

function randomNumber() {
    return Math.round(Math.random() * 100000);
}

function investCheck(userId, productId, cookieJar, callback) {

    //simplehttp.POST("https://list.lu.com/list/service/users/" + userId + "/products/" + productId + "/invest-check", {
    simplehttp.POST("https://list.lu.com/list/invest-check", {
            "cookieJar": cookieJar,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "form": {
                "productId": productId,
                isCheckSQ: 1,
                source: 0
            }
        },
        function(err, httpResponse, body) {
            try {
                var info = JSON.parse(body);
                if (!info.sid) {
                    logutil.log("investCheck failed==", body);
                }
                callback(info.sid);
            } catch (e) {
                logutil.log("investCheck exception:", userId, productId, err, body);
                callback(null);
            }
        });
}

function traceInfo(userId, productId, sid, cookieJar, callback) {
    var checkTradeFlag = false,
        traceTradeFlag = false,
        checkContractFlag = false,
        traceContractFlag = false,
        checkOptFlag = false;

    var syncFun = function(body) {
        if (traceTradeFlag && traceContractFlag) {
            callback(body);
        }
    }

    var tradeTime = new Date();
    simplehttp.POST("https://trading.lu.com/trading/service/trade/trace", {
            "cookieJar": cookieJar,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            "form": {
                sid: sid,
                productId: productId,
                curStep: "TRADE_INFO"
            }
        },
        function(err, httpResponse, body) {
            traceTradeFlag = true;
            logutil.log("****", 2, body, userId, productId, sid, cookieJar, new Date() - tradeTime);
            // if (checkFlag && traceFlag) callback(body);
            syncFun(body);
        });

    setTimeout(function() {
        var contractTime = new Date();
        simplehttp.POST("https://trading.lu.com/trading/service/trade/trace", {
                "cookieJar": cookieJar,
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                "form": {
                    sid: sid,
                    productId: productId,
                    curStep: "CONTRACT"
                }
            },
            function(err, httpResponse, body) {
                traceContractFlag = true;
                logutil.log("****", 4, body, new Date() - contractTime)
                    // if (checkFlag && traceFlag) callback(body);
                syncFun(body);
            });
    }, 200)
}

function traceOtp(productId, sid, cookieJar, callback) {
    simplehttp.POST("https://trading.lu.com/trading/service/trade/trace", {
            "cookieJar": cookieJar,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            "form": {
                sid: sid,
                productId: productId,
                curStep: "OTP"
            }
        },
        function(err, httpResponse, body) {
            logutil.log("****", 6, body)
            callback(body);
        });
}


function securityValid(callback) {
    simplehttp.GET('https://static.lufaxcdn.com/trading/resource/securityValid/main/1be866c2e005.securityValid.js', {},
        function(err, httpResponse, body) {
            var publicKey = htmlparser.getValueFromBody('encryptPwd:function(e){var t="', '",n=', body);
            var rsaExponent = htmlparser.getValueFromBody('n.setPublic(t,"', '"),n.', body);

            // console.log("securityValid:", rsaExponent, publicKey)
            callback(publicKey, rsaExponent);
        });
}

function investmentRequest(uid, productId, sid, password, captachStr, imageId, cookieJar, callback) {
    simplehttp.POST("https://trading.lu.com/trading/investment-request", {
            "cookieJar": cookieJar,
            "form": {
                "sid": sid,
                "productId": productId,
                "password": password,
                "captcha": captachStr,
                "source": 0,
                "coinString": "",
                "imgId": imageId,
                "needWithholding": false,
                "paymentMethod": 1,
                "isSetPassword": 0
            }
        },
        function(err, httpResponse, body) {
            try {
                var json = JSON.parse(body);
                callback(json);
            } catch (e) {
                logutil.log(body);
                callback();
            }

        });
}

function rollInvestCheck(account, product, callback) {
    var productId = product.productId;
    var LOOP_INTERVAL = 200;
    var investObj = {};
    var lastTimeGetDetail = new Date();
    if (!account.consumeJob) {
        account.consumeJob = new LoopJob().config({
            latestProductId: productId,
            parallelRequests: 5,
            url: "https://list.lu.com/list/service/users/*/products/#/invest-check",
            loopInterval: LOOP_INTERVAL,
            timeout: 1.8 * LOOP_INTERVAL,
            httpMethod: "POST",
            urlInjection: function(parallelIndex, url, jobConfig) {
                if (jobConfig.latestProductId >= productId) {
                    productId = jobConfig.latestProductId + 1;
                    logutil.log("adjust productId************************", productId)
                }
                var u = url.replace("*", account.uid).replace("#", productId + parallelIndex);
                logutil.log(u)
                return u;
            },
            optionsInjection: function(parallelIndex, options) {
                options.cookieJar = account.cookieJar;
                options.headers = {
                    "Content-Type": "application/x-www-form-urlencoded"
                };
                options.form = {
                    source: 0
                };

                return options;
            },
            responseHandler: function(error, response, body) {
                if (!response) return;
                //list/service/users/1770933/products/2459312/invest-check
                var path = response.request.uri.pathname;
                var pId = Number(path.split("/")[6]);
                if (error) {
                    logutil.log("responseHandler error:", error)
                } else if (response.statusCode === 200) {
                    try {
                        logutil.log("-----", pId, "body=", body)
                        if (body === '') {
                            //not published
                            return;
                        }

                        var checkObj = JSON.parse(body);
                        logutil.log("~~", productId, pId, checkObj.code, checkObj.sid)
                        if (productId <= pId) {
                            productId = pId + 1;
                            logutil.log(pId, "+1=", productId, checkObj.code)
                        }
                        // console.log(response.statusCode, productId, body)
                        // if (response.statusCode === 302) return;


                        // console.log(response.statusCode, productId, checkObj.code)
                        if (checkObj.code === "66" && !investObj[productId]) {
                            investObj[productId] = true;
                            console.log("++++++++++++++", productId, pId, checkObj.code, checkObj.sid)
                            doInvest(account, pId, checkObj.sid, function() {

                            })
                        }
                        //{"code":"19","message":"非法竞拍价","locked":false,"isRiskLevelMatch":false}'
                        // 200, body = '', future 
                        //200 '{"code":"09","message":"其他原因失败","locked":false,"isRiskLevelMatch":false}'
                        // 200 '{"code":"02","message":"金额不足","locked":false,"balanceAmount":12812.14,"rechargeAmount":94427.11,"lufaxCoinAmount":0,"isRiskLevelMatch":false}'
                        // 200 '{"code":"66","message":"购买验证通过，可开始交易","locked":false,"sid":17178706,"balanceAmount":12812.14,"riskLevelDesc":"平衡型","productRiskLevelDesc":"保守型","paymentMethod":"1","isRiskLevelMatch":true}'



                    } catch (e) {
                        console.log("Catch", e)
                    }
                } else if (response.statusCode === 302) {
                    if (new Date() - lastTimeGetDetail > 500) {
                        lastTimeGetDetail = new Date();
                        getProductDetail(pId, function(pobj) {
                            if (pobj.productId != 0) {
                                // logutil.log("guessCaptchaForTrading done in getProductDetail", productId, sid, captachStr, imageId, new Date() - consumeStart);
                                var dt = new Date(pobj.publishedAtDateTime);
                                if (productId <= pobj.productId && new Date() - dt > 5000) {
                                    productId = pobj.productId + 1;
                                    if (pobj.tradingMode === "00")
                                        logutil.log(productId, "**", pobj.productId, pobj.productStatus, pobj.tradingMode, pobj.publishedAtDateTime, pobj.price)
                                }
                            } else {
                                //logutil.log("** no detail", pId)
                            }

                        });
                    }
                } else {

                    // console.log("?????????????????????????????? statusCode:", response.statusCode,  productId)
                }

            }
        }).startLooping();

    } else {
        account.consumeJob.config({
            latestProductId: productId
        })

    }

}
/*
function doInvest(account, productId, sid, callback) {
    // if (!ableToConsume(account, toBeConsumed)) return false;
    var cookieJar = account.cookieJar;
    var consumeStart = new Date();
    var investmentRequestCallback = function(json) {
        logutil.log("investmentRequestCallback", new Date() - consumeStart)
        if (!json) {
            logutil.log("investmentRequest failed.", productId, account.uid);
        } else {
            if (json.code === '01') {
                var ab = account.availableBalance;
                account.availableBalance -= toBeConsumed.price;
                account.lastConsumingTime = new Date();
                setTimeout(function() {
                    confirmSpent(productId, account, function(pobj) {
                        logutil.log("confirmSpent***********:", productId, toBeConsumed.price, pobj.productStatus, pobj.buyerUserName, pobj.lastUpdateTime, JSON.stringify(json));
                    })
                }, 3000)
            } else {
                confirmSpent(productId, account, function(pobj) {
                    logutil.log("confirmSpent***********:", account.uid, productId, toBeConsumed.price, pobj.productStatus, pobj.buyerUserName, pobj.lastUpdateTime, JSON.stringify(json));
                })

            }

        }

        if (callback) callback();
        // account.unlock();
    }

    var toBeConsumed;
    var captachStr, imageId, traceOtpDone;
    var cncryptPassword = rsakey.encrypt(account.tradePassword);
    var traceInfoDone = false;
    logutil.log("getProductDetail...", productId, sid)
    getProductDetail(productId, function(pobj) {
        toBeConsumed = pobj;
        logutil.log("getProductDetail", toBeConsumed)
        if (captachStr && imageId && ableToConsume(account, toBeConsumed)) {
            logutil.log("guessCaptchaForTrading done in getProductDetail", productId, sid, captachStr, imageId, new Date() - consumeStart);
            investmentRequest(account.uid, productId, sid, cncryptPassword, captachStr, imageId, cookieJar, investmentRequestCallback);
        }
    });

    traceInfo(account.uid, productId, sid, cookieJar, function() {
        traceInfoDone = true;
    });

    setTimeout(function() {
        traceOtp(productId, sid, cookieJar, function() {
            traceOtpDone = true;
        })
        logutil.log("guessCaptchaForTrading start", productId, sid);
        captchaUtil.guessCaptchaForTrading(productId, sid, cookieJar, function(capStr, imgid) {
            if (!capStr) {
                logutil.log("guessCaptchaForTrading failed");
                if (callback) callback();
                // account.unlock();
                return;
            } else {
                captachStr = capStr;
                imageId = imgid;
                logutil.log("---", toBeConsumed)
                if (toBeConsumed && ableToConsume(account, toBeConsumed)) {
                    logutil.log("guessCaptchaForTrading done", productId, sid, captachStr, imageId, new Date() - consumeStart);
                    investmentRequest(account.uid, productId, sid, cncryptPassword, captachStr, imageId, cookieJar, investmentRequestCallback);
                }

            }
        })

    }, 50)

    return true;
}
*/
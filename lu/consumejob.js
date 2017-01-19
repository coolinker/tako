var htmlparser = require('../htmlparser');
var logutil = require("../logutil").config('luconsume');
var simplehttp = require('../simplehttp');
var mobileheaderutil = require("./mobileheaderutil");
var captchaUtil = require('./captchautil.js');
var RSAKey = require('./rsa.js');

//var LoopJob = require("../loopjob");

var CONSUMING_INTERVAL_MIN = 5000;

var publicKey, rsaExponent;
var rsakey = new RSAKey();
securityValid(function (pkey, exp) {
    publicKey = pkey;
    rsaExponent = exp;
    rsakey.setPublic(publicKey, rsaExponent);
    // 1443080746730
    //MMSR5QFS6NWISQKDGHZJIMATDM4DOUEEG8SZ15QEWZLNOYTMZH35ATABHUGDXUW=
    var cncryptPassword = rsakey.encrypt("1443080746730");

});

exports.consume = consume;

function consume(account, toBeConsumed, callback) {
    console.log("--------------------consume", toBeConsumed.length)
    //var finished = consume_brwoser(account, toBeConsumed, callback);
    var finished = consume_mobile(account, toBeConsumed, callback);
    return finished;
}

function consume_mobile(account, toBeConsumed, callback) {
    //rollInvestCheck(account, product, function() {});
    if (!ableToConsume(account, toBeConsumed)) return false;
    account.lock();
    var productId = toBeConsumed.productId;
    mobileGetSID(account, toBeConsumed, function (sid) {
        logutil.info("mobileGetSID", productId, sid)
        if (!sid) {
            account.unlock();
            return;
        }
        mobileTradeM3030(account, toBeConsumed, sid, function (succeed) {
            if (succeed) {
                mobileTradeM3032(account, toBeConsumed, sid, function (result) {
                    if (result) {
                        console.log("consume succeed", toBeConsumed, result)
                        account.availableBalance -= toBeConsumed.price;
                        account.lastConsumingTime = new Date();
                    }
                    account.unlock();
                })
            } else {
                account.unlock();
            }

        })


    });

    return true;
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
    // logutil.info("mobileHeaders", h)
    return h;
}

function mobileProductDetail(account, product, callback) {
    simplehttp.POST("https://mapp.lu.com/mapp/service/public?M4100&spCategory=" + product.productCategory + "&_" + randomNumber(), {
        "cookieJar": account.cookieJar,
        "headers": mobileheaderutil.getHeaders(account.uid),
        form: {
            requestCode: "M4100",
            version: "3.4.9",
            params: '{"productId":"' + product.productId + '"}'
        }
    },
        function (err, httpResponse, body) {
            try {
                var code = JSON.parse(body).code;
                if (code !== '0000') {
                    logutil.error("mobileTradeM3030 failed", body);
                    callback(null);
                } else {
                    callback(code);
                }

            } catch (e) {
                logutil.error("mobileProductDetail exception:", err, body);
                callback(null);
            }
        });
}
function mobileGetSID(account, product, callback) {
    //https://mapp.lu.com/mapp/service/v2/private?M3034&spCategory=901&_67720
    //{"insuranceFeeFlag":"","amount":"2780.37","bidFee":"","salesArea":"","source":"2","productCategory":"901","ver":"1.0","isCheckSQ":"0","productId":"139271916"}
    // {"insuranceFeeFlag":"","amount":"6217.45","bidFee":"","salesArea":"","source":"2","productCategory":"902","ver":"1.0","isCheckSQ":"0","productId":"139263131"}
    simplehttp.POST("https://mapp.lu.com/mapp/service/v2/private?M3034&spCategory=" + product.productCategory + "&_" + randomNumber(), {
        "cookieJar": account.cookieJar,
        "headers": mobileheaderutil.getHeaders(account.uid),
        form: {
            requestCode: "M3034",
            version: "3.4.9",
            params: '{ "insuranceFeeFlag": "", "amount": "' + product.price + '", "bidFee": "", "salesArea": "", "source": "2", "productCategory":"' + product.productCategory + '", "ver": "1.0", "isCheckSQ": "0", "productId": "' + product.productId + '" }'
        }
    },
        function (err, httpResponse, body) {
            try {
                var info = JSON.parse(body).result;
                if (!info.sid) {
                    logutil.error("investCheck failed", body);
                }
                callback(info.sid);
            } catch (e) {
                logutil.error("investCheck exception:", err, body);
                callback(null);
            }
        });
}

function mobileTradeM3030(account, product, sid, callback) {
    // https://mapp.lu.com/mapp/service/v2/private?M3030&spCategory=902&_68785
    simplehttp.POST("https://mapp.lu.com/mapp/service/v2/private?M3030&spCategory=" + product.productCategory + "&_" + randomNumber(), {
        "cookieJar": account.cookieJar,
        "headers": mobileheaderutil.getHeaders(account.uid),
        form: {
            requestCode: "M3030",
            version: "3.4.9",
            params: '{ "ver": "1.0", "source": "2", "productId":"' + product.productId + '", "amount":"' + product.price + '", "sid": "' + sid + '", "hasInsurance": "", "productCode": "" }'
        }
    },
        function (err, httpResponse, body) {
            try {
                var code = JSON.parse(body).code;
                if (code !== '0000') {
                    logutil.error("mobileTradeM3030 failed", body);
                    callback(null);
                } else {
                    callback(code);
                }

            } catch (e) {
                logutil.error("mobileTradeM3030 exception:", err, body);
                callback(null);
            }
        });
}


function mobileTradeM3032(account, product, sid, callback) {
    // https://mapp.lu.com/mapp/service/v2/private?M3032&spCategory=902&_76405
    simplehttp.POST("https://mapp.lu.com/mapp/service/v2/private?M3032&spCategory=" + product.productCategory + "&_" + randomNumber(), {
        "cookieJar": account.cookieJar,
        "headers": mobileheaderutil.getHeaders(account.uid),
        form: {
            requestCode: "M3032",
            version: "3.4.9",
            //{"sid":"244302157","supportedMethods":"1","productCategory":"902","isSetPassword":"0","needWithholding":false,"from":"","password":"10EACC7875481C26FD6D760594DED287581665825CDF1CB1D8D15037FD83FFCCF127CAAB8C279FDC1B8D6FF00EFFC86E610B6D1811660E93978C85A9AB3B18F1EE6A6EA7946C71A3CF9FC0460BFD0353726AA84C4F79E972838A960AC7645D98D2317159CE919804DC87F0B8C87F09F33ABD30EAD4C5D051FB3E88BED93AE924","paymentMethod":"1","productId":"139263131"}
            params: '{ "sid": "' + sid + '", "supportedMethods": "1", "productCategory": "' + product.productCategory + '", "isSetPassword": "0", "needWithholding": false, "from": "", "password": "' + rsakey.encrypt(account.tradePassword) + '", "paymentMethod": "1", "productId": "' + product.productId + '" }'
        }
    },
        function (err, httpResponse, body) {
            try {
                var result = JSON.parse(body).result;
                if (!result) {
                    logutil.error("mobileTradeM3032 failed", body);
                    callback(null);
                } else {
                    callback(result);
                }

            } catch (e) {
                logutil.error("mobileTradeM3032 exception:", err, body);
                callback(null);
            }
        });
}

function consume_brwoser(account, toBeConsumed, callback) {
    if (!ableToConsume(account, toBeConsumed)) return false;
    account.lock();

    logutil.info("lufax doConsume:", account.user, account.availableBalance, toBeConsumed.productId, toBeConsumed.publishTime, toBeConsumed.interest, toBeConsumed.price);
    var productId = toBeConsumed.productId;
    var cookieJar = account.cookieJar;

    var investmentRequestCallback = function (json) {

        logutil.info("investmentRequestCallback", new Date() - consumeStart, JSON.stringify(json))
        if (!json) {
            logutil.error("investmentRequest failed.", productId, account.uid);
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
                logutil.info("json.code", json.code, json)
            }

        }

        if (callback) callback();
        account.unlock();
    }
    var consumeStart = new Date();
    investCheck(account.uid, productId, cookieJar, function (sid) {
        if (!sid) {
            logutil.error("Get sid failed")
            account.unlock();
            if (callback) callback();
            return;
        }

        var captachStr, imageId, traceOtpDone;
        var cncryptPassword = rsakey.encrypt(account.tradePassword);
        var traceInfoDone = false
        traceInfo(account.uid, productId, sid, cookieJar, function () {
            traceInfoDone = true;
            // if (traceOtpDone && traceInfoDone && captachStr && imageId) {
            //     investmentRequest(account.uid, productId, sid, cncryptPassword, captachStr, imageId, cookieJar, investmentRequestCallback);
            // }

        });

        logutil.info("investCheck done", sid, new Date() - consumeStart);

        setTimeout(function () {
            traceOtp(productId, sid, cookieJar, function () {
                traceOtpDone = true;
            })
            logutil.info("guessCaptchaForTrading start", sid, new Date() - consumeStart);
            captchaUtil.guessCaptchaForTrading(productId, sid, cookieJar, function (capStr, imgid) {
                if (!capStr) {
                    logutil.error("guessCaptchaForTrading failed");
                    if (callback) callback();
                    account.unlock();
                    return;
                } else {
                    captachStr = capStr;
                    imageId = imgid;
                    logutil.info("guessCaptchaForTrading done", productId, sid, captachStr, imageId, new Date() - consumeStart);
                    investmentRequest(account.uid, productId, sid, cncryptPassword, captachStr, imageId, cookieJar, investmentRequestCallback);
                }
            })

        }, 500)

    });

    return true;
}

function confirmConsuming(account, product) {
    setTimeout(function () {
        confirmSpent(product.productId, account, function (pobj) {
            logutil.info("pobj.productStatus", pobj.productStatus, account.user, pobj.buyerUserName)
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
                    logutil.info("confirmConsuming DONE***************", account.user, pobj.buyerUserName)
                }
            } else {
                logutil.info("confirmConsuming else***************", pobj.productStatus, pobj)
            }
            logutil.info("confirmSpent***********", pobj.price, pobj.productStatus, pobj.buyerUserName, pobj.lastUpdateTime);
        })
    }, 5000)
}

function matchUserName(name, ellipsisName) {
    var charstart_0 = name.charAt(0);
    var charend_0 = name.charAt(name.length - 1);
    var charstart_1 = ellipsisName.charAt(0);
    var charend_1 = ellipsisName.charAt(ellipsisName.length - 1);

    return charstart_0 === charstart_1 && charend_0 === charend_1
}

function getProductDetail(productId, callback) {
    simplehttp.GET('https://list.lu.com/list/service/product/' + productId + '/productDetail', {},
        function (err, request, body) {
            try {
                var json = JSON.parse(body);
                if (json.productId != 0 && json.tradingMode != "06")
                    logutil.info("getProductDetail", json.productId, json.productStatus, json.publishedAtDateTime, json.productType, json.tradingMode, json.price)
                callback(json);
            } catch (e) {
                logutil.error("****************getDetail failed", productId)
                //getProductDetail(productId, callback)
                // callback({
                //     body: body
                // });
            }
        });
}

function confirmSpent(productId, account, callback) {
    simplehttp.GET('https://list.lu.com/list/service/product/' + productId + '/productDetail', {},
        function (err, request, body) {
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
    //logutil.info(account.locked, account.availableBalance, toBeConsumed.price, account.interestLevel, toBeConsumed.interest, toBeConsumed)
    return !account.locked && account.pricePerBidMax >= toBeConsumed.price && account.pricePerBidMin <= toBeConsumed.price && account.availableBalance > toBeConsumed.price && account.availableBalance - toBeConsumed.price > account.reservedBalance && account.interestLevelMin <= toBeConsumed.interest && (account.lastConsumingTime === null || (new Date() - account.lastConsumingTime) > CONSUMING_INTERVAL_MIN)
}

// function mobileContract(account, productId, sid, callback) {
//     simplehttp.GET("https://ms.lufax.com/mobile/service/investment/product/" + productId + "/contract?sid=" + sid + "&_" + randomNumber(), {
//         "cookieJar": account.cookieJar,
//         "headers": mobileHeaders(account)
//     },
//         function (err, httpResponse, body) {
//             try {
//                 var info = JSON.parse(body);
//                 callback(info);
//                 //logutil.info("mobileContract", body)
//             } catch (e) {
//                 logutil.error("mobileContract exception:", productId, err, body);
//                 callback(null);
//             }
//         });
// }

// function mobileContractConfirm(account, productId, sid, callback) {
//     // https://ms.lufax.com/mobile/service/investment/contract/product/2548266/confirm?sid=17742654&_17996
//     simplehttp.POST("https://ms.lufax.com/mobile/service/investment/contract/product/" + productId + "/confirm?sid=" + sid + "&_" + randomNumber(), {
//         "cookieJar": account.cookieJar,
//         "headers": mobileHeaders(account)
//     },
//         function (err, httpResponse, body) {
//             //try {
//             callback(body);
//             logutil.info("mobileContractConfirm", sid, body)
//             // } catch (e) {
//             //     logutil.info("mobileContractConfirm exception:", sid, productId, err, body);
//             //     callback(null);
//             // }
//         });
// }

// function mobileInvestmentRequest(account, productId, sid, callback) {
//     //https://ms.lufax.com/mobile/service/investment/investment-request?_92357
//     simplehttp.POST("https://ms.lufax.com/mobile/service/investment/investment-request?_" + randomNumber(), {
//         "cookieJar": account.cookieJar,
//         "headers": mobileHeaders(account),
//         "form": {
//             sid: sid,
//             coinString: "",
//             from: "list",
//             password: rsakey.encrypt(account.tradePassword),
//             otpValidationCode: "",
//             productId: productId
//         }
//     },
//         function (err, httpResponse, body) {
//             try {
//                 var info = JSON.parse(body);
//                 callback(info);
//                 logutil.info("mobileInvestmentRequest", sid, productId, body)

//             } catch (e) {
//                 logutil.error("productId exception:", sid, productId, err, body);
//                 callback(null);
//             }
//         });
// }

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
        function (err, httpResponse, body) {
            try {
                var info = JSON.parse(body);
                if (!info.sid) {
                    logutil.error("investCheck failed==", body);
                }
                callback(info.sid);
            } catch (e) {
                logutil.error("investCheck exception:", userId, productId, err, body);
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

    var syncFun = function (body) {
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
        function (err, httpResponse, body) {
            traceTradeFlag = true;
            logutil.info("****", 2, body, userId, productId, sid, new Date() - tradeTime);
            // if (checkFlag && traceFlag) callback(body);
            syncFun(body);
        });

    setTimeout(function () {
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
            function (err, httpResponse, body) {
                traceContractFlag = true;
                logutil.info("****", 4, body, new Date() - contractTime)
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
        function (err, httpResponse, body) {
            logutil.info("****", 6, body)
            callback(body);
        });
}


function securityValid(callback) {
    simplehttp.GET('https://static.lufaxcdn.com/trading/resource/securityValid/main/1be866c2e005.securityValid.js', {},
        function (err, httpResponse, body) {
            var publicKey = htmlparser.getValueFromBody('encryptPwd:function(e){var t="', '",n=', body);
            var rsaExponent = htmlparser.getValueFromBody('n.setPublic(t,"', '"),n.', body);

            // logutil.info("securityValid:", rsaExponent, publicKey)
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
        function (err, httpResponse, body) {
            try {
                var json = JSON.parse(body);
                callback(json);
            } catch (e) {
                logutil.error(body);
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
            urlInjection: function (parallelIndex, url, jobConfig) {
                if (jobConfig.latestProductId >= productId) {
                    productId = jobConfig.latestProductId + 1;
                    logutil.info("adjust productId************************", productId)
                }
                var u = url.replace("*", account.uid).replace("#", productId + parallelIndex);
                logutil.info(u)
                return u;
            },
            optionsInjection: function (parallelIndex, options) {
                options.cookieJar = account.cookieJar;
                options.headers = {
                    "Content-Type": "application/x-www-form-urlencoded"
                };
                options.form = {
                    source: 0
                };

                return options;
            },
            responseHandler: function (error, response, body) {
                if (!response) return;
                //list/service/users/1770933/products/2459312/invest-check
                var path = response.request.uri.pathname;
                var pId = Number(path.split("/")[6]);
                if (error) {
                    logutil.error("responseHandler error:", error)
                } else if (response.statusCode === 200) {
                    try {
                        logutil.info("-----", pId, "body=", body)
                        if (body === '') {
                            //not published
                            return;
                        }

                        var checkObj = JSON.parse(body);
                        logutil.info("~~", productId, pId, checkObj.code, checkObj.sid)
                        if (productId <= pId) {
                            productId = pId + 1;
                            logutil.info(pId, "+1=", productId, checkObj.code)
                        }
                        // logutil.info(response.statusCode, productId, body)
                        // if (response.statusCode === 302) return;


                        // logutil.info(response.statusCode, productId, checkObj.code)
                        if (checkObj.code === "66" && !investObj[productId]) {
                            investObj[productId] = true;
                            logutil.info("++++++++++++++", productId, pId, checkObj.code, checkObj.sid)
                            doInvest(account, pId, checkObj.sid, function () {

                            })
                        }
                        //{"code":"19","message":"非法竞拍价","locked":false,"isRiskLevelMatch":false}'
                        // 200, body = '', future 
                        //200 '{"code":"09","message":"其他原因失败","locked":false,"isRiskLevelMatch":false}'
                        // 200 '{"code":"02","message":"金额不足","locked":false,"balanceAmount":12812.14,"rechargeAmount":94427.11,"lufaxCoinAmount":0,"isRiskLevelMatch":false}'
                        // 200 '{"code":"66","message":"购买验证通过，可开始交易","locked":false,"sid":17178706,"balanceAmount":12812.14,"riskLevelDesc":"平衡型","productRiskLevelDesc":"保守型","paymentMethod":"1","isRiskLevelMatch":true}'



                    } catch (e) {
                        logutil.error("Catch", e)
                    }
                } else if (response.statusCode === 302) {
                    if (new Date() - lastTimeGetDetail > 500) {
                        lastTimeGetDetail = new Date();
                        getProductDetail(pId, function (pobj) {
                            if (pobj.productId != 0) {
                                // logutil.info("guessCaptchaForTrading done in getProductDetail", productId, sid, captachStr, imageId, new Date() - consumeStart);
                                var dt = new Date(pobj.publishedAtDateTime);
                                if (productId <= pobj.productId && new Date() - dt > 5000) {
                                    productId = pobj.productId + 1;
                                    if (pobj.tradingMode === "00")
                                        logutil.info(productId, "**", pobj.productId, pobj.productStatus, pobj.tradingMode, pobj.publishedAtDateTime, pobj.price)
                                }
                            } else {
                                //logutil.info("** no detail", pId)
                            }

                        });
                    }
                } else {

                    // logutil.info("?????????????????????????????? statusCode:", response.statusCode,  productId)
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
        logutil.info("investmentRequestCallback", new Date() - consumeStart)
        if (!json) {
            logutil.info("investmentRequest failed.", productId, account.uid);
        } else {
            if (json.code === '01') {
                var ab = account.availableBalance;
                account.availableBalance -= toBeConsumed.price;
                account.lastConsumingTime = new Date();
                setTimeout(function() {
                    confirmSpent(productId, account, function(pobj) {
                        logutil.info("confirmSpent***********:", productId, toBeConsumed.price, pobj.productStatus, pobj.buyerUserName, pobj.lastUpdateTime, JSON.stringify(json));
                    })
                }, 3000)
            } else {
                confirmSpent(productId, account, function(pobj) {
                    logutil.info("confirmSpent***********:", account.uid, productId, toBeConsumed.price, pobj.productStatus, pobj.buyerUserName, pobj.lastUpdateTime, JSON.stringify(json));
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
    logutil.info("getProductDetail...", productId, sid)
    getProductDetail(productId, function(pobj) {
        toBeConsumed = pobj;
        logutil.info("getProductDetail", toBeConsumed)
        if (captachStr && imageId && ableToConsume(account, toBeConsumed)) {
            logutil.info("guessCaptchaForTrading done in getProductDetail", productId, sid, captachStr, imageId, new Date() - consumeStart);
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
        logutil.info("guessCaptchaForTrading start", productId, sid);
        captchaUtil.guessCaptchaForTrading(productId, sid, cookieJar, function(capStr, imgid) {
            if (!capStr) {
                logutil.info("guessCaptchaForTrading failed");
                if (callback) callback();
                // account.unlock();
                return;
            } else {
                captachStr = capStr;
                imageId = imgid;
                logutil.info("---", toBeConsumed)
                if (toBeConsumed && ableToConsume(account, toBeConsumed)) {
                    logutil.info("guessCaptchaForTrading done", productId, sid, captachStr, imageId, new Date() - consumeStart);
                    investmentRequest(account.uid, productId, sid, cncryptPassword, captachStr, imageId, cookieJar, investmentRequestCallback);
                }

            }
        })

    }, 50)

    return true;
}
*/
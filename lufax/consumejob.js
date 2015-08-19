var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var simplehttp = require('../simplehttp');

var captchaUtil = require('./captchautil.js');
var RSAKey = require('./rsa.js');

var CONSUMING_INTERVAL_MIN = 5000;

exports.consume = consume;

function consume(account, toBeConsumed, callback) {
    if (!ableToConsume(account, toBeConsumed)) return false;

    account.lock();

    logutil.log("lufax doConsume:", account.user, account.availableBalance, toBeConsumed.productId, toBeConsumed.interest, toBeConsumed.price);
    var productId = toBeConsumed.productId;
    var cookieJar = account.cookieJar;
    investCheck(account.uid, productId, cookieJar, function(sid) {
        if (!sid) {
            account.unlock();
            if (callback) callback();
            return;
        }

        checkTraceTrade(account.uid, productId, sid, cookieJar, function() {
            traceTrade(productId, sid, cookieJar, function() {
                checkTraceContract(account.uid, productId, sid, cookieJar, function() {
                    traceContract(productId, sid, cookieJar, function() {
                        checkTraceOtp(account.uid, productId, sid, cookieJar, function() {
                            securityValid(productId, sid, cookieJar, function(publicKey, rsaExponent) {
                                var rsakey = new RSAKey();
                                rsakey.setPublic(publicKey, rsaExponent);
                                var cncryptPassword = rsakey.encrypt(account.tradePassword);
                                captchaUtil.guessCaptchaForTrading(productId, sid, cookieJar, function(captachStr, imageId) {
                                    if (!captachStr) {
                                        if (callback) callback();
                                        account.unlock();
                                        return;
                                    }

                                    traceOtp(productId, sid, cookieJar, function() {
                                        investmentRequest(productId, sid, cncryptPassword, captachStr, imageId, cookieJar, function(json) {
                                            logutil.log("investmentRequest", account.uid, sid, productId, json);
                                            if (json.code === '01') {
                                                account.availableBalance -= toBeConsumed.price;
                                                account.lastConsumingTime = new Date();
                                            }
                                            logutil.log("confirmSpent:", account.availableBalance);
                                            if (callback) callback();
                                            account.unlock();
                                        })
                                    })

                                })
                            })

                        })
                    })
                })
            })
        })
    });


    // simplehttp.POST('http://www.renrendai.com/transfer/buyLoanTransfer.action', {
    //         form: {
    //             "agree-contract": "on",
    //             transferId: toBeConsumed.transferIdCode,
    //             currentPrice: toBeConsumed.pricePerShare
    //         },
    //         "cookieJar": account.cookieJar
    //     },
    //     function(err, request, body) {
    //         if (request.statusCode === 302) {
    //             confirmSpent(toBeConsumed.transferId, account, function(spent) {
    //                 if (!isNaN(spent)) {
    //                     account.availableBalance -= spent;
    //                 }
    //                 logutil.log("confirmSpent:", toBeConsumed.transferId, spent, account.availableBalance);
    //                 account.locked = false;
    //                 if (callback) callback(spent);
    //                 account.lastConsumingTime = new Date();
    //             })
    //         } else {
    //             console.log("ERROR consumejob consume");
    //         }

    //     });
}

function confirmSpent(transferId, account, callback) {
    simplehttp.GET('http://www.renrendai.com/transfer/loanTransferDetail.action?transferId=' + transferId, {
            "cookieJar": account.cookieJar
        },
        function(err, request, body) {
            //   <div id="pg-server-message" data-status="0" data-message="您已成功投资45.47元，获得1份债权及折让收益0.0元" data-ispop="true" style="display: none;"></div>
            var spent = Number(htmlparser.getValueFromBody('您已成功投资', '元', body));
            callback(spent);
        });
}

function ableToConsume(account, toBeConsumed) {
    console.log(account.locked, account.availableBalance, toBeConsumed.price, account.interestLevel, toBeConsumed.interest, toBeConsumed)
    return !account.locked 
    && account.maxFundPerProduct > toBeConsumed.price 
    && account.availableBalance > toBeConsumed.price 
    && account.interestLevel <= toBeConsumed.interest 
    && account.availableBalance > account.minValidBalance
    && (account.lastConsumingTime === null || (new Date() - account.lastConsumingTime) > CONSUMING_INTERVAL_MIN)
}


function investCheck(userId, productId, cookieJar, callback) {
    simplehttp.POST("https://list.lufax.com/list/service/users/" + userId + "/products/" + productId + "/invest-check", {
            "cookieJar": cookieJar,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "form": {
                source: 0
            }
        },
        function(err, httpResponse, body) {
            console.log("investCheck---------", userId, productId, err, body);

            var info = JSON.parse(body);
            if (!info.sid) {
                logutil.log("investCheck failed", info);
            }
            callback(info.sid);
        });
}

function checkTraceTrade(userId, productId, sid, cookieJar, callback) {
    // https://trading.lufax.com/trading/trade-info?productId=2044140&sid=11664315
    simplehttp.GET("https://trading.lufax.com/trading/service/trade/check-trace?sid=" + sid + "&productId=" + productId + "&userId=" + userId + "&curStep=TRADE_INFO" + "&_=" + (new Date()).getTime(), {
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            //console.log("check-trace: TRADE_INFO", new Date(), body);
            callback(body);
        });
}

function traceTrade(productId, sid, cookieJar, callback) {
    simplehttp.POST("https://trading.lufax.com/trading/service/trade/trace", {
            "cookieJar": cookieJar,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "form": {
                sid: sid,
                productId: productId,
                curStep: "TRADE_INFO"
            }
        },
        function(err, httpResponse, body) {
            //console.log("tradeTrace---------TRADE_INFO", body);
            callback(body);
        });
}

function checkTraceContract(userId, productId, sid, cookieJar, callback) {
    simplehttp.GET("https://trading.lufax.com/trading/service/trade/check-trace?sid=" + sid + "&productId=" + productId + "&userId=" + userId + "&curStep=CONTRACT" + "&_=" + (new Date()).getTime(), {
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            //console.log("check-trace: CONTRACT", new Date(), body);
            callback(body);
        });
}


function traceContract(productId, sid, cookieJar, callback) {
    simplehttp.POST("https://trading.lufax.com/trading/service/trade/trace", {
            "cookieJar": cookieJar,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "form": {
                sid: sid,
                productId: productId,
                curStep: "CONTRACT"
            }
        },
        function(err, httpResponse, body) {
            //console.log("traceContract---------", body);
            callback();
        });
}


function checkTraceOtp(userId, productId, sid, cookieJar, callback) {
    simplehttp.GET("https://trading.lufax.com/trading/service/trade/check-trace?sid=" + sid + "&productId=" + productId + "&userId=" + userId + "&curStep=OTP" + "&_=" + (new Date()).getTime(), {
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            //console.log("check-trace: OTP", new Date(), body);
            callback(body);
        });
}


function traceOtp(productId, sid, cookieJar, callback) {
    simplehttp.POST("https://trading.lufax.com/trading/service/trade/trace", {
            "cookieJar": cookieJar,
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "form": {
                sid: sid,
                productId: productId,
                curStep: "OTP"
            }
        },
        function(err, httpResponse, body) {
            console.log("traceOtp", body);
            callback(body);
        });
}


function securityValid(productId, sid, cookieJar, callback) {
    simplehttp.GET('https://static.lufaxcdn.com/trading/resource/securityValid/main/1be866c2e005.securityValid.js', {
            "cookieJar": cookieJar
        },
        function(err, httpResponse, body) {
            var publicKey = htmlparser.getValueFromBody('encryptPwd:function(e){var t="', '",n=', body);
            var rsaExponent = htmlparser.getValueFromBody('n.setPublic(t,"', '"),n.', body);

            console.log("securityValid:", rsaExponent, publicKey)
            callback(publicKey, rsaExponent);
        });
}

function investmentRequest(productId, sid, password, captachStr, imageId, cookieJar, callback) {
    simplehttp.POST("https://trading.lufax.com/trading/users/1145923/investment-request", {
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
                "paymentMethod": 1
            }
        },
        function(err, httpResponse, body) {
            var json = JSON.parse(body);
            callback(json);
        });
}

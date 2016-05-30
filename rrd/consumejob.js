var htmlparser = require('../htmlparser');
var logutil = require("../logutil").config("rrdconsume");
var simplehttp = require('../simplehttp');
var cmbcPwd = require('./cmbcPwd');

var PRODUCE_TO_CONSUME_MIN = 2000;
var CONSUMING_INTERVAL_MIN = 5000;

// exports.checkConsuming
// function checkConsuming(account, toBeConsumed){
//     if (!readyForConsume(account)) return 0;
//     if (!ableToConsume(account, toBeConsumed)) return 0;
//     var canBuyShares = sharesAbleToConsume(account, toBeConsumed);
//     return canBuyShares;
// }

exports.consume = consume;

function consume(account, toBeConsumed, callback) {
    if (!readyForConsume(account)) return false;
    if (!ableToConsume(account, toBeConsumed)) return false;
    logutil.info("\ntoBeConsumed", toBeConsumed.publishTime, toBeConsumed.transferId, toBeConsumed.pricePerShare, toBeConsumed.sharesAvailable, toBeConsumed.interest);
    //var t = PRODUCE_TO_CONSUME_MIN - (new Date() - toBeConsumed.producedTime);

    account.lock();

    getTransferPageDetail(toBeConsumed, function(product) {
        doConsume(account, product, function(spent) {
            if (spent > 0) {
                account.availableBalance -= spent;
                account.lastConsumingTime = new Date();
                product.tradeTime = account.lastConsumingTime.getTime();
                account.addToConsumeHistory(product)
            }
            account.unlock();
            if (callback) callback(spent);
        });
    });

    // if (t <= 0) {
    //     var canBuyShares = doConsume(account, toBeConsumed, cb);
    // } else {
    //     // logutil.info("consume too soon... :", t+"ms")
    //     setTimeout(doConsume, t, account, toBeConsumed, cb);
    // }
    var canBuyShares = sharesAbleToConsume(account, toBeConsumed);
    toBeConsumed.sharesAvailable -= canBuyShares;
    return toBeConsumed.sharesAvailable <= 0;
}


function doConsume(account, toBeConsumed, callback) {
    if (toBeConsumed.transferId) {
        var canBuyShares = sharesAbleToConsume(account, toBeConsumed);
        if (canBuyShares <= 0) {
            callback(0);
            return;
        }

        // logutil.info("doConsume******:", account.user, account.availableBalance, toBeConsumed.transferId, toBeConsumed.interest, 
        //     canBuyShares, toBeConsumed.sharesAvailable, toBeConsumed.pricePerShare,
        //     toBeConsumed.transferIdCode);
        logutil.info("doConsume******:", account.user, account.availableBalance, canBuyShares, toBeConsumed.transferIdCode, toBeConsumed.countRatio, toBeConsumed, '\n');
        simplehttp.POST('http://www.we.com/transfer/buyLoanTransfer.action', {
                form: {
                    "agree-contract": "on",
                    countRatio: toBeConsumed.countRatio,
                    couponId: '',
                    currentPrice: toBeConsumed.pricePerShare,
                    share: canBuyShares,
                    transferId: toBeConsumed.transferIdCode
                },
                "headers": {
                    // "Accept": 'image/gif, image/jpeg, image/pjpeg, application/x-ms-application, application/xaml+xml, application/x-ms-xbap, */*',
                    // "Accept-Encoding": 'gzip, deflate',
                    // "Content-Type": 'application/x-www-form-urlencoded',
                    // "Host": 'www.we.com',
                    // "Referer": 'http://www.we.com/transfer/loanTransferDetail.action?transferId=' + toBeConsumed.transferId,
                    //"Upgrade-Insecure-Requests": 1
                },
                "cookieJar": account.cookieJar
            },
            function(err, request, body) {
                if (request && request.statusCode === 200) {
                    var actionurl = htmlparser.getValueFromBody('<input type="hidden" id="actionUrl" name="actionUrl" size=100px value="', '" />', body);
                    var context = htmlparser.getValueFromBody('<input type="hidden" id="context" name="context" size=100px value="', '" />', body);
                    if (actionurl && context) {
                        cmbcPwd.cmbcPageHandler(account, actionurl, context, function(succeed) {
                            logutil.info("cmbcPageHandler ******", succeed, succeed ? (canBuyShares * toBeConsumed.pricePerShare) : 0)
                            callback(succeed ? (canBuyShares * toBeConsumed.pricePerShare) : 0)
                        })
                    } else {
                        logutil.info("before cmbcPageHandler", actionurl, context, body)
                        if (callback) callback(0);
                    }

                    ;
                } else {
                    //302 = 对不起！因使用第三方程序
                    var cookie_string = account.cookieJar.getCookieString("https://www.we.com");
                    logutil.error("ERROR consumejob consume", toBeConsumed.transferId, request.statusCode, body, cookie_string);
                    if (callback) callback(0);
                }

            });

        return canBuyShares;
    }
}

// function doConsume(account, toBeConsumed, callback) {
//     if (toBeConsumed.transferId) {
//         var canBuyShares = sharesAbleToConsume(account, toBeConsumed);
//         if (canBuyShares <= 0) {
//             callback(0);
//             return;
//         }

//         logutil.info("rrd doConsume:", account.availableBalance, toBeConsumed.transferId, toBeConsumed.interest, canBuyShares, toBeConsumed.sharesAvailable, toBeConsumed.pricePerShare);
//         simplehttp.POST('http://www.we.com/transfer/buyLoanTransfer.action', {
//                 form: {
//                     "agree-contract": "on",
//                     transferId: toBeConsumed.transferIdCode,
//                     currentPrice: toBeConsumed.pricePerShare,
//                     share: canBuyShares,
//                     countRatio: toBeConsumed.countRatio
//                 },
//                 "cookieJar": account.cookieJar
//             },
//             function(err, request, body) {
//                 if (request.statusCode === 302) {
//                     confirmSpent(toBeConsumed.transferId, account, function(prd) {
//                         if (prd.status === '0' && prd.shares > 0 && !isNaN(prd.price) && prd.price > 0) {
//                             account.availableBalance -= prd.price;
//                             account.lastConsumingTime = new Date();
//                             prd.tradeTime = account.lastConsumingTime.getTime();
//                             account.addToConsumeHistory(prd)
//                         }

//                         //logutil.info("confirmSpent", status===0, spent, shares, toBeConsumed.transferId, account.availableBalance);
//                         if (callback) callback(prd.price);
//                         // account.locked = false;
//                     })
//                 } else {
//                     console.log("ERROR consumejob consume", toBeConsumed.transferId, body);
//                     if (callback) callback(null);
//                 }

//             });

//         return canBuyShares;
//     }
// }

function confirmSpent(transferId, account, callback) {

    simplehttp.GET('http://www.we.com/transfer/loanTransferDetail.action?transferId=' + transferId, {
            "cookieJar": account.cookieJar
        },
        function(err, request, body) {
            //<div id="pg-server-message" data-status="0" data-message="您已成功投资16.01元，获得1份债权及折让收益0.0元" data-ispop="true" style="display: none;"></div>

            //   <div id="pg-server-message" data-status="0" data-message="您已成功投资45.47元，获得1份债权及折让收益0.0元" data-ispop="true" style="display: none;"></div>
            //<div id="pg-server-message" data-status="1" data-message="该债权不能购买" data-ispop="" style="display: none;"></div>
            var status = htmlparser.getValueFromBody('id="pg-server-message" data-status="', '" data-message', body);
            var displayName = htmlparser.getValueFromBody('<em class="title-text">', '</em>', body);
            var price = Number(htmlparser.getValueFromBody('您已成功投资', '元', body));
            var interest = Number(htmlparser.getValueFromBody('<em class="text-xxxl num-family color-dark-text">', '</em>', body)) / 100;
            var share = Number(htmlparser.getValueFromBody('元，获得', '份债权及折让收益', body));
            callback({
                status: status,
                transferId: transferId,
                displayName: displayName,
                price: price,
                shares: share,
                interest: interest
            });
        });
}

function sharesAbleToConsume(account, toBeConsumed) {
    var maxShares = Math.floor(account.availableBalance / toBeConsumed.pricePerShare);
    var shares = Math.min(maxShares, Math.floor(toBeConsumed.sharesAvailable * 0.8));
    return shares;
}

function ableToConsume(account, toBeConsumed) {
    var shares = sharesAbleToConsume(account, toBeConsumed);
    var price = shares * toBeConsumed.pricePerShare;
    return toBeConsumed.sharesAvailable > 0 && account.interestLevelMin <= toBeConsumed.interest && price >= account.pricePerBidMin && price <= account.pricePerBidMax && account.availableBalance - price >= account.reservedBalance && (account.lastConsumingTime === null || (new Date() - account.lastConsumingTime) > CONSUMING_INTERVAL_MIN)
}

function readyForConsume(account) {
    if (account.locked) return false;

    return true;
}


function getTransferPageDetail(product, callback) {
    simplehttp.GET('http://www.we.com/transfer/loanTransferDetail.action?transferId=' + product.id, {},
        function(err, request, body) {
            if (request.statusCode === 200) {
                var sharesAvailable = Number(htmlparser.getValueFromBody('data-shares="', '">', body));
                var interest = Number(product.interest); //Number(htmlparser.getValueFromBody('<em class="text-xxxl num-family color-dark-text">', '</em>', body));
                interest = interest / 100;
                var price = Number(product.pricePerShare); //Number(htmlparser.getValueFromBody('data-amount-per-share="', '">', body));
                //var duration = htmlparser.getValueFromBody('<div class="box"><em>成交用时</em><span>', '秒</span></div>', body);
                var transferIdCode = htmlparser.getValueFromBody('<input name="transferId" type="hidden" value="', '" />', body);

                var countRatio = htmlparser.getValueFromBody('<input name="countRatio" type="hidden" value="', '" />', body);
                var disabled = body.indexOf('此债权已不可购买') >= 0;

                var transferObj = {
                    transferId: product.id,
                    transferIdCode: transferIdCode,
                    interest: interest,
                    sharesAvailable: sharesAvailable,
                    pricePerShare: price,
                    countRatio: countRatio,
                    //duration: duration,
                    source: product.source,
                    producedTime: product.producedTime,
                    publishTime: product.publishTime,
                    disabled: disabled
                };
                if (transferObj.interest >= 0.13)
                    logutil.info("->", transferObj.transferId, transferObj.interest, transferObj.sharesAvailable, disabled, body.length);
                callback(transferObj)
            } else {
                logutil.error("ERROR consumejob consume", toBeConsumed.transferId, body);
                if (callback) callback(null);
            }

        });


}

var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var simplehttp = require('../simplehttp');
var PRODUCE_TO_CONSUME_MIN = 2000;
var CONSUMING_INTERVAL_MIN = 5000;

exports.consume = consume;

function consume(account, toBeConsumed, callback) {
    if (!readyForConsume(account)) return false;
    if (!ableToConsume(account, toBeConsumed)) return false;
    logutil.log("rrd toBeConsumed", toBeConsumed.publishTime, toBeConsumed.transferId, toBeConsumed.pricePerShare, toBeConsumed.sharesAvailable, toBeConsumed.interest);
    var t = PRODUCE_TO_CONSUME_MIN - (new Date() - toBeConsumed.producedTime);

    account.lock();
    var cb = function(spent) {
        if (callback) callback(spent);
        account.unlock();
    }
    if (t <= 0) {
        var canBuyShares = doConsume(account, toBeConsumed, cb);
    } else {
        // logutil.log("consume too soon... :", t+"ms")
        setTimeout(doConsume, t, account, toBeConsumed, cb);
    }
    //toBeConsumed.sharesAvailable -= canBuyShares;
    return false; //toBeConsumed.sharesAvailable <= 0;
}

function doConsume(account, toBeConsumed, callback) {
    if (toBeConsumed.transferId) {
        var canBuyShares = sharesAbleToConsume(account, toBeConsumed);
        if (canBuyShares <= 0) {
            callback(0);
            return;
        }

        logutil.log("rrd doConsume:", account.availableBalance, toBeConsumed.transferId, toBeConsumed.interest, canBuyShares, toBeConsumed.sharesAvailable, toBeConsumed.pricePerShare);
        simplehttp.POST('http://www.we.com/transfer/buyLoanTransfer.action', {
                form: {
                    "agree-contract": "on",
                    transferId: toBeConsumed.transferIdCode,
                    currentPrice: toBeConsumed.pricePerShare,
                    share: canBuyShares,
                    countRatio: toBeConsumed.countRatio
                },
                "cookieJar": account.cookieJar
            },
            function(err, request, body) {
                if (request.statusCode === 302) {
                    confirmSpent(toBeConsumed.transferId, account, function(prd) {
                        if (prd.status === '0' && prd.shares > 0 && !isNaN(prd.price) && prd.price > 0) {
                            account.availableBalance -= prd.price;
                            account.lastConsumingTime = new Date();
                            prd.tradeTime = account.lastConsumingTime.getTime();
                            account.addToConsumeHistory(prd)
                        }

                        //logutil.log("confirmSpent", status===0, spent, shares, toBeConsumed.transferId, account.availableBalance);
                        if (callback) callback(prd.price);
                        // account.locked = false;
                    })
                } else {
                    console.log("ERROR consumejob consume");
                    if (callback) callback(null);
                }

            });

        return canBuyShares;
    }
}

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
            var interest = Number(htmlparser.getValueFromBody('<em class="text-xxxl num-family color-dark-text">', '</em>', body))/100;
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
    var shares = Math.min(maxShares, Math.ceil(toBeConsumed.sharesAvailable * 0.5));
    return shares;
}

function ableToConsume(account, toBeConsumed) {
    var shares = sharesAbleToConsume(account, toBeConsumed);
    var price = shares *  toBeConsumed.pricePerShare;
    return toBeConsumed.sharesAvailable > 0 && account.interestLevelMin <= toBeConsumed.interest
    && price >= account.pricePerBidMin && price <= account.pricePerBidMax 
    && account.availableBalance - price >= account.reservedBalance 
    && (account.lastConsumingTime === null || (new Date() - account.lastConsumingTime) > CONSUMING_INTERVAL_MIN)
}

function readyForConsume(account) {
    if (account.locked) return false;

    return true;
}

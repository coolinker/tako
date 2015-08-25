var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var simplehttp = require('../simplehttp');
var PRODUCE_TO_CONSUME_MIN = 0;
var CONSUMING_INTERVAL_MIN = 5000;

exports.consume = consume;

function consume(account, toBeConsumed, callback) {
    if (!readyForConsume(account)) return false;
    if (!ableToConsume(account, toBeConsumed)) return false;

    //var t = PRODUCE_TO_CONSUME_MIN - (new Date() - toBeConsumed.producedTime);

    account.locked = true;

    //if (t < 0) {
    var canBuyShares = doConsume(account, toBeConsumed, callback);
    // } else {
    //     // logutil.log("consume too soon... :", t+"ms")
    //     setTimeout(doConsume, t, account, toBeConsumed, callback);
    // }
    toBeConsumed.sharesAvailable -= canBuyShares;
    return toBeConsumed.sharesAvailable<=0;
}

function doConsume(account, toBeConsumed, callback) {
    if (toBeConsumed.transferId) {
        // logutil.log("rrd doConsume:", account.availableBalance, toBeConsumed.transferId, toBeConsumed.interest, toBeConsumed.sharesAvailable, toBeConsumed.pricePerShare);
        var canBuyShares = sharesAbleToConsume(account, toBeConsumed);

        simplehttp.POST('http://www.renrendai.com/transfer/buyLoanTransfer.action', {
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
                    confirmSpent(toBeConsumed.transferId, account, function(spent) {
                        if (!isNaN(spent)) {
                            account.availableBalance -= spent;    
                        }
                        logutil.log("confirmSpent:", toBeConsumed.transferId, spent, account.availableBalance);
                        if (spent>0) account.lastConsumingTime = new Date();
                        if (callback) callback(spent);
                        account.locked = false;
                    })
                } else {
                    console.log("ERROR consumejob consume");
                }

            });

        return canBuyShares;
    }
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

function sharesAbleToConsume(account, toBeConsumed) {
    var maxShares = Math.floor(account.availableBalance / toBeConsumed.pricePerShare);

    return Math.min(maxShares, Math.ceil(toBeConsumed.sharesAvailable*0.5));
    //return 1;
}

function ableToConsume(account, toBeConsumed) {
    return toBeConsumed.sharesAvailable > 0 
        && account.interestLevel <= toBeConsumed.interest 
        && account.availableBalance > account.minValidBalance
        && (account.lastConsumingTime === null || (new Date() - account.lastConsumingTime) > CONSUMING_INTERVAL_MIN)
}

function readyForConsume(account) {
    if (account.locked) return false;

    return true;
}

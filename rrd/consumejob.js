var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var simplehttp = require('../simplehttp');
var INTERVAL_FOR_NEXT_CONSUME = 10000;
var PRODUCE_TO_CONSUME_MIN = 2700;
var CONSUMING_INTERVAL_MIN = 5000;

exports.consume = consume;

function consume(account, toBeConsumed, callback) {
    if (!readyForConsume(account)) return false;
    if (!ableToConsume(account, toBeConsumed)) return false;

    var t = PRODUCE_TO_CONSUME_MIN - (new Date() - toBeConsumed.producedTime);

    account.locked = true;

    if (t < 0) {
        doConsume(account, toBeConsumed, callback);
    } else {
        logutil.log("consume too soon... :", t)
        setTimeout(doConsume, t, account, toBeConsumed, callback);
    }

    return true;
}

function doConsume(account, toBeConsumed, callback) {
    if (toBeConsumed.transferId) {
        logutil.log("rrd doConsume:", account.avaliableBalance, toBeConsumed.transferId, toBeConsumed.interest, toBeConsumed.sharesAvailable, toBeConsumed.pricePerShare);
        var canBuyShares = sharesAbleToConsume(account, toBeConsumed);

        simplehttp.POST('http://www.renrendai.com/transfer/buyLoanTransfer.action', {
                "agree-contract": "on",
                transferId: toBeConsumed.transferIdCode,
                currentPrice: toBeConsumed.pricePerShare,
                share: canBuyShares,
                countRatio: toBeConsumed.countRatio,
                "../cookieJar": account.cookieJar
            },
            function(err, request, body) {
                if (request.statusCode === 302) {
                    confirmSpent(toBeConsumed.transferId, account, function(spent) {
                        if (!isNaN(spent)) {
                            account.avaliableBalance -= spent;    
                        }
                        logutil.log("confirmSpent:", toBeConsumed.transferId, spent, account.avaliableBalance);
                        account.locked = false;
                        if (callback) callback(spent);
                        account.lastConsumingTime = new Date();
                    })
                } else {
                    console.log("ERROR consumejob consume");
                }

            });
    }
}

function confirmSpent(transferId, account, callback) {
    simplehttp.GET('http://www.renrendai.com/transfer/loanTransferDetail.action?transferId=' + transferId, {
            "../cookieJar": account.cookieJar
        },
        function(err, request, body) {
            //   <div id="pg-server-message" data-status="0" data-message="您已成功投资45.47元，获得1份债权及折让收益0.0元" data-ispop="true" style="display: none;"></div>
            var spent = Number(htmlparser.getValueFromBody('您已成功投资', '元', body));
            callback(spent);
        });
}

function sharesAbleToConsume(account, toBeConsumed) {
    var maxShares = Math.floor(account.avaliableBalance / toBeConsumed.pricePerShare);
    return Math.min(maxShares, toBeConsumed.sharesAvailable-1);
}

function ableToConsume(account, toBeConsumed) {
    return toBeConsumed.sharesAvailable > 0 
        && account.interestLevel <= toBeConsumed.interest 
        && account.avaliableBalance > account.minValidBalance
        && (account.lastConsumingTime === null || (new Date() - account.lastConsumingTime) > CONSUMING_INTERVAL_MIN)
}

function readyForConsume(account) {
    if (account.locked) return false;

    return true;
}

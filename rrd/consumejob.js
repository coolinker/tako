var simplehttp = require('../simplehttp');
var INTERVAL_FOR_NEXT_CONSUME = 10000;
var PRODUCE_TO_CONSUME_MIN = 2700;

exports.consume = consume;
function consume(account, toBeConsumed, callback) {
    if (!readyForConsume(account)) return false;
    if (!ableToConsume(account, toBeConsumed)) return false;

    var t = (new Date()) - toBeConsumed.producedTime - PRODUCE_TO_CONSUME_MIN;
    console.log("---------------------consume", t)
    if (t >= 0) {
        doConsume(account, toBeConsumed, callback);
    } else {
        logutil.log("consume too soon:", t)
        setTimeout(doConsume, -t,  account, toBeConsumed, callback);
    } 

    return true;
}

function doConsume(account, toBeConsumed, callback) {
    if (toBeConsumed.transferId) {
        logutil.log("rrd doConsume:", account, toBeConsumed);
    console.log("-------------------------------------------doConsume")

        return;
        
        account.locked = true;
        simplehttp.POST('http://www.renrendai.com/transfer/buyLoanTransfer.action', {
            "agree-contract": "on",
            transferId: toBeConsumed.transferIdCode,
            currentPrice: toBeConsumed.pricePerShare,
            share: toBeConsumed.sharesAvailable,
            countRatio: toBeConsumed.countRatio,
            "../cookieJar": account.cookieJar
        },        
        function(err, request, body) {
            //request.statusCode === 302
            logutil.log("rrd doConsume finished:", request.statusCode, account, toBeConsumed);
            if (INTERVAL_FOR_NEXT_CONSUME>0) {
                setTimeout(function(){
                    account.locked = false;
                }, INTERVAL_FOR_NEXT_CONSUME);
            } else {
                account.locked = false;
            }
        });
    }
}

function ableToConsume(account, toBeConsumed){
    return (toBeConsumed.shares>0 && account.interestLevel <= toBeConsumed.interest)
}

function readyForConsume(account) {
    if (account.locked) return false;

    return true;
    //return (account.lastConsumingTime === null || (new Date() - account.lastConsumingTime) > MIN_CONSUMING_INTERVAL) ;
}

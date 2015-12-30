var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var simplehttp = require('../simplehttp');

var PRODUCE_TO_CONSUME_MIN = 0;
var CONSUMING_INTERVAL_MIN = 5000;

exports.consume = consume;

function consume(account, toBeConsumed, callback) {
    if (!readyForConsume(account)) return false;
    if (!ableToConsume(account, toBeConsumed)) return false;
    var t = PRODUCE_TO_CONSUME_MIN - (new Date() - toBeConsumed.producedTime);
    account.locked = true;

    if (t <= 0) {
        doConsume(account, toBeConsumed, callback);
    } else {
        logutil.log("consume too soon... :", t+"ms")
        setTimeout(doConsume, t, account, toBeConsumed, callback);
    }

    return true;
}

function doConsume(account, toBeConsumed, callback) {
    if (toBeConsumed.sid) {
        //logutil.log("my089 doConsume:", account.availableBalance, toBeConsumed.sid, toBeConsumed.interest, toBeConsumed.percentFinished);
        simplehttp.GET('https://www.my089.com/Loan/OnBid.aspx?sid='+ toBeConsumed.sid, {
                "cookieJar": account.cookieJar
            },
            function(err, request, body) {
                if (request.statusCode === 200) {
                    doOnBid(account, toBeConsumed, body, function(confirm) {
                        if (confirm>0) {
                            recordConsumeHIstory(account, toBeConsumed);
                        }
                        logutil.log("my089 confirm:", toBeConsumed.sid, confirm, account.availableBalance);
                        account.locked = false;
                        if (callback) callback(confirm);
                        account.lastConsumingTime = new Date();
                    })
                } else {
                    console.log("ERROR consumejob consume");
                    account.locked = false;
                }

            });
    }
}

function doOnBid(account, toBeConsumed, body, callback) {
    var __EVENTTARGET = htmlparser.getValueFromBody('id="__EVENTTARGET" value="', '" />', body);
    var __EVENTARGUMENT = htmlparser.getValueFromBody('id="__EVENTARGUMENT" value="', '" />', body);
    var __VIEWSTATE = htmlparser.getValueFromBody('id="__VIEWSTATE" value="', '" />', body);
    var __VIEWSTATEGENERATOR = htmlparser.getValueFromBody('id="__VIEWSTATEGENERATOR" value="', '" />', body);
    var __EVENTVALIDATION = htmlparser.getValueFromBody('id="__EVENTVALIDATION" value="', '" />', body);
    var maxValidFund = Number(htmlparser.getValueFromBody('您最多还可以再投<b class="red font_16 font_ya normal">￥', '</b>元', body));
    var percentFinished = Number(htmlparser.getValueFromBody('当前进度：</p><p class="Load"><em style="width:'
        , '%', body));
    var availableBalanceStr = htmlparser.getValueFromBody('您的可用余额：</p><p><span id="uamt" class="font_ya red">￥', '</span>元', body);
    var availableBalance = availableBalanceStr!=null ? Number(availableBalanceStr.replace(",", "")): 0;
    account.availableBalance = availableBalance;
    var validFund = fundAbleToConsume(account, maxValidFund);
    if (validFund===0) {
        callback(0);
        return;
    }

    var sid = toBeConsumed.sid;
    // var printObj = {
    //             __EVENTTARGET: __EVENTTARGET,
    //             __EVENTARGUMENT: __EVENTARGUMENT,
    //             __VIEWSTATE: __VIEWSTATE,
    //             __VIEWSTATEGENERATOR: __VIEWSTATEGENERATOR,
    //             __EVENTVALIDATION: __EVENTVALIDATION,
    //             "ctl00$ContentPlaceHolder1$txtBidAmt": validFund,
    //             "ctl00$ContentPlaceHolder1$btnBid": "确认无误，投标"
    //         }
    // console.log("maxValidFund", validFund, maxValidFund,  percentFinished, toBeConsumed.percentFinished, printObj);
    
    simplehttp.POST('https://www.my089.com/Loan/OnBid.aspx?sid='+ sid, {
                "cookieJar": account.cookieJar,
                form: {
                    __EVENTTARGET: __EVENTTARGET,
                    __EVENTARGUMENT: __EVENTARGUMENT,
                    __VIEWSTATE: __VIEWSTATE,
                    __VIEWSTATEGENERATOR: __VIEWSTATEGENERATOR,
                    __EVENTVALIDATION: __EVENTVALIDATION,
                    "ctl00$ContentPlaceHolder1$txtBidAmt": validFund,
                    "ctl00$ContentPlaceHolder1$btnBid": "确认无误，投标"
                }
            },
            function(err, request, body) {            
                if (request.statusCode === 302) {
                    callback(validFund);
                } else {
                    callback(0);
                }

            });
}

function recordConsumeHIstory(account, toBeConsumed){
    if (!account.consumeHistory[account.source]) account.consumeHistory[account.source] = {};
    account.consumeHistory[account.source][toBeConsumed.sid] = toBeConsumed;
}

function fundAbleToConsume(account, maxValidFund) {
    return Math.min(account.pricePerBidMax, maxValidFund);
}

function ableToConsume(account, toBeConsumed) {
    return (account.consumeHistory[account.source] === undefined || account.consumeHistory[account.source][toBeConsumed.sid] === undefined)
        && toBeConsumed.percentFinished < 100 
        && account.interestLevelMin <= toBeConsumed.interest 
        && account.availableBalance > account.reservedBalance
        && (account.lastConsumingTime === null || (new Date() - account.lastConsumingTime) > CONSUMING_INTERVAL_MIN)
}

function readyForConsume(account) {
    if (account.locked) return false;

    return true;
}

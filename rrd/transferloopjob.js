var htmlparser = require('../htmlparser');
var logutil = require("../logutil").config("rrdtransfer");
var cmbcPwd = require('./cmbcPwd');
var detectLatestTransferId = require("./detectlatesttransferid");
var LoopJob = require("../loopjob");
var simplehttp = require('../simplehttp');

var detectStarted = false;
var me = this;
exports.rollNewProductCheck = rollNewProductCheck;

function rollNewProductCheck(callback) {

    loopListTransfer(function(newTransferObj) {
        // transfers.push(newTransferObj);
        // if (transfers.length > 100) transfers.shift();
        callback(newTransferObj);
    })
}

// function rollNewProductCheck(callback) {
//     var transfers = [];
//     if (detectStarted) return;
//     detectStarted = true;
//     detectLatestTransferId(function(startId) {
//         detectStarted = false;
//         loopListTransfer(function(newTransferObj) {
//             // transfers.push(newTransferObj);
//             // if (transfers.length > 100) transfers.shift();
//             callback(newTransferObj);
//         })
//     }, 10000);
// }

function loopNewTransfer(startId, callback) {
    if (this.loopjob) {
        if (!this.loopjob.isLoopingStarted()) {
            this.loopjob.startLooping();
        }
        logutil.info("loopNewTransfer loopjob existed");
        return;
    }
    var lastDetectTime = new Date();
    var latestConsumedProductId = 0;
    var transferId = Number(startId);
    var hasNew = true;
    var LOOP_INTERVAL = 1000;
    var detectStep = 0;
    var disabledStep = 0;
    var loopjob = new LoopJob().config({
        parallelRequests: 1,
        url: "http://www.we.com/transfer/loanTransferDetail.action", //http://api.we.com/2.0/loantransfer/detail.action
        loopInterval: LOOP_INTERVAL,
        timeout: 1.8 * LOOP_INTERVAL,
        urlInjection: function(parallelIndex, url) {
            var tsfrid = transferId + parallelIndex + detectStep + disabledStep;
            return url + "?transferId=" + tsfrid;
        },
        optionsInjection: function(parallelIndex, options) {
            var tsfrid = transferId + parallelIndex + detectStep + disabledStep;
            options.transferId = tsfrid;
            return options;
        },
        responseHandler: function(error, response, body) {
            if (error) {
                //console.log("loanTransferDetail error:", error)
            } else if (response.statusCode == 200) {
                var errorcode = htmlparser.getValueFromBody('<div style="display: none;">', '</div>', body);
                if (errorcode === "500") {
                    if (hasNew) {
                        hasNew = false;
                        logutil.info("-|", transferId);
                    }
                    if (disabledStep > 0) {
                        disabledStep = 0;
                    } else if ((new Date() - lastDetectTime) > 60000) {
                        detectStep = Math.floor(Math.random() * 5);
                    }
                    //no new item.
                } else {
                    detectStep = 0;
                    lastDetectTime = new Date();
                    var sharesAvailable = Number(htmlparser.getValueFromBody('data-shares="', '">', body));
                    var interest = Number(htmlparser.getValueFromBody('<em class="text-xxxl num-family color-dark-text">', '</em>', body));
                    interest = interest / 100;
                    var price = Number(htmlparser.getValueFromBody('data-amount-per-share="', '">', body));
                    //var duration = htmlparser.getValueFromBody('<div class="box"><em>成交用时</em><span>', '秒</span></div>', body);
                    var transferIdCode = htmlparser.getValueFromBody('<input name="transferId" type="hidden" value="', '" />', body);
                    var countRatio = htmlparser.getValueFromBody('<input name="countRatio" type="hidden" value="', '" />', body);
                    var disabled = body.indexOf('此债权已不可购买') >= 0;
                    var unknown = htmlparser.getValueFromBody(' UNKNOWN ', 'id="invest-submit"', body);

                    var transferObj = {
                        transferId: transferId,
                        transferIdCode: transferIdCode,
                        interest: interest,
                        sharesAvailable: sharesAvailable,
                        pricePerShare: price,
                        countRatio: countRatio,
                        //duration: duration,
                        source: "www.renrendai.com",
                        publishTime: new Date(),
                        producedTime: new Date()
                    };
                    hasNew = true;
                    if (!disabled && transferId > latestConsumedProductId) {
                        callback(transferObj);
                        latestConsumedProductId = transferId;
                    }
                    var req = response.request;
                    var tid = req.__options.transferId;

                    if (tid >= transferId) {
                        if (transferObj.interest >= 0.13 && transferObj.sharesAvailable >= 1) {
                            logutil.info("->", transferObj.transferId, transferObj.interest, transferObj.sharesAvailable, transferObj.producedTime.toLocaleTimeString(), disabled, unknown);
                        }
                        transferId = tid + 1;
                        if (disabled) {
                            disabledStep = Math.floor(Math.random() * 5);
                        }
                    }
                }
            } else {
                console.log("?????????????????????????????? statusCode:", response.statusCode)
            }

        }
    });

    loopjob.startLooping();
    me.loopjob = loopjob;

}



exports.stopRollingNewProductCheck = stopRollingNewProductCheck;

function stopRollingNewProductCheck() {
    // clearInterval(rollingIntervalObj)
    this.loopjob.stopLooping();
}

exports.isRollingStarted = isRollingStarted;

function isRollingStarted() {
    // return !!rollingIntervalObj;
    return this.loopjob && this.loopjob.isLoopingStarted();
}

exports.isLoopingStarted = isLoopingStarted;

function isLoopingStarted() {
    return this.loopjob && this.loopjob.isLoopingStarted();
}

exports.stopNewTransferLoop = stopNewTransferLoop;

function stopNewTransferLoop() {
    console.log("stopNewTransferLoop rrd")
    this.loopjob.stopLooping();
}

function loopListTransfer(callback) {
    if (this.loopjob) {
        if (!this.loopjob.isLoopingStarted()) {
            this.loopjob.startLooping();
        }
        console.log("loopNewTransfer loopjob existed");
        return;
    }
    var LOOP_INTERVAL = 500;
    var pageDetailLog = {};
    var loopjob = new LoopJob().config({
        parallelRequests: 1,
        url: "http://www.we.com/transfer/transferList!json.action",
        loopInterval: LOOP_INTERVAL,
        timeout: 1.8 * LOOP_INTERVAL,
        urlInjection: function(parallelIndex, url) {
            return url + "?_=" + new Date().getTime();
        },
        responseHandler: function(error, response, body) {
            if (error) {
                // console.log("loanTransferDetail error:", error)
            } else if (response.statusCode == 200) {
                try {
                    var products = JSON.parse(body).data.transferList;
                    var avprd = [];
                     for (var i = 0; i < products.length; i++) {
                        var product = products[i];
                        if (Number(product.share) === 0 || pageDetailLog[product.id]) continue;
                        pageDetailLog[product.id] = true;
                        product.interest = Number(product.interest)/100;
                        product.sharesAvailable = Number(product.share);
                        product.price = Number(product.pricePerShare);
                        product.producedTime  = product.publishTime = new Date();
                        product.source = "www.renrendai.com";
                        avprd.push(product);
                        if (product.interest > 0.12)
                            logutil.info("toBeConsumed", product);
    
                    }

                    avprd.sort(function(p1, p2){
                        if (p1.interest > p2.interest) return -1;
                        else if (p1.interest < p2.interest) return 1;
                        else if (p1.sharesAvailable > p2.sharesAvailable) return -1;
                        else if  (p1.sharesAvailable < p2.sharesAvailable) return 1;
                        else return 0;
                    })
                    
                    if (avprd.length>0) {
                        callback(avprd);
                    }

                } catch (e) {
                    logutil.error("????????????? exception:", e)
                    if (body.indexOf('禁止访问')>0) {
                        logutil.error("禁止访问")
                        loopjob.pause(600000)
                    }
                }
            } else {
                console.log("?????????????????????????????? statusCode:", response.statusCode)
            }

        }
    });

    loopjob.startLooping();
    me.loopjob = loopjob;

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
                    source: "www.renrendai.com",
                    disabled: disabled
                };
                //if (transferObj.interest>=0.13)
                logutil.info("->", transferObj.transferId, transferObj.interest, transferObj.sharesAvailable, disabled, body.length);
                if (callback) callback(transferObj)
            } else {
                logutil.error("ERROR consumejob consume", toBeConsumed.transferId, body);
                if (callback) callback(null);
            }

        });


}
// null '{"data":{"agreementTitle":"?????????","agreementUrl":"http://www.we.com/account/wapContract.action?type=transfer",
// "loanTranfsferVo": {
//     "discountRatio": "100",
//     "id": "4523108",
//     "interestAndCorpus": "4.47",
//     "pricePerShare": "4.43",
//     "resultPice": "
//     4.43 ","
//     share ":"
//     0 "},"
//     loanVo ":{"
//     advanceRepayPenalRate ":"
//     1 % ","
//     allProtected ":" ? ? ","
//     amount ":"
//     24000.0 ","
//     borrowerLevel ":"
//     B ","
//     ce
//     rtificateType ":"
//     XYRZ ","
//     interest ":"
//     12 ","
//     leftMonths ":"
//     1 ","
//     loanId ":"
//     355010 ","
//     months ":"
//     12 ","
//     nextRepayDate ":"
//     2015 - 12 - 08 ","
//     ove
//     rDued ":" ? ? ? ? ? ? ? ","
//     repaymentType ":" ? ? ? ? ","
//     title ":" ? ? ? ? ? ? ? 5 ? ? ? "},"
//     userLoanRecord ":{"
//     alreadyPayCount ":4,"
//     availableCredits ":
//     24000,
//     "borrowAmount" : 94000,
//     "failedCount" : 0,
//     "notPay" : 2145.6,
//     "overdueAmount" : 0,
//     "overdueCount" : 2,
//     "successCount" : 5,
//     "totalCou
//     nt ":7},"
//     userVo ":{"
//     age ":"
//     33 ","
//     car ":" ? ","
//     carLoan ":" ? ","
//     graduation ":" ? ? ? ? ? ","
//     hasHouse ":" ? ","
//     houseLoan ":" ? ","
//     marriage ":" ? ? ",
//     "nickName" : "Buy366.rrd",
//     "officeDomain" : "",
//     "officeScale" : "",
//     "position" : "",
//     "province" : "?? ??",
//     "salary" : "10000-20000?",
//     "uni
//     versity ":" ? ? ? ? ","
//     workYears ":"
//     3 - 5 ? ( ? )
//     "}},"
//     status ":0}'
//     null '{"data":{},"message":"????????!","status":31030}'

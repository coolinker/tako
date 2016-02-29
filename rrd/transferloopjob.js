var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var detectLatestTransferId = require("./detectlatesttransferid");
var LoopJob = require("../loopjob");
var detectStarted = false;
var me = this;
exports.rollNewProductCheck = rollNewProductCheck;

function rollNewProductCheck(callback) {
    var transfers = [];
    if (detectStarted) return;
    detectStarted = true;
    detectLatestTransferId(function(startId) {
        detectStarted = false;
        loopNewTransfer(startId, function(newTransferObj) {
            // transfers.push(newTransferObj);
            // if (transfers.length > 100) transfers.shift();
            callback(newTransferObj);
        })
    }, 10000);
}

function loopNewTransfer(startId, callback) {
    if (this.loopjob) {
        if (!this.loopjob.isLoopingStarted()) {
            this.loopjob.startLooping();
        }
        console.log("loopNewTransfer loopjob existed");
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
                        logutil.log("-|", transferId);
                    }
                    if (disabledStep>0) {
                        disabledStep = 0;
                    } else if ((new Date() - lastDetectTime) > 60000) {
                        detectStep = Math.floor(Math.random()*5);
                    }
                    //no new item.
                } else {
                    detectStep = 0;
                    lastDetectTime = new Date();
                    var sharesAvailable = Number(htmlparser.getValueFromBody('data-shares="', '">', body));
                    var interest = Number(htmlparser.getValueFromBody('<em class="text-xxxl num-family color-dark-text">', '</em>', body));
                    interest = interest/100;
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
                            logutil.log("->", transferObj.transferId, transferObj.interest, transferObj.sharesAvailable, transferObj.producedTime.toLocaleTimeString(), disabled, unknown);
                        }
                        transferId = tid + 1;
                        if (disabled) {
                            disabledStep = Math.floor(Math.random()*5);
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

// function _loopNewTransfer(startId, callback) {
//     if (this.loopjob) {
//         console.log("loopNewTransfer loopjob existed");
//         return;
//     }

//     var transferId = Number(startId);
//     var transferIdStart = 0;
//     var hasNew = false;
//     var LOOP_INTERVAL = 300;
//     var loopjob = new LoopJob().config({
//         parallelRequests: 2,
//         url: "http://api.we.com/2.0/loantransfer/detail.action",
//         loopInterval: LOOP_INTERVAL,
//         timeout: 1.8 * LOOP_INTERVAL,
//         httpMethod: "POST",
//         // urlInjection: function(parallelIndex, url) {
//         //     return url + "?transferId=" + (transferId + parallelIndex);
//         // },
//         optionsInjection: function(parallelIndex, options) {
//             //options.transferId = (transferId + parallelIndex);
//             if (transferId - transferIdStart > 500) {
//                 logutil.log("***transferId rolling", transferId);
//                 transferIdStart = transferId;
//             }
//             options.form = {
//                 transferId: (transferId + parallelIndex),
//                 clientVersion: "30100",
//                 version: "2.0"
//             };

//             return options;
//         },
//         responseHandler: function(error, response, body) {
//             if (error) {
//                 console.log("loanTransferDetail error:", error)
//             } else if (response.statusCode == 200) {
//                 var loanTranfsferVo = JSON.parse(body).data.loanTranfsferVo;
//                 var loanVo = JSON.parse(body).data.loanVo;
//                 if (loanTranfsferVo) {
//                     var transferObj = {
//                         transferId: Number(loanTranfsferVo.id),
//                         //transferIdCode: transferIdCode,
//                         interest: Number(loanVo.interest),
//                         sharesAvailable: Number(loanTranfsferVo.share),
//                         pricePerShare: Number(loanTranfsferVo.pricePerShare),
//                         discountRatio: loanTranfsferVo.discountRatio,
//                         borrowerLevel: loanVo.borrowerLevel,
//                         source: "www.renrendai.com",
//                         publishTime: new Date(),
//                         producedTime: new Date()
//                     };
//                     hasNew = true;
//                     //console.log("transferObj", transferObj.transferId, transferObj.interest, transferObj.sharesAvailable)
//                     callback(transferObj);

//                     var req = response.request;
//                     var tid = req.__options.transferId;
//                     if (tid >= transferId) {
//                         if (transferObj.interest >= 10 && transferObj.sharesAvailable >= 1) {
//                             logutil.log("->", transferObj.transferId, transferObj.interest, transferObj.sharesAvailable, transferObj.producedTime.toLocaleTimeString());
//                         }

//                         transferId = tid + 1;
//                     }
//                 } else {
//                     if (hasNew) {
//                         hasNew = false;
//                         //console.log("-|", transferId, new Date().toLocaleTimeString())
//                     }

//                 }

//             } else {
//                 console.log("?????????????????????????????? statusCode:", response.statusCode)
//             }

//         }
//     });

//     loopjob.startLooping();
//     me.loopjob = loopjob;
// }

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

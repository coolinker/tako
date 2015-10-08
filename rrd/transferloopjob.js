var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var detectLatestTransferId = require("./detectlatesttransferid");
var LoopJob = require("../loopjob");
var me = this;
exports.rollNewProductCheck = rollNewProductCheck;
function rollNewProductCheck(callback) {
    var transfers = [];
    detectLatestTransferId(function(startId){
        loopNewTransfer(startId, function(newTransferObj) {
            // transfers.push(newTransferObj);
            // if (transfers.length > 100) transfers.shift();
            callback(newTransferObj);
        })
    }, 10000);
}

function loopNewTransfer(startId, callback) {
    if (this.loopjob) {
        console.log("loopNewTransfer loopjob existed");
        return;
    }

    var transferId = Number(startId);
    var hasNew = false;
    var LOOP_INTERVAL = 300;
    var loopjob = new LoopJob().config({
        parallelRequests: 2,
        url: "http://www.renrendai.com/transfer/loanTransferDetail.action",
        loopInterval: LOOP_INTERVAL,
        timeout: 1.8*LOOP_INTERVAL,
        urlInjection: function(parallelIndex, url) {
            return url + "?transferId=" + (transferId+parallelIndex);
        },
        optionsInjection: function(parallelIndex, options) {
            options.transferId = (transferId+parallelIndex);
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
                       // console.log("-|", transferId, new Date().toLocaleTimeString())
                    }
                    //no new item.
                } else {
                    var sharesAvailable = Number(htmlparser.getValueFromBody('<em id="max-shares" data-shares="', '">', body));
                    var interest = Number(htmlparser.getValueFromBody('<dd class="text-xxl"><em class="text-xxxl color-dark-text">', '</em>%</dd>', body));
                    var price = Number(htmlparser.getValueFromBody('<em id="amount-per-share" data-amount-per-share="', '">', body));
                    var duration = htmlparser.getValueFromBody('<div class="box"><em>成交用时</em><span>', '秒</span></div>', body);
                    var transferIdCode  = htmlparser.getValueFromBody('<input name="transferId" type="hidden" value="', '" />', body);
                    var countRatio  = htmlparser.getValueFromBody('<input name="countRatio" type="hidden" value="', '" />', body);
                    // var transferIdInPage = htmlparser.getValueFromBody('<span id="pg-helper-transfer-id">', '</span>', body);

                    var transferObj = {
                        transferId: transferId,
                        transferIdCode: transferIdCode,
                        interest: interest,
                        sharesAvailable: sharesAvailable,
                        pricePerShare: price,
                        countRatio: countRatio,
                        duration: duration,
                        source: "www.renrendai.com",
                        publishTime: new Date(),
                        producedTime: new Date()
                    };
                    hasNew = true;
                    if (transferObj.interest>=13) {
                        logutil.log("->", transferObj.transferId, transferObj.interest, transferObj.sharesAvailable, transferObj.producedTime.toLocaleTimeString());    
                    }
                    
                    callback(transferObj);

                    var req = response.request;
                    var tid = req.__options.transferId;
                    if (tid>=transferId) {
                        transferId  = tid+1;
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
    return  this.loopjob &&  this.loopjob.isLoopingStarted();
}

exports.stopNewTransferLoop = stopNewTransferLoop;
function stopNewTransferLoop() {
    console.log("stopNewTransferLoop rrd")
    this.loopjob.stopLooping();
}
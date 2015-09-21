var htmlparser = require('../htmlparser');
var detectLatestTransferId = require("./detectlatesttransferid");
var LoopJob = require("../loopjob");
var me = this;
exports.startNewTransferLoop = startNewTransferLoop;
function startNewTransferLoop(callback) {
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
    var loopjob = new LoopJob().config({
        url: "http://www.renrendai.com/transfer/loanTransferDetail.action",
        loopInterval: 500,
        timeout: 500,
        urlInjection: function(url) {
            return url + "?transferId=" + transferId;
        },
        responseHandler: function(error, request, body) {
            if (error) {
                //console.log("loanTransferDetail error:", error)
            } else if (request.statusCode == 200) {
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
                    var transferObj = {
                        transferId: transferId,
                        transferIdCode: transferIdCode,
                        interest: interest,
                        sharesAvailable: sharesAvailable,
                        pricePerShare: price,
                        countRatio: countRatio,
                        duration: duration,
                        source: "www.renrendai.com",
                        producedTime: new Date()
                    };
                    hasNew = true;
                    if (transferObj.interest>=12) {
                        console.log("->", transferObj.transferId, transferObj.interest, transferObj.sharesAvailable, transferObj.producedTime.toLocaleTimeString());    
                    }
                    
                    callback(transferObj);
                    transferId++;
                }
            } else {
                console.log("?????????????????????????????? statusCode:", request.statusCode)
            }

        }
    });

    loopjob.startLooping();
    me.loopjob = loopjob;
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
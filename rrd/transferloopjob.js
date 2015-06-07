var htmlparser = require('../htmlparser');
var detectLatestTransferId = require("./detectlatesttransferid");

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
    var transferId = Number(startId);
    var hasNew = false;
    var loopjob = require("../loopjob").config({
        url: "http://www.renrendai.com/transfer/loanTransferDetail.action",
        loopInterval: 500,
        timeout: 500,
        urlInjection: function(url) {
            return url + "?transferId=" + transferId;
        },
        responseHandler: function(error, request, body) {
            if (error) {
                console.log("loanTransferDetail error:", error)
            } else if (request.statusCode == 200) {
                var errorcode = htmlparser.getValueFromBody('<div style="display: none;">', '</div>', body);
                if (errorcode === "500") {
                    if (hasNew) {
                        hasNew = false;
                        console.log("-|", transferId, new Date().toLocaleTimeString())
                    }
                    //no new item.
                } else {
                    var sharesAvailable = htmlparser.getValueFromBody('<em id="max-shares" data-shares="', '">', body);
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
                    console.log("->", transferObj.transferId, transferObj.interest, transferObj.sharesAvailable, transferObj.producedTime.toLocaleTimeString());
                    callback(transferObj);
                    transferId++;
                }
            } else {
                console.log("?????????????????????????????? statusCode:", response.statusCode)
            }

        }
    });

    loopjob.startLooping();
}

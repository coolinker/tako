
function detectNewTransfer(startId, callback) {
    var transferId = Number(startId);
    var loopjob = require("../loopjob").config({
        url: "http://www.renrendai.com/transfer/loanTransferDetail.action",
        loopInterval: 1000,
        urlInjection: function(url) {
            return url + "?transferId=" + transferId;
        },
        responseHandler: function(error, request, body) {
            if (error) {
                console.log("loanTransferDetail error:", error)
            } else if (response.statusCode == 200) {
                var errorcode = getValueFromBody('<div style="display: none;">', '</div>', body);
                if (errorcode === "500") {
                    //no new item.
                } else {
                    var sharesAvailable = getValueFromBody('<em id="max-shares" data-shares="', '">', body);
                    var interest = Number(getValueFromBody('<dd class="text-xxl"><em class="text-xxxl color-dark-text">', '</em>%</dd>', body));
                    var price = Number(getValueFromBody('<em id="amount-per-share" data-amount-per-share="', '">', body));
                    var duration = getValueFromBody('<div class="box"><em>成交用时</em><span>', '秒</span></div>', body);
                    var transferObj = null;
                    transferObj = {
                        transferId: tid,
                        interest: interest,
                        shares: sharesAvailable,
                        pricePerShare: price,
                        duration: duration,
                        timestemp: new Date()
                    };
                    transferId++;
                }
            } else {
                console.log("?????????????????????????????? statusCode:", response.statusCode)
            }

        }
    });

    loopjob.startLooping();
}

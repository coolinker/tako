var request = require("request");
var simplehttp = require('../simplehttp');
var htmlparser = require('../htmlparser');

function detect(callback, step) {
    console.log("detectlatesttransferid start...");
    var options = {};
    //var url = "http://www.renrendai.com/transfer/transferList!json.action?pageIndex=1&_=" + new Date().getTime();
    var url = "http://www.we.com/transfer/transferList!json.action?pageIndex=1&_=" + new Date().getTime();
    simplehttp.GET(url, options, function(error, response, body) {
        var json = JSON.parse(body);
        var transfers = json.data.transferList;
        var maxId = 0;
        for (var i = 0; i < transfers.length; i++) {
            var tid = Number(transfers[i].id);
            if (maxId < tid) maxId = tid;
        }
        console.log("detect startId", maxId)
        detectMaxTransferId(maxId, callback, step);
    });
}

function detectMaxTransferId(startId, callback, step) {
    console.log("detectlatesttransferid...", startId, step);
    var detectId = startId + step;
    var url = "http://www.we.com/transfer/loanTransferDetail.action?transferId=" + detectId;
    simplehttp.GET(url, {}, function(error, response, body) {
        if (error) {
            console.log("error detectMaxTransferId", error);
            detectMaxTransferId(startId, callback, step);
        } else if (response.statusCode == 200) {
            var errorcode = htmlparser.getValueFromBody('<div style="display: none;">', '</div>', body);
            if (errorcode === "500") {
                //no new item.
                if (step === 1) {
                    callback(startId)
                } else {
                    detectMaxTransferId(startId, callback, Math.floor(step / 2));
                }
            } else if (errorcode === null) {

                detectMaxTransferId(detectId, callback, step);
                // callback(tid, callbackObj, step);
            } else {
                console.log("??????????????????????? errorcode", errorcode)
            }
        } else {
            console.log("?????????????????????????????? statusCode", response.statusCode)
            detectMaxTransferId(startId, callback, step);
        }

    });

}

module.exports = detect;


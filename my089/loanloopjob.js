var htmlparser = require('../htmlparser');
var logutil = require("../logutil");
var producedMap = {};
exports.startNewLoanLoop = startNewLoanLoop;

function startNewLoanLoop(callback) {
    loopNewLoans(function(loans) {
        callback(loans);
    })
}

function loopNewLoans(callback) {
    var loopjob = require("../loopjob").config({
        url: "https://www.my089.com/Loan/default.aspx?&oc=3&ou=1",
        loopInterval: 500,
        timeout: 1000,
        responseHandler: function(error, request, body) {
            if (error) {
                // console.log("loanTransferDetail error:", error)
            } else if (request.statusCode == 200) {
                var eles = htmlparser.getSubStringsFromBody('<dl class="LoanList">', '<\/dl>', body);
                var loanObjs = [];
                for (var i = 0; i < eles.length; i++) {
                    var loanObj = {};
                    loanObj.sid = htmlparser.getValueFromBody('<a href="Detail.aspx?sid=', '" title="', eles[i]);
                    loanObj.interest = Number(htmlparser.getValueFromBody('<dd class="dd_2 mar_top_18"><span class="number">', '<b>%/年</b></span></dd>', eles[i]));
                    loanObj.vipLevel = Number(htmlparser.getValueFromBody('<em class="My_VIP_', '" title="会员等级"', eles[i]));
                    loanObj.percentFinished = Number(htmlparser.getValueFromBody('<p class="Bar lf"><b class="Bar_1" style="width:', '%', eles[i]));

                    loanObj.totalPrice = Number(htmlparser.getValueFromBody('<dd class="dd_3 mar_top_18"><span class="number"><b>￥</b>', '</span></dd>', eles[i]).replace(',', ''));
                    loanObj.startTime = new Date(htmlparser.getValueFromBody('     <span class="lf">', '</span><b class="lf">', eles[i]));
                    loanObj.source = "www.my089.com";
                    loanObj.producedTime = new Date();
                    

                    if (!producedMap[loanObj.sid]) {
                        producedMap[loanObj.sid] = loanObj;
                        if (loanObj.percentFinished<100) {
                            callback(loanObj);
                        } else if (loanObj.percentFinished===100) {
                            logutil.log("my089 loopNewLoans too soon to 100%", loanObj.sid, loanObj.interest);
                        } 
                    } else {
                        if (loanObj.percentFinished===100 && producedMap[loanObj.sid].percentFinished<100) {
                            // if (loanObj.interest>=14.5) {
                            //     logutil.log("my089 loopNewLoans loan finished", loanObj.interest, loanObj.sid, producedMap[loanObj.sid].producedTime.toLocaleTimeString(), loanObj.producedTime.toLocaleTimeString());
                            // }
                            producedMap[loanObj.sid] = loanObj;
                        } 
                    }

                }
                

                // callback(loanObjs);
            } else {
                console.log("?????????????????????????????? statusCode:", response.statusCode)
            }

        }
    });

    loopjob.startLooping();
}

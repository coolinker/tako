var TestData = require("../testdata.js");
//var feeler = require("./feelercontroller.js");
var simplehttp = require('../simplehttp');
var https = require('https');
var fs = require("fs");
var takoServerIP = "192.168.128.94";
var lufaxAcc = {
    user: "coolinker",
    source: "www.lu.com",
    password: TestData.lu.user.coolinker.password,
    tradePassword: TestData.lu.user.coolinker.tradePassword,
    interestLevelMax: 0.2,
    interestLevelMin: 0.08,
    reservedBalance: 0,
    pricePerBidMax: 8000,
    pricePerBidMin: 1500,
    stopConsumeBalance: 5000,
    loginExtendInterval: 5 * 60 * 1000,
    capability: {
        consume: true,
        schedule: true,
        leverage: 3.375

    }

};

var lufaxAcc1 = {
    user: "luhuiqing",
    source: "www.lu.com",
    password: TestData.lu.user.luhuiqing.password,
    tradePassword: TestData.lu.user.luhuiqing.tradePassword,
    interestLevelMax: 0.2,
    interestLevelMin: 0.08,
    reservedBalance: 0,
    pricePerBidMax: 8000,
    pricePerBidMin: 1500,
    stopConsumeBalance: 5000,
    loginExtendInterval: 5 * 60 * 1000,
    capability: {
        consume: true,
        schedule: true,
        leverage: 2.375
    }

};
var lufaxAcc2 = {
    user: "yang_jianhua",
    source: "www.lu.com",
    password: TestData.lu.user.yang_jianhua.password,
    tradePassword: TestData.lu.user.yang_jianhua.tradePassword,
    interestLevelMax: 0.2,
    interestLevelMin: 0.08,
    reservedBalance: 0,
    pricePerBidMax: 6000,
    pricePerBidMin: 1500,
    stopConsumeBalance: 5000,
    loginExtendInterval: 5 * 60 * 1000,
    capability: {
        consume: false,
        schedule: true,
        leverage: 2.375
    }

};

// try {
//     feeler.getAccountInfo(lufaxAcc, function () {
//         //takoController.startAccountBidding(lufaxAcc);
//     })

// } catch (e) {
//     console.log("--------------------------exit exception!", e.stack)
// }



function postAccount(acc) {
    simplehttp.POST("https://123.57.39.80/api?action=updateAccount", {
        headers: {
            'Content-type': 'application/json',
        },
        json: acc,
        ca: fs.readFileSync('cert/ca-crt.pem'),
        checkServerIdentity: function (host, cert) {
            return undefined;
        }
    },
        function (err, httpResponse, body) {
            try {
                //var accountJson = JSON.parse(body);
                console.log("postAccount:", acc.user, body)
            } catch (e) {
                console.error("postAccount exception:", err, body);
            }
        });
}

postAccount(lufaxAcc);
postAccount(lufaxAcc1);

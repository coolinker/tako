var TestData = require("../testdata.js");
var takoController = require("./feelercontroller.js");
var lufaxAcc = {
    user: "coolinker",
    source: "www.lu.com",
    password: TestData.lu.user.coolinker.password,
    tradePassword: TestData.lu.user.coolinker.tradePassword,
    interestLevelMax: 0.2,
    interestLevelMin: 0.08,
    reservedBalance: 0,
    pricePerBidMax: 6000,
    pricePerBidMin: 1500,
    loginExtendInterval: 5 * 60 * 1000,
    capability: {
        consume: true,
        schedule: false,
        runSchedule: false
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
    pricePerBidMax: 6000,
    pricePerBidMin: 1500,
    loginExtendInterval: 5 * 60 * 1000,
    capability: {
        consume: true,
        schedule: false,
        runSchedule: false
    }

};


takoController.getAccountInfo(lufaxAcc1, function () {
    takoController.startAccountBidding(lufaxAcc1);
})


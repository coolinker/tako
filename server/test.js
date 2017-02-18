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
    pricePerBidMax: 7500,
    pricePerBidMin: 1500,
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
    pricePerBidMax: 6000,
    pricePerBidMin: 1500,
    loginExtendInterval: 5 * 60 * 1000,
    capability: {
        consume: false,
        schedule: true,
        runSchedule: false
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
    loginExtendInterval: 5 * 60 * 1000,
    capability: {
        consume: true,
        schedule: true,
        runSchedule: false
    }

};

takoController.getAccountInfo(lufaxAcc, function () {
    //takoController.startAccountBidding(lufaxAcc);
})


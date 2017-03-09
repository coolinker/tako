var logutil = require("../logutil").config("takoserver");

var accountMap = {};
var infoQueue = {};
var latestFeelerIOTime = null;

exports.updateAccount = updateAccount;
function updateAccount(accountJson, timestamp) {
    timestamp = new Date(timestamp?timestamp:0); 
    accountJson.updateTime = new Date();
    accountMap[accountJson.user] = accountJson;
    if (!infoQueue[accountJson.user]) {
        "Account added.";
        return;
    }
    var infotoupdate = [];
    for (var i=0; i<infoQueue[accountJson.user].length; i++) {
        var info = infoQueue[accountJson.user][i];
        if (new Date(info.updateTime) > timestamp) {
            infotoupdate.push(info);
        }
    }
    return infotoupdate;
}

exports.feelerInfoIO = feelerInfoIO;
function feelerInfoIO(params) {
    var info = params.info;
    var accounts = params.accounts;
    latestFeelerIOTime = new Date();
    for (var user in info) {
        var userinfo = info[user];
        userinfo.updateTime = new Date(userinfo.updateTime);
        if (!infoQueue[user]) {
            infoQueue[user] = [];
            infoQueue[user].push(userinfo);
        } else {
            var last = infoQueue[user][infoQueue[user].length - 1];
            if (last.updateTime < userinfo.updateTime) {
                infoQueue[user].push(userinfo);
            }
        }
    }

    var accs = [];
    for (var user in accountMap) {
        if (!accounts[user] || accounts[user] && accountMap[user].updateTime > new Date(accounts[user].updateTime)){
            accs.push(accountMap[user]);
        }
    }
    logutil.info("feelerInfoIO update accounts:", accs.length)
    return accs;
}

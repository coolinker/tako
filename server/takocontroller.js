var logutil = require("../logutil").config("takoserver");

var accountMap = {};
var infoQueue = {};
var latestFeelerIOTime = null;

exports.updateAccount = updateAccount;
function updateAccount(accountJson) {
    accountJson.needUpdate = true;
    accountMap[accountJson.user] = accountJson;
    return infoQueue[accountJson.user] || "Account added.";
}

exports.feelerInfoIO = feelerInfoIO;
function feelerInfoIO(info) {
    latestFeelerIOTime = new Date();
    for (var user in info) {
        var userinfo = info[user];
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
        if (accountMap[user].needUpdate){
            accs.push(accountMap[user]);
            accountMap[user].needUpdate = false;
        }
        
    }
    return accs;
}

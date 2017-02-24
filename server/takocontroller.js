var logutil = require("../logutil").config("takoserver");

var accountMap = {};
var infoQueue = {};

exports.updateAccount = updateAccount;
function updateAccount(accountJson) {
    if (accountMap[accountJson.user]) {
        accountMap[accountJson.user] = accountJson;
    }

    return infoQueue[accountJson.user];
}

exports.feelerInfoIO = feelerInfoIO;
function feelerInfoIO(user, info) {
    if (!infoQueue[user]) {
        infoQueue[user] = [];
        infoQueue[user].push(info);
    } else {
        var last = infoQueue[user][infoQueue[user].length-1];
        if (last.updateTime < info.updateTime) {
            infoQueue[user].push(info);
        }
    }

    return accountMap;
}

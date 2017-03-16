var logutil = require("../logutil").config("takoserver");

var accountMap = {};
var infoQueue = {};
var latestFeelerIOTime = null;

function validAccount(accJson) {
    return !!accJson.user;
}

exports.updateAccount = updateAccount;
function updateAccount(accountJson, timestamp) {
    if (!validAccount(accountJson)) return "Invalid input";
    timestamp = new Date(timestamp ? timestamp : 0);
    accountJson.updateTime = new Date();
    accountMap[accountJson.user] = accountJson;
    if (!infoQueue[accountJson.user]) {
        return "Account added.";
    }
    var infotoupdate = [];
    for (var i = 0; i < infoQueue[accountJson.user].length; i++) {
        var info = infoQueue[accountJson.user][i];
        if (new Date(info.updateTime) > timestamp) {
            info.latestFeelerIOTime = latestFeelerIOTime ? latestFeelerIOTime.toLocaleTimeString() : null;
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
        if (!accounts[user] || accounts[user] && accountMap[user].updateTime > new Date(accounts[user].updateTime)) {
            accs.push(accountMap[user]);
        }
    }
    logutil.info("latestFeelerIOTime:", latestFeelerIOTime);
    return accs;
}

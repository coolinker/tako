var logutil = require("./logutil");
var ACCOUNT_TYPES = require("./accounttypes");

var LOGIN_ACCOUNTS_NUMBER = 3;
// var accountAttributes = {
//     user: "",
//     password: "",
//     source: "",
//     cookieJar: null,
//     loginTime: null,
//     loginExtendInterval: null,
//     loginExtendedTime: null,
//     locked: false,
//     interestLevel: 13,
//     availableBalance: 0,
//     lastConsumingTime: null
// }
var events = require("events");
var accountQueues = {};

exports.consume = consume;
function consume(toBeConsumed) {
    var sourceType = ACCOUNT_TYPES[toBeConsumed['source']];
    var consumejob = require("./" + sourceType + "/consumejob");
    accounts = accountQueues[sourceType];
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].cookieJar !== null) {
            consumejob.consume(accounts[i], toBeConsumed);
        }
    }
}

// exports.consumeAll = consumeAll;
// function consumeAll(toBeConsumed) {
//     var sourceType = ACCOUNT_TYPES[toBeConsumed[0]['source']];
//     var consumejob = require("./" + sourceType + "/consumejob");
//     accounts = accountQueues[sourceType];
//     var consumeIdx = 0;
//     for (var i = 0; i < accounts.length; i++) {
//         if (accounts[i].cookieJar !== null) {
//             consumejob.consume(accounts[i], toBeConsumed[consumeIdx++]);
//         }
//         if (consumeIdx >= toBeConsumed.length) break;
//     }
// }

function loginAccount(accountInfo) {
    var accounttype = ACCOUNT_TYPES[accountInfo['source']];
    var loginjobs = require("./" + accounttype + "/loginjobs");
    accountInfo.locked = true;
    loginjobs.login(accountInfo, function(cookieJar) {
        accountInfo.cookieJar = cookieJar;
        if (cookieJar === null) {
            logutil.log("addAccount login failed", accountInfo);
        } else {
            accountInfo.loginTime = new Date();
        }
        accountInfo.locked = false;
    })
}

exports.addAccount = addAccount;

function addAccount(accountInfo) {
    var accounttype = ACCOUNT_TYPES[accountInfo['source']];
    if (!accountQueues[accounttype]) {
        accountQueues[accounttype] = [];
    };
    accountQueues[accounttype].push(accountInfo);
}

exports.updateAccountQueue = updateAccountQueue;
function updateAccountQueue () {
    var activeTypes = {};
    for (var accountType in accountQueues) {
        activeTypes[accountType] = false;
        var accs = accountQueues[accountType];
        for (var i=accs.length-1; i>=0; i--) {
            if (accs[i].isActive()) {
                activeTypes[accountType] = true;
            } else {
                accs.splice(i, 1);
            }
        }
    }

    return activeTypes;
}

exports.loopLogin = loopLogin;

function loopLogin() {
    queueLogin();
    setInterval(queueLogin, 30 * 1000)
}

exports.queueLogin = queueLogin;

function queueLogin() {
    var now = new Date();
    for (var att in accountQueues) {
        queue = accountQueues[att];
        if (queue) {
            for (var i = 0; i < queue.length; i++) {
                var acc = queue[i];
                
                if (acc.cookieJar === null) {
                    logutil.log("loopLogin...", att, i);
                    loginAccount(acc);
                    continue;
                }

                var letime = acc.loginExtendedTime === null ? acc.loginTime : acc.loginExtendedTime;

                if (now - letime > acc.loginExtendInterval) {
                    var accounttype = ACCOUNT_TYPES[acc['source']];
                    var loginjobs = require("./" + accounttype + "/loginjobs");
                    acc.locked = true;
                    loginjobs.extendLogin(acc, function(cookieJar) {
                        acc.cookieJar = cookieJar;
                        if (cookieJar === null) {
                            logutil.log("extend login failed:", acc);
                        } else {
                            acc.loginExtendedTime = new Date();
                            logutil.log("extend login succeed:", acc);
                        }
                        acc.locked = false;
                    })
                }

            }
        }
    }
}

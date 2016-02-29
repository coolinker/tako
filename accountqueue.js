var logutil = require("./logutil");
var ACCOUNT_TYPES = require("./accounttypes");

var LOGIN_ACCOUNTS_NUMBER = 3;

//var events = require("events");
var accountQueues = {};
var queuesMap = {};

exports.consume = consume;

function consume(toBeConsumed) {
    var sourceType = ACCOUNT_TYPES[toBeConsumed['source']];
    var consumejob = require("./" + sourceType + "/consumejob");
    accounts = accountQueues[sourceType];
    //logutil.log("toBeConsumed", toBeConsumed.publishTime, toBeConsumed.productId, toBeConsumed.price, toBeConsumed.interest);

    var finished = false;
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].cookieJar !== null) {
            finished = consumejob.consume(accounts[i], toBeConsumed);
            if (finished) break;
        }
    }

    return finished;
}

exports.loginAccount = loginAccount;
function loginAccount(accountInfo, callback) {
    if (accountInfo.locked) {
        if (callback) callback();
        return;
    }
    if (!needRelogin(accountInfo)) {
        console.log("no need for login", accountInfo.user, accountInfo.startedBidding)
        if (callback) callback(accountInfo.JSONInfo());
        return;
    }

    var accounttype = ACCOUNT_TYPES[accountInfo['source']];
    var loginjobs = require("./" + accounttype + "/loginjobs");
    accountInfo.locked = true;
    loginjobs.login(accountInfo, function(cookieJar, info) {
        accountInfo.locked = false;
        if (cookieJar === null) {
            logutil.log("Account login failed", accountInfo.user, info.resultMsg);
        }

        if (callback) callback(info);
    })
}

exports.needRelogin = needRelogin;
function needRelogin(account) {
    if (!account.cookieJar) return true;
    var letime = account.loginExtendedTime === null ? account.loginTime : account.loginExtendedTime;
    return (new Date() - letime > account.loginExtendInterval)
}

exports.getAccount = getAccount;

function getAccount(accountInfo) {
    var accounttype = ACCOUNT_TYPES[accountInfo['source']];
    return queuesMap[accounttype] ? queuesMap[accounttype][accountInfo.user] : null;
}

exports.addAccount = addAccount;

function addAccount(account) {
    var acc = getAccount(account);
    if (acc) {
        removeAccount(acc);
    }

    var accounttype = ACCOUNT_TYPES[account['source']];
    if (!accountQueues[accounttype]) {
        accountQueues[accounttype] = [];
        queuesMap[accounttype] = {};
    };

    accountQueues[accounttype].push(account);
    queuesMap[accounttype][account.user] = account;
    logutil.log("Account added in queue", account.user)
}

function removeAccount(account) {
    var accounttype = ACCOUNT_TYPES[account['source']];
    var arr = accountQueues[accounttype];
    for (var i=0; i<arr.length; i++) {
        if (arr[i].user === account.user) {
            arr.splice(i, 1);
            break;
        }
    }
    delete queuesMap[accounttype][account.user];
    logutil.log("remove Account", accounttype, account.user)
}

exports.updateAccountQueue = updateAccountQueue;

function updateAccountQueue() {
    var activeTypes = {};
    for (var accountType in accountQueues) {
        activeTypes[accountType] = false;
        var accs = accountQueues[accountType];
        for (var i = accs.length - 1; i >= 0; i--) {
            if ( /*!accs[i].loggedIn() ||*/ accs[i].ableToConsume()) {
                activeTypes[accountType] = true;
            } else if (!accs[i].isActive()){
                console.log("remove account*******************:", accs[i].user, accs[i].source);        
                accs.splice(i, 1);
            }
        }
    }
    
    return activeTypes;
}

exports.loopLogin = loopLogin;

function loopLogin() {
    queueLogin();
    setInterval(queueLogin, 5 * 60 * 1000)
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
                // logutil.log("extend login...", acc.user, now - letime, acc.loginExtendInterval)
                if (acc.ableToConsume() && now - letime > acc.loginExtendInterval) {
                    var accounttype = ACCOUNT_TYPES[acc['source']];
                    var loginjobs = require("./" + accounttype + "/loginjobs");
                    acc.locked = true;

                    loginjobs.extendLogin(acc, (function() {
                        var _acc = acc;
                        return function(cookieJar) {
                            _acc.cookieJar = cookieJar;
                            if (cookieJar === null) {
                                logutil.log("extend login failed:", _acc.user);
                            } else {
                                logutil.log("extend login:", _acc.user, _acc.source);
                                _acc.loginExtendedTime = new Date();
                            }

                            _acc.locked = false;
                        }
                    })())
                }

            }
        }
    }
}

var logutil = require("./logutil").config('feeler');
var pppoeutil = require("./pppoeutil");

var ACCOUNT_TYPES = require("./accounttypes");

var LOGIN_ACCOUNTS_NUMBER = 3;

//var events = require("events");
var accountQueues = {};
var queuesMap = {};
var consumedMap = {};
exports.consume = consume;

function consume(toBeConsumed) {
    var sourceType = ACCOUNT_TYPES[toBeConsumed instanceof Array ? toBeConsumed[0]['source'] : toBeConsumed['source']];
    var consumejob = require("./" + sourceType + "/consumejob");
    accounts = accountQueues[sourceType];

    var finished = false, csmidx = 0;
    for (var i = 0; i < accounts.length; i++) {
        if (toBeConsumed.length === 0) break;
        if (toBeConsumed.length === csmidx) break;
        if (accounts[i].cookieJar !== null) {
            var finished = consumejob.consume(accounts[i], toBeConsumed[csmidx]);

            if (finished) {
                toBeConsumed[csmidx].consumed = true;
                csmidx++;
            }

        }
    }

    return finished;
}

exports.loginAccount = loginAccount;
function loginAccount(account, callback) {
    if (account.locked) {
        if (callback) callback(account.JSONInfo());
        return;
    }
    if (!needRelogin(account)) {
        console.log("no need for login", account.user, account.startedBidding)
        if (callback) callback(account.JSONInfo());
        return;
    }

    var accounttype = ACCOUNT_TYPES[account['source']];
    var loginjobs = require("./" + accounttype + "/loginjobs");
    account.lock();
    loginjobs.login(account, function (cookieJar, info) {
        account.unlock();
        if (cookieJar === null) {
            logutil.error("\nAccount login failed", account.user, info.resultMsg);
        }

        if (callback) callback(info);
        scheduleAccount(account);
    })
}


function scheduleAccount(account) {
    if (account.locked) return;
    //if (!account.ableToSchedule()) return;

    var accounttype = ACCOUNT_TYPES[account['source']];
    var job = require("./" + accounttype + "/schedulejob");
    account.lock();
    job.schedule(account, function (scheduleObj) {
        //should start consume job here
        account.unlock();
        checkSchedule(account);
    })

}

exports.checkSchedule = checkSchedule;
function checkSchedule(account) {
    if (account.locked) return;
    if (!account.ableToSchedule()) {
        account.startedBidding = account.ableToConsume();
        return;
    }

    if (account.scheduleObj.lastScheduleCheckTime && new Date() - account.scheduleObj.lastScheduleCheckTime < 1 * 60 * 1000) {
        return;
    }
    var accounttype = ACCOUNT_TYPES[account['source']];
    var job = require("./" + accounttype + "/schedulejob");
    account.lock();
    job.checkSchedule(account, function (exable, rate) {
        account.startedBidding = account.ableToConsume();
        account.unlock();
    });

    account.scheduleObj.lastScheduleCheckTime = new Date();
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
    logutil.info("Account added in queue", account.user)
}

function removeAccount(account) {
    var accounttype = ACCOUNT_TYPES[account['source']];
    var arr = accountQueues[accounttype];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].user === account.user) {
            arr.splice(i, 1);
            break;
        }
    }
    delete queuesMap[accounttype][account.user];
    logutil.info("remove Account", accounttype, account.user)
}

exports.updateAccountQueue = updateAccountQueue;

function updateAccountQueue() {
    var activeTypes = {};
    for (var accountType in accountQueues) {
        activeTypes[accountType] = {
            consume: false,
            active: false
        }
        var accs = accountQueues[accountType];
        for (var i = accs.length - 1; i >= 0; i--) {
            if (accs[i].isActive()) {
                activeTypes[accountType].active = true;
            }

            if (accs[i].ableToConsume()) {
                activeTypes[accountType].consume = true;
            }

            if (!activeTypes[accountType].active && !activeTypes[accountType].consume) {
                console.log("remove account*******************:", accs[i].user, accs[i].source);
                accs.splice(i, 1);
            }
        }
    }

    return activeTypes;
}

exports.startLoopWork = startLoopWork;
function startLoopWork() {
    queueLogin();
    setInterval(function () {
        pppoeutil.whenNetworkReady(queueLogin);
    }, 1 * 60 * 1000)

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
                    logutil.info("loopLogin...", att, i);
                    loginAccount(acc, function () {

                    });
                    continue;
                }

                
                var letime = acc.loginExtendedTime === null ? acc.loginTime : acc.loginExtendedTime;
                //logutil.info("extend login...", acc.user, now - letime, acc.loginExtendInterval)
                if (!acc.locked && acc.startedBidding /*&& acc.ableToConsume()*/ && now - letime > acc.loginExtendInterval) {
                    var accounttype = ACCOUNT_TYPES[acc['source']];
                    var loginjobs = require("./" + accounttype + "/loginjobs");
                    acc.lock();

                    loginjobs.extendLogin(acc, (function () {
                        var _acc = acc;
                        return function (cookieJar) {
                            _acc.cookieJar = cookieJar;
                            if (cookieJar === null) {
                                logutil.info("extend login failed:", _acc.user);
                            } else {
                                logutil.info("extend login:", _acc.user, _acc.source);
                                //_acc.loginExtendedTime = new Date();
                            }

                            _acc.unlock();
                            if (_acc.ableToSchedule()) {
                                checkSchedule(_acc);
                            }
                        }
                    })())
                }

            }
        }
    }

}

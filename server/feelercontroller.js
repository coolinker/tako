var logutil = require("../logutil");
var rrdtransferloopjob = require("../rrd/transferloopjob");
var lufaxtransferloopjob = require("../lu/transferloopjob");
var JOBS_OBJ = {};
var ACCOUNT_TYPES = require("../accounttypes");

for (var att in ACCOUNT_TYPES) {
    try {
        var job = require("../" + ACCOUNT_TYPES[att] + "/transferloopjob");
        var type = ACCOUNT_TYPES[att];
        if (!JOBS_OBJ[type]) JOBS_OBJ[type] = {};
        JOBS_OBJ[type]['transferloopjob'] = job;
    } catch (e) {
        console.log(type, e);
    }
}

var accountqueue = require("../accountqueue");
accountqueue.loopLogin();

var CommonAccount = require("../commonaccount");

this.monitorIntervalObj = setInterval(monitorAccountQueueAndJobs, 30000);

exports.getAccountInfo = getAccountInfo;

function getAccountInfo(accountJson, callback) {
    // var accountObj = addAccountJson(accountJson);
    console.log("accountJson", accountJson)
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    var result = {
        action: "gotAccountInfo"
    };
    if (acc && !accountqueue.needRelogin(acc)) {
        logutil.log("Account already logged in", acc.JSONInfo());
        result.body = acc.JSONInfo();
        if (callback) callback(result);

    } else {
        accountqueue.loginAccount(accountObj, function(info) {
            if (accountObj.cookieJar) {
                accountqueue.addAccount(accountObj);
                result.body = accountObj.JSONInfo();
            } else {
                result.body = info;
            }
            if (callback) callback(result);
        });
    }

}

exports.startAccountBidding = startAccountBidding;

function startAccountBidding(accountJson, callback) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    var result = {
        action: "startedAccountBidding"
    };
    if (acc) {
        acc.config(accountJson);
        acc.startedBidding = true;
        if (acc.cookieJar) {
            startNewProductCheck(acc.source);
        }
        result.resultMsg = "SUCCEED";
    } else {
        result.resultMsg = "ACCOUNT_NOT_IN_QUEUE";
    }

    if (callback) callback(result);
}

exports.stopAccountBidding = stopAccountBidding;

function stopAccountBidding(accountJson, callback) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    if (!acc) {
        logutil.log("stopAccountBidding", "account " + accountObj.user + " doesn't existed");
    } else {
        acc.startedBidding = false;
    }
    callback({
        action: "stoppedAccountBidding",
        resultMsg: "SUCCEED"
    });
    //accountqueue.logoutAccount(accountObj, callback);
}

exports.addAccountJson = addAccountJson;

function addAccountJson(accountJson) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    var result = {
        action: "stoppedAccountBidding"
    };
    if (acc) {
        acc.config(accountJson);
        acc.startedBidding = false;
        result.resultMsg = "SUCCEED";
    } else {
        result.resultMsg = "ACCOUNT_NOT_IN_QUEUE";
    }

    if (callback) callback(result);
}

function startNewProductCheck(source) {
    var accType = ACCOUNT_TYPES[source];
    var tjob = accType ? JOBS_OBJ[accType]['transferloopjob'] : null;
    if (tjob && !tjob.isRollingStarted()) {
        console.log("--------------------startNewProductCheck", accType)
        tjob.rollNewProductCheck(function(product) {
            if (accountqueue.consume(product)) {
                //tjob.pauseNewTransferLoop(2000);
            }
        });
    }
}

exports.removeAccountJson = removeAccountJson;

function removeAccountJson(accountJson) {
    accountqueue.inactive(accountJson.user, accountJson.password, accountJson.source);
}

function monitorAccountQueueAndJobs() {
    var activeAccs = accountqueue.updateAccountQueue();
    // console.log("monitorAccountQueueAndJobs activeAccs", activeAccs)
    for (var att in activeAccs) {
        var job = JOBS_OBJ[att]['transferloopjob'];
        if (activeAccs[att]) {
            if (job && !job.isRollingStarted()) {
                job.rollNewProductCheck(function(product) {
                    if (accountqueue.consume(product)) {
                        //job.pauseNewTransferLoop(2000);
                    }
                });
            }
        } else {
            if (job && job.isRollingStarted()) {
                console.log("stop*****************************", att)
                job.stopRollingNewProductCheck();
            }
        }
    }
}

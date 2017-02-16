var logutil = require("../logutil").config("feeler");
//var rrdtransferloopjob = require("../rrd/transferloopjob");
//var lufaxtransferloopjob = require("../lu/transferloopjob");
var JOBS_OBJ = {};
var ACCOUNT_TYPES = require("../accounttypes");

// for (var att in ACCOUNT_TYPES) {
//     try {
//         var job = require("../" + ACCOUNT_TYPES[att] + "/transferloopjob");
//         var type = ACCOUNT_TYPES[att];
//         if (!JOBS_OBJ[type]) JOBS_OBJ[type] = {};
//         JOBS_OBJ[type]['transferloopjob'] = job;
//     } catch (e) {
//         console.log(type, e);
//     }
// }

function getTransferLoopJob(type) {
    if (!type) return null;

    if (!JOBS_OBJ[type]) {
        var job = require("../" + type + "/transferloopjob");
        JOBS_OBJ[type] = {};
        JOBS_OBJ[type]['transferloopjob'] = job;
    }
    return JOBS_OBJ[type]['transferloopjob'];
}

var accountqueue = require("../accountqueue");
accountqueue.startLoopWork();

var CommonAccount = require("../commonaccount");

this.monitorIntervalObj = setInterval(monitorAccountQueueAndJobs, 30000);

var wsconnection;
exports.setWebSocket = setWebSocket;
function setWebSocket(ws) {
    wsconnection = ws;
}

exports.getAccountInfo = getAccountInfo;
function getAccountInfo(accountJson, callback) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    var result = {
        action: "gotAccountInfo"
    };
    if (acc && !accountqueue.needRelogin(acc)) {
        logutil.info("Account already logged in", acc.JSONInfo());
        result.body = acc.JSONInfo();
        if (callback) callback(result);

    } else {
        accountqueue.loginAccount(accountObj, function (info) {
            if (accountObj.cookieJar) {
                accountqueue.addAccount(accountObj);
                result.body = accountObj.JSONInfo();
                accountObj.on("consumeHistory", handleConsumeHistory);
            } else {
                result.body = info;
            }

            if (callback) callback(result);
        });
    }

}


function handleConsumeHistory(account, data) {
    console.log("handleConsumeHistory", data, account.user)
    var req = {
        action: "updateConsumeHistory",
        body: {
            user: account.user,
            source: account.source,
            data: data
        }
    }
    wsconnection.send(JSON.stringify(req), function (param) {
        console.log("feeler send handleConsumeHistory callback", param)
    });
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
        if (startBidding(acc)) {
            result.resultMsg = "SUCCEED";
        } else {
            result.resultMsg = "NOT_BE_ABLE_TO_CONSUME";
        }

    } else {
        result.resultMsg = "ACCOUNT_NOT_IN_QUEUE";
    }

    if (callback) callback(result);
}

function startBidding(account) {
    if (account.ableToConsume()) {
        account.startedBidding = true;
        startNewProductCheck(account.source);
        return true;
    } else {
        return false;
    }

}

exports.stopAccountBidding = stopAccountBidding;

function stopAccountBidding(accountJson, callback) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    if (!acc) {
        logutil.info("stopAccountBidding", "account " + accountObj.user + " doesn't existed");
    } else {
        acc.startedBidding = false;
    }
    callback({
        action: "stoppedAccountBidding",
        resultMsg: "SUCCEED"
    });
    //accountqueue.logoutAccount(accountObj, callback);
}

// exports.addAccountJson = addAccountJson;
// function addAccountJson(accountJson) {
//     var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
//     var acc = accountqueue.getAccount(accountObj);
//     var result = {
//         action: "stoppedAccountBidding"
//     };
//     if (acc) {
//         acc.config(accountJson);
//         acc.startedBidding = false;
//         result.resultMsg = "SUCCEED";
//     } else {
//         result.resultMsg = "ACCOUNT_NOT_IN_QUEUE";
//     }

//     if (callback) callback(result);
// }

function startNewProductCheck(source) {
    var tjob = getTransferLoopJob(ACCOUNT_TYPES[source]);
    if (tjob && !tjob.isRollingStarted()) {
        console.log("--------------------startNewProductCheck", ACCOUNT_TYPES[source])
        tjob.rollNewProductCheck(function (products) {
            if (accountqueue.consume(products)) {
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
        var job = getTransferLoopJob(att);
        if (activeAccs[att].consume) {
            if (job && !job.isRollingStarted()) {
                job.rollNewProductCheck(function (product) {
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

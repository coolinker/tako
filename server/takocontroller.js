var logutil = require("../logutil").config("takoserver");
var ACCOUNT_TYPES = require("../accounttypes");
var FEELERS = {};

var accountqueue = require("../accountqueue");
var CommonAccount = require("../commonaccount");

function getFeeler(source) {
    var accountType = ACCOUNT_TYPES[source];
    var feeler = FEELERS[accountType];
    return feeler;
}

exports.registerFeeler = registerFeeler;
function registerFeeler(jsonParams, callback, ws) {
    var types = jsonParams;
    for (var i = 0; i < types.length; i++) {
        if (FEELERS[types[i]]) {
            logutil.info("Feeler already registered", types[i])
        } else {
            FEELERS[types[i]] = ws;
            FEELERS[types[i]].callbacks_getAccountInfo = {};
            FEELERS[types[i]].on("close", function (idx) {
                    return function(param) {
                    delete FEELERS[types[idx]];
                }
            }(i))
            callback({
                status: 'connected',
                type: [types[i]]
            });

        }
    }
}

exports.unregisterFeeler = unregisterFeeler;
function unregisterFeeler(jsonParams, callback) {
    var types = jsonParams;
    for (var i = 0; i < types.length; i++) {
        if (!FEELERS[types[i]]) {
            logutil.info("Feeler not registered", types[i])
        } else {
            logutil.info("Unregister feeler", types[i]);
            delete FEELERS[types[i]];
        }
    }
}

exports.updateConsumeHistory = updateConsumeHistory;
function updateConsumeHistory (data) {
    var user = data.user;
    var source = data.source;
    var consumedata = data.data;
    var acc = accountqueue.getAccount({user: user, source: source});
    if (acc) {
        acc.consumeHistory.push(consumedata);
    } else {
        console.log("updateConsumeHistory, no account", user, source);
    }
}

exports.getAccountInfo = getAccountInfo;

function getAccountInfo(accountJson, callback) {
    // var accountObj = addAccountJson(accountJson);
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    //var acc = accountqueue.getAccount(accountObj);
    var feeler = getFeeler(accountObj.source);
    if (feeler) {
        var jsonToSend = {
            action: "getAccountInfo",
            body: accountJson
        };
        feeler.send(JSON.stringify(jsonToSend), null, function(params) {
            if (!feeler.callbacks_getAccountInfo[accountJson.user]) {
                feeler.callbacks_getAccountInfo[accountJson.user] = [];
            }
            var arr = feeler.callbacks_getAccountInfo[accountJson.user];
            arr.push(callback);
        })

    } else {
        var result = {
            action: "getAccountInfo",
            resultMsg: "FEELER_NOT_REGISTERED"
        };
        console.log("result----", result)
        callback(result);
    }

}

exports.gotAccountInfo = gotAccountInfo;

function gotAccountInfo(accountJson, callback) {
    var feeler = getFeeler(accountJson.source);
    var callbacks = feeler.callbacks_getAccountInfo[accountJson.user];
    console.log("gotAccountInfo", callbacks.length, accountJson.user, accountJson.source)
    for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](accountJson);
        if (accountJson.loginTime) {
            var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
            var acc = accountqueue.getAccount(accountObj);
            if (!acc) {
                accountqueue.addAccount(accountObj);
            }
        }
    }

}

exports.startAccountBidding = startAccountBidding;
function startAccountBidding(accountJson, callback) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    var result = {
        action: "startAccountBidding"
    };
    if (acc) {
        acc.config(accountJson);
        acc.startedBidding = true;
        var feeler = getFeeler(accountJson.source);
        if (feeler) {
            var jsonToSend = {
                action: "startAccountBidding",
                body: accountJson
            };

            feeler.send(JSON.stringify(jsonToSend), null, function(params) {
                result.resultMsg = "SUCCEED";
            });
            
        } else {
            result.resultMsg = "FEELER_NOT_REGISTERED";
        }
    } else {
        result.resultMsg = "ACCOUNT_NOT_IN_QUEUE";
    }

    if (callback) callback(result);
}

exports.stopAccountBidding = stopAccountBidding;
function stopAccountBidding(accountJson, callback) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    var result = {
        action: "stopAccountBidding"
    };

    if (!acc) {
        logutil.info("stopAccountBidding", "account " + accountObj.user + " doesn't existed");
        result.resultMsg = "ACCOUNT_NOT_IN_QUEUE";
    } else {
        acc.startedBidding = false;
        var feeler = getFeeler(acc.source);
        if (feeler) {
            var jsonToSend = {
                action: "stopAccountBidding",
                body: accountJson
            };

            feeler.send(JSON.stringify(jsonToSend), null, function(params) {
                result.resultMsg = "SUCCEED";
            });
            
        } else {
            result.resultMsg = "FEELER_NOT_REGISTERED";
        }
    }
    callback(result);
}

exports.addAccountJson = addAccountJson;
function addAccountJson(accountJson) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    if (!acc) {
        accountqueue.addAccount(accountObj);
    } else {
        accountObj = acc;
    }

    return accountObj;
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

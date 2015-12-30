var logutil = require("./logutil");
var rrdtransferloopjob = require("./rrd/transferloopjob");
var lufaxtransferloopjob = require("./lu/transferloopjob");
var JOBS_OBJ = {};
var ACCOUNT_TYPES = require("./accounttypes");
for (var att in ACCOUNT_TYPES) {
    try {
        var job = require("./" + ACCOUNT_TYPES[att] + "/transferloopjob");
        var type = ACCOUNT_TYPES[att];
        if (!JOBS_OBJ[type]) JOBS_OBJ[type] = {};
        JOBS_OBJ[type]['transferloopjob'] = job;
    } catch (e) {
        console.log(type, e);
    }
}

var accountqueue = require("./accountqueue");
accountqueue.loopLogin();

var CommonAccount = require("./commonaccount");

this.monitorIntervalObj = setInterval(monitorAccountQueueAndJobs, 30000);

exports.getAccountInfo = getAccountInfo;
function getAccountInfo(accountJson, callback) {
    var accountObj = addAccountJson(accountJson);
    accountqueue.loginAccount(accountObj, function(result){
        console.log("getAccountInfo result", result);
        callback(result);
    });
}

exports.startAccountBidding = startAccountBidding;
function startAccountBidding(accountJson, callback) {
    var accountObj = addAccountJson(accountJson)
    accountObj.startedBidding = true;
    accountqueue.loginAccount(accountObj, function(result){
        callback(result);
        if (accountObj.cookieJar) {
            startNewProductCheck(accountObj.source);
        }
    });
}

exports.stopAccountBidding = stopAccountBidding;
function stopAccountBidding(accountJson, callback) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    if (!acc) {
        logutil.log("stopAccountBidding", "account "+accountObj.user+" doesn't existed");
    } else {
        acc.startedBidding = false;    
    }
    callback({status:"successful"});
    //accountqueue.logoutAccount(accountObj, callback);
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

function startNewProductCheck(source){
    var accType = ACCOUNT_TYPES[source];
    var tjob =accType ? JOBS_OBJ[accType]['transferloopjob'] : null;
    if (tjob && !tjob.isRollingStarted()) {
        console.log("--------------------startNewProductCheck")
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

var logutil = require("./logutil");
var rrdtransferloopjob = require("./rrd/transferloopjob");
var lufaxtransferloopjob = require("./lufax/transferloopjob");
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

exports.addAccountJson = addAccountJson;
function _addAccountJson(accountJson, callback) {
    callback({user: "coolinker", loginTime: 1447083301627, availableBalance: 2000});
}

exports.getAccountInfo = getAccountInfo;
function getAccountInfo(accountJson, callback) {
    accountJson.readyFunding = false;
    addAccountJson(accountJson, callback)
}

function addAccountJson(accountJson, callback) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    var acc = accountqueue.getAccount(accountObj);
    if (!acc) {
         accountqueue.addAccount(accountObj);
    } else {
        accountObj = acc;
    }

    var accType = ACCOUNT_TYPES[accountObj.source];
    var tjob =accType ? JOBS_OBJ[accType]['transferloopjob'] : null;
    if (tjob && !tjob.isRollingStarted()) {
        tjob.rollNewProductCheck(function(product) {
            if (accountqueue.consume(product)) {
                //tjob.pauseNewTransferLoop(2000);
            }
        });
    }
     
     accountqueue.loginAccount(accountObj, callback);
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

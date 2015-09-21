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

function addAccountJson(accountJson) {
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    accountqueue.addAccount(accountObj);
    var accType = ACCOUNT_TYPES[accountObj.source];
    var tjob = JOBS_OBJ[accType]['transferloopjob'];
    if (tjob && !tjob.isRollingStarted()) {
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

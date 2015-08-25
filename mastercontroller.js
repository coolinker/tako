var rrdtransferloopjob = require("./rrd/transferloopjob");
var lufaxtransferloopjob = require("./lufax/transferloopjob");
var JOBS_OBJ = {};
var ACCOUNT_TYPES = require("./accounttypes");
for (var att in ACCOUNT_TYPES) {
    try {
        var job = require("./"+ACCOUNT_TYPES[att]+"/transferloopjob");
        var type = ACCOUNT_TYPES[att];
        if (!JOBS_OBJ[type]) JOBS_OBJ[type] = {};
        JOBS_OBJ[type]['transferloopjob'] = job;
    } catch(e){
        console.log(type, e);
    }
}


var accountqueue = require("./accountqueue");
accountqueue.loopLogin();

var CommonAccount = require("./commonaccount");

this.monitorIntervalObj = setInterval(monitorAccountQueueAndJobs, 30000);

exports.addAccountJson = addAccountJson;
function addAccountJson(accountJson){
    var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
    accountqueue.addAccount(accountObj);
    var accType = ACCOUNT_TYPES[accountObj.source];
        
    if (JOBS_OBJ[accType]['transferloopjob'] && !JOBS_OBJ[accType]['transferloopjob'].isLoopingStarted()) {
        JOBS_OBJ[accType]['transferloopjob'].startNewTransferLoop(function(product){
            accountqueue.consume(product);  
        });
    }
}

exports.removeAccountJson = removeAccountJson;
function removeAccountJson(accountJson){
    accountqueue.inactive(accountJson.user, accountJson.password, accountJson.source);    
}

function monitorAccountQueueAndJobs() {
    var activeAccs = accountqueue.updateAccountQueue();
    // console.log("monitorAccountQueueAndJobs activeAccs", activeAccs)
    for (var att in activeAccs) {
        if (activeAccs[att]) {
            var job = JOBS_OBJ[att]['transferloopjob'];
            if (job && !job.isLoopingStarted()) {
                job.startNewTransferLoop(function(product){
                    accountqueue.consume(product);  
                });
            }
        } else {
            if (job && job.isLoopingStarted()) {
                console.log("stop*****************************", att)
                job.stopNewTransferLoop();
            }
        }
    }
}







var logutil = require("../logutil").config("feeler");
var simplehttp = require('../simplehttp');
var fs = require("fs");

var TestData = require("../testdata.js");
var pppoeutil = require("../pppoeutil");

//var rrdtransferloopjob = require("../rrd/transferloopjob");
//var lufaxtransferloopjob = require("../lu/transferloopjob");

var JOBS_OBJ = {};
var ACCOUNT_TYPES = require("../accounttypes");
var latestIOTime = new Date();
var takoServerIp = process.argv[2];

var accountqueue = require("../accountqueue");
accountqueue.startLoopWork();

var CommonAccount = require("../commonaccount");

this.monitorIntervalObj = setInterval(function () {
    if (pppoeutil.connected()) {
        monitorAccountQueueAndJobs();
    }
}, 1 * 60 * 1000);

monitorAccountQueueAndJobs();

function getTransferLoopJob(type) {
    if (!type) return null;

    if (!JOBS_OBJ[type]) {
        var job = require("../" + type + "/transferloopjob");
        JOBS_OBJ[type] = {};
        JOBS_OBJ[type]['transferloopjob'] = job;
    }
    return JOBS_OBJ[type]['transferloopjob'];
}

// exports.getAccountInfo = getAccountInfo;
// function getAccountInfo(accountJson, callback) {
//     var accountObj = new CommonAccount(accountJson.user, accountJson.type).config(accountJson);
//     var acc = accountqueue.getAccount(accountObj);
//     var result = {
//         action: "gotAccountInfo"
//     };
//     if (acc && !accountqueue.needRelogin(acc)) {
//         logutil.info("Account already logged in", acc.JSONInfo());
//         result.body = acc.JSONInfo();
//         if (callback) callback(result);

//     } else {
//         accountqueue.loginAccount(accountObj, function (info) {
//             if (accountObj.cookieJar) {
//                 accountqueue.addAccount(accountObj);
//                 result.body = accountObj.JSONInfo();
//                 accountObj.on("consumeHistory", handleConsumeHistory);
//             } else {
//                 result.body = info;
//             }

//             if (callback) callback(result);
//         });
//     }

// }


// function handleConsumeHistory(account, data) {
//     console.log("handleConsumeHistory", data, account.user)
//     var req = {
//         action: "updateConsumeHistory",
//         body: {
//             user: account.user,
//             source: account.source,
//             data: data
//         }
//     }
//     wsconnection.send(JSON.stringify(req), function (param) {
//         console.log("feeler send handleConsumeHistory callback", param)
//     });
// }

exports.updateAccounts = updateAccounts;
function updateAccounts(accountJson) {

    for (var i = 0; i < accountJson.length; i++) {
        var accountObj = new CommonAccount(accountJson[i].user, accountJson[i].type).config(accountJson[i]);
        accountObj.password = TestData.lu.user[accountObj.user].password;
        accountObj.tradePassword = TestData.lu.user[accountObj.user].tradePassword;

        var acc = accountqueue.getAccount(accountObj.user, accountObj.source);

        if (!acc){
            if(accountObj.isActive()) {
                console.log("add account----------", accountJson[i])
                accountqueue.addAccount(accountObj);
            }
        } else {
            console.log("config account----------", accountJson[i])
            acc.config(accountJson[i]);
        }

    }

}


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

// exports.removeAccountJson = removeAccountJson;
// function removeAccountJson(accountJson) {
//     accountqueue.inactive(accountJson.user, accountJson.password, accountJson.source);
// }

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

    var info = accountqueue.getUpdateInfo(latestIOTime);
    updateToTakoServer(info || {}, function (accs) {
        updateAccounts(accs);
        latestIOTime = new Date();
    });

}


function updateToTakoServer(info, callback) {
    simplehttp.POST("https://" + takoServerIp + "/api?action=feelerInfoIO", {
        headers: {
            'Content-type': 'application/json',
        },
        json: { body: info },
        ca: fs.readFileSync('cert/ca-crt.pem'),
        checkServerIdentity: function (host, cert) {
            return undefined;
        }
    },
        function (err, httpResponse, body) {
            try {
                var accountJson = body.body;
                callback(accountJson)
            } catch (e) {
                logutil.error("updateToTakoServer exception:", err, body);
                callback([]);
            }
        });
}
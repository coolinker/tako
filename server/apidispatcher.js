var masterController = require("../mastercontroller");

function addAccount(params, callback) {
    callback("addAccount", params)
    masterController.addAccountJson(params);
}

function startWatchingJob(params, callback){
    var interval = params.interval? Number(params.interval): 15000;

    masterController.startWatchingJob(params.type, interval);
    console.log("startWatching interval=", interval);
    callback("startWatching")
}
exports.startWatchingJob = startWatchingJob;

function stopWatchingJob(params, callback){
    masterController.stopWatchingJob(params.type);
    callback("stopWatching")
}
exports.stopWatchingJob = stopWatchingJob;
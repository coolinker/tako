var takoController = require("./takocontroller");

exports.registerFeeler = registerFeeler;
function registerFeeler(jsonParam, callback, ws) {
    takoController.registerFeeler(jsonParam, function(data) {
        var responseJson = {
                response: true,
                action: 'registerFeeler',
                body: data
            }
        callback(responseJson)
         ws.send(JSON.stringify(responseJson));
    }, ws);
}

exports.unregisterFeeler = unregisterFeeler;
function unregisterFeeler(jsonParam, callback) {
    takoController.unregisterFeeler(jsonParam, function(data) {
        var responseJson = {
                response: true,
                action: 'unregisterFeeler',
                body: data
            }
        callback(JSON.stringify(responseJson));
         //ws.send(JSON.stringify(responseJson));
    });
}

exports.getTradingHistory = getTradingHistory;
function getTradingHistory(params, callback) {
    takoController.getTradingHistory(params, function(responseInfo) {
            callback(JSON.stringify(responseInfo));    
    });
}

exports.getAccountInfo = getAccountInfo;
function getAccountInfo(params, callback) {
    takoController.getAccountInfo(params, function(responseInfo) {
            callback(JSON.stringify({
                action: "getAccountInfo",
                body: responseInfo
            }));    
    });
}

exports.gotAccountInfo = gotAccountInfo;
function gotAccountInfo(params, callback) {
    takoController.gotAccountInfo(params, function(responseInfo) {
            callback({
                action: "getAccountInfo",
                body: responseInfo
            });    
    });
}

exports.updateConsumeHistory = updateConsumeHistory;
function updateConsumeHistory (data) {
    takoController.updateConsumeHistory(data);
}

exports.addAccount = addAccount;
function addAccount(params, callback) {
    takoController.addAccountJson(params, function(accountInfo) {
        var obj = {
            user: accountInfo.user,
            loginTime: accountInfo.loginTime.getTime(),
            availableBalance: accountInfo.availableBalance
        }
        callback(JSON.stringify(obj));
    });

}

exports.startAccountBidding = startAccountBidding;
function startAccountBidding(params, callback) {
    takoController.startAccountBidding(params, function(responseInfo) {        
            callback(JSON.stringify(responseInfo));    
    });
}

exports.stopAccountBidding = stopAccountBidding;
function stopAccountBidding(params, callback) {
    takoController.stopAccountBidding(params, function(responseInfo) {        
            callback(JSON.stringify(responseInfo));    
    });
}
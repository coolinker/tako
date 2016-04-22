var masterController = require("./servercontroller");

exports.addAccount = addAccount;

function addAccount(params, callback) {
    masterController.addAccountJson(params, function(accountInfo) {
        var obj = {
            user: accountInfo.user,
            loginTime: accountInfo.loginTime.getTime(),
            availableBalance: accountInfo.availableBalance
        }
        callback(JSON.stringify(obj));
    });

}

exports.getAccountInfo = getAccountInfo;
function getAccountInfo(params, callback) {
    masterController.getAccountInfo(params, function(responseInfo) {
            console.log("getAccountInfo:", responseInfo)   
            callback(JSON.stringify(responseInfo));    
    });

}

exports.startAccountBidding = startAccountBidding;
function startAccountBidding(params, callback) {
    masterController.startAccountBidding(params, function(responseInfo) {        
            callback(JSON.stringify(responseInfo));    
    });
}

exports.stopAccountBidding = stopAccountBidding;
function stopAccountBidding(params, callback) {
    masterController.stopAccountBidding(params, function(responseInfo) {        
            callback(JSON.stringify(responseInfo));    
    });
}
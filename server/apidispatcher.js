var masterController = require("../mastercontroller");

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
    masterController.getAccountInfo(params, function(accountInfo) {
        var obj = {
            user: accountInfo.user,
            loginTime: accountInfo.loginTime.getTime(),
            availableBalance: accountInfo.availableBalance
        }
        callback(JSON.stringify(obj));
    });

}
var ACCOUNT_TYPES = require("./accounttypes");

var accountAttributes = {
    user: "",
    password: "",
    source: "",
    cookieJar: null,
    loginTime: null
}

var accountQueues = {};

exports.addAccount = addAccount;
function addAccount(accountInfo) {
    var accounttype = ACCOUNT_TYPES[accountInfo['source']];
    var loginjobs = require("./"+accounttype+"/loginjobs");
    loginjobs.login(accountInfo, function (cookieJar) {
        accountInfo.cookieJar = cookieJar;
        accountInfo.loginTime = new Date();
        if (cookieJar===null) {
            logutil.log("addAccount login failed", accountInfo);
        } else {    
            if (!accountQueues[accounttype]) {
                accountQueues[accounttype] = [];
            };
            accountQueues[accounttype].push(accountInfo);
        }
    })
    
}

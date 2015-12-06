var logutil = require("./logutil");
var CommonAccount = function(user, source){
    this.user = user;
    this.source = source;
};

CommonAccount.prototype.user = "";
CommonAccount.prototype.password = "";
CommonAccount.prototype.tradePassword = "";
CommonAccount.prototype.source = "";
CommonAccount.prototype.cookieJar = null;
CommonAccount.prototype.loginTime = null;
CommonAccount.prototype.loginExtendInterval = 15*60*1000;
CommonAccount.prototype.loginExtendedTime = null;
CommonAccount.prototype.locked = false;
CommonAccount.prototype.interestLevel = 100;
CommonAccount.prototype.availableBalance = 0;
CommonAccount.prototype.reservedBalance = 10000;
CommonAccount.prototype.maxFundPerProduct = 10000;
CommonAccount.prototype.lastConsumingTime = null;
CommonAccount.prototype.consumeHistory = {};

CommonAccount.prototype.config = function (obj){
    for (var att in obj) {
        this[att] = obj[att];
    }
    return this;
};


CommonAccount.prototype.loggedIn = function (){
    return !!this.cookieJar;
}

CommonAccount.prototype.ableToConsume = function (){
    // console.log(this.availableBalance, this.reservedBalance, this.source, this.user)
    return this.cookieJar && this.availableBalance >= this.reservedBalance;
}

CommonAccount.prototype.lock = function (){
    this.locked = true;
    this.lockedTime= new Date();
    logutil.log("lock account:", this.user);
};

CommonAccount.prototype.unlock = function (){
    this.locked = false;
    this.unlockedTime = new Date();
    logutil.log("unlock account:", this.user);
};
module.exports = CommonAccount;
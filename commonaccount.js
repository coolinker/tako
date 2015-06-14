var CommonAccount = function(user, password, interestLevel, minValidBalance, source){
    this.user = user;
    this.password = password;
    this.interestLevel = interestLevel;
    this.minValidBalance = minValidBalance;
    this.source = source;
};

CommonAccount.prototype.user = "";
CommonAccount.prototype.password = "";
CommonAccount.prototype.source = "";
CommonAccount.prototype.cookieJar = null;
CommonAccount.prototype.loginTime = null;
CommonAccount.prototype.loginExtendInterval = 15*60*1000;
CommonAccount.prototype.loginExtendedTime = null;
CommonAccount.prototype.locked = false;
CommonAccount.prototype.interestLevel = 100;
CommonAccount.prototype.avaliableBalance = 0;
CommonAccount.prototype.minValidBalance = 10000;
CommonAccount.prototype.maxFundPerProduct = 10000;
CommonAccount.prototype.lastConsumingTime = null;
CommonAccount.prototype.consumeHistory = {};

module.exports = CommonAccount;
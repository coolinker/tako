var logutil = require("./logutil");
var events = require('events');

var CommonAccount = function (user, source) {
    this.user = user;
    this.source = source;
    this.createdTime = new Date();
    this.consumeHistory = [];
    //this.eventEmitter = new events.EventEmitter();
    events.EventEmitter.call(this);
};

CommonAccount.prototype.__proto__ = events.EventEmitter.prototype;

CommonAccount.prototype.createdTime = null;
CommonAccount.prototype.user = "";
CommonAccount.prototype.password = "";
CommonAccount.prototype.tradePassword = "";
CommonAccount.prototype.source = "";
CommonAccount.prototype.cookieJar = null;
CommonAccount.prototype.loginTime = null;
CommonAccount.prototype.loginExtendInterval = 5 * 60 * 1000;
CommonAccount.prototype.loginExtendedTime = null;
CommonAccount.prototype.locked = false;
CommonAccount.prototype.interestLevelMin = 100;
CommonAccount.prototype.interestLevelMax = 100;
CommonAccount.prototype.availableBalance = 0;
CommonAccount.prototype.reservedBalance = 10000;
CommonAccount.prototype.pricePerBidMin = 0;
CommonAccount.prototype.pricePerBidMax = 10000;
CommonAccount.prototype.lastConsumingTime = null;
CommonAccount.prototype.consumeHistory = [];
CommonAccount.prototype.startedBidding = false;


CommonAccount.prototype.capability = {
    consume: true,
    leverage: 4.75,
    schedule: false,
    runSchedule: false
};

CommonAccount.prototype.config = function (obj) {
    for (var att in obj) {
        if (obj[att] instanceof Object && this[att] instanceof Object) {
            for (var subatt in obj[att]) {
                this[att][subatt] = obj[att][subatt];
            }
        } else {
            this[att] = obj[att];
        }

        
    }
    return this;
};

// CommonAccount.prototype.updateBidingParams = function (obj){
//     if (obj.interestLevelMin !== undefined) this.interestLevelMin = 
//     return this;
// };
CommonAccount.prototype.loggedIn = function () {
    return !!this.cookieJar;
}

CommonAccount.prototype.JSONInfo = function () {
    return {
        user: this.user,
        loginTime: this.loginTime ? this.loginTime.getTime() : "",
        availableBalance: this.availableBalance,
        reservedBalance: this.reservedBalance,
        pricePerBidMin: this.pricePerBidMin,
        pricePerBidMax: this.pricePerBidMax,
        startedBidding: this.startedBidding,
        interestLevelMin: this.interestLevelMin,
        interestLevelMax: this.interestLevelMax,
        capability: this.capability,
        source: this.source
    }
}

CommonAccount.prototype.addToConsumeHistory = function (obj) {
    this.consumeHistory.push(obj);
    this.emit('consumeHistory', this, obj);
}


CommonAccount.prototype.isActive = function () {
    var lgt = this.loginExtendedTime ? this.loginExtendedTime : this.loginTime;
    return new Date() - lgt < this.loginExtendInterval + 600000;
    //return this.ableToConsume() || this.loginTime ? (new Date() - this.loginTime < this.loginExtendInterval) : (new Date() - this.createdTime < 1000*60*15)
}

CommonAccount.prototype.ableToSchedule = function () {
    return this.cookieJar && this.capability.schedule;
}

CommonAccount.prototype.ableToConsume = function () {
    // console.log("ableToConsume-=======", this.availableBalance, this.reservedBalance, this.source, this.user, this.startedBidding)
    return this.cookieJar && this.capability.consume && (this.availableBalance - this.pricePerBidMin) >= this.reservedBalance;
}

CommonAccount.prototype.lock = function () {
    this.locked = true;
    this.lockedTime = new Date();
    logutil.log("lock account:", this.user);
};

CommonAccount.prototype.unlock = function () {
    this.locked = false;
    this.unlockedTime = new Date();
    logutil.log("unlock account:", this.user);
};
module.exports = CommonAccount;
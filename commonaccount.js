var logutil = require("./logutil");
var events = require('events');

var CommonAccount = function (user, source) {
    this.user = user;
    this.source = source;
    this.createdTime = new Date();
    this.consumeHistory = [];
    this.capability = {
        consume: true,
        leverage: 2.375,
        schedule: false
    };
    //events.EventEmitter.call(this);
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
CommonAccount.prototype.reservedBalance = 0;
CommonAccount.prototype.stopConsumeBalance = 0;

CommonAccount.prototype.pricePerBidMin = 0;
CommonAccount.prototype.pricePerBidMax = 10000;
CommonAccount.prototype.lastConsumingTime = null;
CommonAccount.prototype.consumeHistory = null;
CommonAccount.prototype.infoUpdateTime = null;
CommonAccount.prototype.scheduleObj = null;
CommonAccount.prototype.capability = null;

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
        stopConsumeBalance: this.stopConsumeBalance,
        interestLevelMin: this.interestLevelMin,
        interestLevelMax: this.interestLevelMax,
        capability: this.capability,
        source: this.source
    }
}

CommonAccount.prototype.getUpdateInfo = function (lastTime) {
    if (this.infoUpdateTime > lastTime) {
        var consumes = this.consumeHistory.map(function(item){
            return {
                productId: item.productId,
                price: item.price,
                interest: item.interest,
                producedTime: item.producedTime
            }
        });

        return {
            updateTime: this.infoUpdateTime,
            consume: consumes,
            schedule: {
                EXables: this.scheduleObj.selectedExables.length,
                appliedEX: this.scheduleObj.appliedEX.length,
                transferingTotal: this.scheduleObj.transferingTotal,
                expectedEXAmount: this.scheduleObj.expectedEXAmount,
                scheduleTime: this.scheduleObj.scheduleTime
            }
        }
    }
    return null;
}

CommonAccount.prototype.addToConsumeHistory = function (obj) {
    this.consumeHistory.push(obj);
    //this.emit('consumeHistory', this, obj);
    this.markInfoUpdate();
}

CommonAccount.prototype.markInfoUpdate = function () {
    this.infoUpdateTime = new Date();
}

CommonAccount.prototype.isActive = function () {
    var lgt = this.loginExtendedTime ? this.loginExtendedTime : this.loginTime;

    return this.capability.consume || this.capability.schedule || new Date() - lgt < this.loginExtendInterval + 600000;
    //return this.ableToConsume() || this.loginTime ? (new Date() - this.loginTime < this.loginExtendInterval) : (new Date() - this.createdTime < 1000*60*15)
}

CommonAccount.prototype.needNewSchedule = function () {
    if (!this.scheduleObj) return true;
    var scheduleTime = this.scheduleObj.scheduleTime;
    var now = new Date();
    var hours = now.getHours() + now.getMinutes() / 60;
    if (scheduleTime.getDate() !== now.getDate() && hours >= 7.5) return true;
    return false;

}
CommonAccount.prototype.ableToSchedule = function () {
    if (!this.scheduleObj) return false;
    if (this.scheduleObj.expectedEXAmount === 0 && this.scheduleObj.transferingTotal === 0) return false;

    var scheduleTime = this.scheduleObj.scheduleTime
    var now = new Date();
    if (scheduleTime.getDate() !== now.getDate() || (now - scheduleTime) > 24 * 60 * 60 * 1000) return false;

    var hours = now.getHours() + now.getMinutes() / 60;
    return this.cookieJar && this.capability.schedule && hours >= 8.25 && hours <= 22;
}

CommonAccount.prototype.ableToConsume = function () {
    if (!this.cookieJar || !this.capability.consume) return false;
    var total = this.availableBalance;// + this.scheduleObj.expectedEXAmount + this.scheduleObj.transferingTotal;
    if (total < this.stopConsumeBalance) return false;
    if (this.scheduleObj) {
        var afterRepay = total - this.ongoingTodayBuyBackAmount;
        if (afterRepay < this.stopConsumeBalance) return false;
    }

    return true;
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
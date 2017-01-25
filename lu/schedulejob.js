var mobileheaderutil = require("./mobileheaderutil");
var logutil = require("../logutil").config("lutransfer");
var simplehttp = require('../simplehttp');
var AEPrice = 6000;

function randomNumber() {
    return Math.round(Math.random() * 100000);
}

function appendArray(arr0, arr1) {
    arr0.push.apply(arr0, arr1);
}

function isSameDay(d0, d1) {
    return d0.getFullYear() === d1.getFullYear()
        && d0.getMonth() === d1.getMonth()
        && d0.getDate() === d1.getDate()
}


function get000Date(d, offset) {
    if (offset === undefined) offset = 0;
    var date = d ? new Date(d) : new Date();
    date.setDate(date.getDate() + offset);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

exports.schedule = schedule;
function schedule(account, callback) {
    var repayments, recentApply, currentEXable;
    var fun = function () {
        if (repayments && recentApply && currentEXable) {
            var d = {
                orign: 'BALANCE',
                investmentAmount: account.availableBalance,
                applyTime: get000Date()

            }
            var exables = currentEXable.concat(recentApply);
            exables.push(d);
            walkThrough(get000Date(), exables, repayments);
        }
    }

    getRepaymentDetails(account, 2, function (data) {
        repayments = data;
        fun();
    })

    getRecentApply(account, function (data) {
        recentApply = data;
        fun();
    })

    getEXable(account, function (data) {
        currentEXable = data;
        fun();
    })

}

function walkThrough(date, exable, repayments) {
    AEToEXable(date, exable);
    var newRepayments = [];
    var newbalance = EXableToBalanceAndProduceRepayments(date, exable, newRepayments);
    appendArray(repayments, newRepayments);
    var newAEs = [];
    var payresult = repayOnDayAndProduceAE(date, newbalance, repayments, newAEs)
    console.log("walkThrough", date, payresult);
    appendArray(exable, newAEs);

    if (payresult > AEPrice) {
        var newAEs = [];
        var leftbalance = balanceToAE(date, payresult, newAEs);
        appendArray(exable, newAEs);
        walkThrough(get000Date(date,1), leftbalance, exable, repayments);
    } else {

    }

    return payresult;
}


function repayOnDayAndProduceAE(date, balance, repayments, newAEs) {
    var dayRepayments = getRepaymentsOnDay(date, repayments);
    for (var i = 0; i < dayRepayments.length; i++) {
        var d = dayRepayments[i];
        if (balance >= d.expectedRepaymentAmount) {
            addScheduleStatus(d, "paid", get000Date(date), d.expectedRepaymentAmount);
            var ae = {
                orign: 'REPAYMENT',
                investmentAmount: d.expectedRepaymentAmount / 0.9,
                applyTime: get000Date(date)
            }
            addScheduleStatus(ae, 'AE', get000Date(date), ae.investmentAmount);
            newAEs.push(ae)
        }
        balance -= d.expectedRepaymentAmount;
    }

    return balance;
}

function getRepaymentsOnDay(date, data) {
    var repayments = [];
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (isSameDay(d.expectedRepaymentDate, date) && getScheduleStatus(d) !== 'paid') {
            repayments.push(d);
        }
    }

    return repayments.sort(function (rep0, rep1) {
        if (rep0.expectedRepaymentAmount > rep1.expectedRepaymentAmount) return 1;
        if (rep0.expectedRepaymentAmount < rep1.expectedRepaymentAmount) return -1;
        return 0;
    })

}

function EXableToBalanceAndProduceRepayments(date, data, repayments) {
    var balance = 0;
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (getScheduleStatus(d) !== "EXable") continue;
        var prc = d.remainingPrincipal * 0.9;
        addScheduleStatus(d, "balance", get000Date(date), prc);
        balance += prc;
        var repayment = {
            expectedRepaymentAmount: prc,
            expectedRepaymentDate: get000Date(date, 30),
            orign: 'EXable'
        }
        repayments.push(repayment);
    }

    return balance;
}

// function EXableToAEAndProduceRepayments(date, data) {
//     var repayments = [];
//     var applyTime = get000Date(date);
//     var repaymentDate = new Date(applyTime);
//     repaymentDate.setDate(repaymentDate.getDate() + 30);

//     for (var i = 0; i < data.length; i++) {
//         var d = data[i];
//         if (getScheduleStatus(d) !== 'EXable') continue;

//         var prc = 0.9 * d.remainingPrincipal;
//         addScheduleStatus(d, "AE", applyTime, prc);

//         var repayment = {
//             expectedRepaymentAmount: prc,
//             expectedRepaymentDate: repaymentDate,
//             orign: d.orign
//         }
//         repayments.push(repayment);
//     }

//     return repayments;
// }

function balanceToAE(date, balance, AEs) {
    var c = Math.floor(balance / AEPrice);
    for (var i = 0; i < c; i++) {
        var d = {
            orign: 'BALANCE_AE',
            investmentAmount: AEPrice,
            applyTime: get000Date(date)

        }
        balance -= AEPrice;
        addScheduleStatus(d, 'AE', get000Date(date), AEPrice);
        AEs.push(d);
    }

    return balance;
}

function AEToEXable(date, data) {
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (getScheduleStatus(d) === 'EXable') continue;

        if (d.orign === 'APPLY' || d.orign === 'BALANCE_AE') {
            var applyTime = new Date(d.applyTime);
            if (date.getDate() - applyTime.getDate() < 5) continue;
            addScheduleStatus(d, "EXable", get000Date(date), d.investmentAmount);
        } else if (d.orign === 'R030_TRANSFERABLE') {
            addScheduleStatus(d, "EXable", get000Date(date), d.remainingPrincipal);
        }

    }

    return data;
}


function getScheduleStatus(d) {
    if (!d.scheduleStatus || d.scheduleStatus.length === 0) return null;
    return d.scheduleStatus[d.scheduleStatus.length - 1].status;
}

function addScheduleStatus(data, status, time, amount) {
    time = new Date(time);
    if (data.scheduleStatus === undefined) data.scheduleStatus = [];
    data.scheduleStatus.push({ status: status, time: time, amount: amount });
}

function getRepaymentDetails(account, months, callback, seq) {
    if (seq === undefined) seq = 0;
    console.log("getRepaymentDetails", seq, months)
    var date = new Date();
    date.setMonth(date.getMonth() + seq);
    var dateStr = date.toJSON().substr(0,10);
    simplehttp.POST("https://ma.lu.com/mapp/service/private?M6130&_" + randomNumber(), {
        "cookieJar": account.cookieJar,
        "headers": mobileheaderutil.getHeaders(account.uid),
        form: {
            requestCode: "M6130",
            version: "3.4.9",
            params: '{"startDate":"' + dateStr + '"}'
        }
    },
        function (err, httpResponse, body) {
            try {
                var result = JSON.parse(body).result.repaymentCalendarDetails;
                var repayments = [];
                result.forEach(function (d) {
                    d.loanPlanItems.forEach(function (item) {
                        if (item.planStatus === 'SETTLED') return;
                        item.orign = 'REPAYMENT';
                        item.expectedRepaymentDate = get000Date(item.expectedRepaymentDate);
                        repayments.push(item);
                    });
                });

                if (seq < months - 1) {
                    getRepaymentDetails(account, months, function (details) {
                        callback(repayments.concat(details));
                    }, seq + 1)
                } else {
                    callback(repayments);
                }

            } catch (e) {
                logutil.error("getRepaymentDetails exception:", err, body);
                callback(null);
            }
        });
}

function getRecentApply(account, callback) {
    requestM6059(account, 'APPLY', '', function (data) {
        var applys = [];
        var today = get000Date();
        for (var i=0; i<data.length; i++){
            var time = get000Date(data[i].applyTime, 5);
            if (time > today) {
                applys.push(data[i])
            }
               
        }
        console.log("Valid applys:", applys.length)
        callback(applys);
    })
}

function getEXable(account, callback) {
    //{"sortType":"desc","requestType":"ONGOING","assetType":"FINANCE","filter":"R030_TRANSFERABLE","pageNum":2}
    requestM6059(account, 'ONGOING', 'R030_TRANSFERABLE', function (data) {
        callback(data);
    })
}


function requestM6059(account, requestType, filter, callback, pageNum) {
    if (!pageNum) pageNum = 1;
    console.log("requestM6059", requestType, filter, pageNum)
    simplehttp.POST("https://ma.lu.com/mapp/service/private?M6059&_" + randomNumber(), {
        "cookieJar": account.cookieJar,
        "headers": mobileheaderutil.getHeaders(account.uid),
        form: {
            requestCode: "M6059",
            version: "3.4.9",
            //{"sortType":"desc","requestType":"APPLY","assetType":"FINANCE","filter":"","pageNum":"1"}
            params: '{"sortType":"desc","requestType":"' + requestType + '","assetType":"FINANCE","filter":"' + filter + '","pageNum":"' + pageNum + '"}'
        }
    },
        function (err, httpResponse, body) {
            try {
                var result = JSON.parse(body).result.data.paginationGson;
                result.data.forEach(function (d) {
                    d.orign = filter?filter:requestType;
                });

            
                if (pageNum < Number(result.totalPage)) {
                    requestM6059(account, requestType, filter, function (applys) {
                        callback(applys.concat(result.data));
                    }, pageNum + 1)
                } else {
                    callback(result.data);
                }

            } catch (e) {
                logutil.error("getRecentApply exception:", err, e);
                callback(null);
            }
        });
}


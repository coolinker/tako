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
/*
 balance ~ 
         AE - EXable - repayment - AE
                         balance ~
                                 AE - EXable - repayment - AE

*/
exports.schedule = schedule;
function schedule(account, callback) {
    var repayments, recentApply, currentEXable;
    var fun = function () {
        if (repayments && recentApply && currentEXable) {
            var d = {
                orign: 'BALANCE',
                amount: account.availableBalance,
                applyTime: get000Date()

            }
            addScheduleStatus(d, 'available', get000Date(), account.availableBalance);
            var all = currentEXable.concat(recentApply).concat(repayments);
            all.push(d);
            var standardamount = account.totalAssets * account.capability.leverage / 7;

            walkThrough(get000Date(), all, standardamount);
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


function walkThrough(date, productList, standardAmount) {

    for (var i = 0; i < 30; i++) {
        var dt = get000Date(date, i);
        AEToEXable(dt, productList);
        buyBackOnDay(dt, productList);

        var preEXedAmount = getEXAmountForDuration(get000Date(dt, -4), dt, productList);
        var postEXedAmount = getEXAmountForDuration(dt, get000Date(dt, 4), productList);

        if (preEXedAmount > standardAmount || postEXedAmount > standardAmount) {
            console.log("Can not repay risk!", dt, standardAmount, preEXedAmount, postEXedAmount);
            break;
        }

        var toEXAmount = standardAmount - Math.max(preEXedAmount, postEXedAmount);
        var selectedEXables = [];
        var selectedBalance = selectEXablesToEX(dt, toEXAmount, productList, selectedEXables);
        var balanceFromEX = EXForBalance(dt, selectedEXables);
        productList.push(balanceFromEX);

        console.log(dt, "repaytotal", toEXAmount, EXedAmount);

        balanceToAE(dt, productList);

    }

}


function getEXAmountForDuration(from, to, productList) {
    var amount = 0;
    for (var i = 0; i < productList.length; i++) {
        var prd = productList[i];
        if (getScheduleStatus(prd) === "repayment") {
            var dt = getScheduleStatusTime(prd, "repayment");
            var exdt = get000Date(dt, -30);
            if (dt >= from && dt <= to || exdt >= from && exdt <= to) {
                amount += getScheduleStatusAmount(prd, "repayment")
            }
        }
    }

    return amount;
}


function buyBackOnDay(date, productList) {
    var dayrepayments = [];
    var repaytotal = getRepaymentsOnDay(date, productList, dayrepayments);

    if (repaytotal > 0) {

        var remainAmount = repayByBalanceOnDay(date, repaytotal, productList);

        if (remainAmount > 0) {
            var selectedEXables = [];
            var selectedBalance = selectEXablesToEX(date, remainAmount, productList, selectedEXables);

            if (selectedBalance < repaytotal) {
                console.log("********************* can not repay", dt, remain);
                return;
            }

            var balanceFromEX = EXForBalance(date, selectedEXables);
            productList.push(balanceFromEX);
            var remain = repayByBalanceOnDay(date, remainAmount, productList);

            dayrepayments.forEach(function (repayment) {
                addScheduleStatus(repayment, "AE", get000Date(date), repayment.expectedRepaymentAmount / 0.9)
            });

        }

    }

    return repaytotal;
}

function EXForBalance(date, exables) {
    var balance = 0;
    exables.forEach(function (exable) {
        var amount = getScheduleStatusAmount(exable, "EXable");
        addScheduleStatus(exable, "repayment", get000Date(date, 30), amount * 0.9);
        balance += amount * 0.9;
    })

    return balance;
}


function repayByBalanceOnDay(date, amount, productList) {
    var balances = [];
    var available = getAvailableBalanceOnDay(date, productList, balances);
    for (var i = 0; i < balances.length; i++) {
        var blc = getScheduleStatusAmount(balances[i], "available");
        amount -= blc;
        addScheduleStatus(balances[i], "available", get000Date(date), 0);
    }

    if (amount < 0) {
        var d = {
            orign: 'BALANCE',
            amount: -amount,
            applyTime: get000Date(date)

        }
        addScheduleStatus(d, 'available', get000Date(date), -amount);
        productList.push(d);
    }

    return amount;
}

function getAvailableBalanceOnDay(date, productList, out_Balances) {
    var availables = [];
    var totalamount = 0;
    for (var i = 0; i < productList.length; i++) {
        var availableDate = getScheduleStatusTime(productList[i], "available");
        if (!availableDate || availableDate > date) continue;
        var available = getScheduleStatusAmount(productList[i], "available");
        if (available > 0) {
            totalamount += available;
            out_Balances.push(productList[i]);
        }
    }

    out_Balances.sort(function (b0, b1) {
        b0 = getScheduleStatusAmount(b0, "available");
        b1 = getScheduleStatusAmount(b1, "available");
        if (b0 > b1) return -1;
        if (b0 < b1) return 1;
        if (b0 === b1) return 0;

    });

    return totalamount;
}

function selectEXablesToEX(date, totalamount, productList, selectedEXables) {
    if (totalamount <= 0) return 0;

    var validEXables = [];
    for (var i = 0; i < productList.length; i++) {
        if (getScheduleStatus(productList[i]) === "EXable") {
            validEXables.push(productList[i]);
        }
    }

    validEXables.sort(function (e0, e1) {
        var amt0 = getEXableAmount(e0);
        var amt1 = getEXableAmount(e1);
        if (amt0 > amt1) return -1;
        if (amt0 < amt1) return 1;
        if (amt0 === amt1) return 0;
    });

    for (var j = 0; j < validEXables.length; j++) {
        var amt = getEXableAmount(validEXables[j]);
        if (amt < totalamount || j === validEXables.length - 1) {
            totalamount -= amt * 0.9;
            selectedEXables.push(validEXables[j]);
        }
        if (totalamount <= 0) break;
    }

    return totalamount;
}

// function EXablesToBalanceAndProduceRepayment(date, exables) {
//     var newRepayments = [];
//     for (var i = 0; i < exables.length; i++) {
//         var repayment = EXableToBalanceAndProduceRepayment(date, exables[i]);
//         newRepayments.push(repayment);
//     }

//     return newRepayments;
// }

function repaymentToAE(date, repayments) {

    for (var i = 0; i < repayments.length; i++) {
        var d = repayments[i];
        addScheduleStatus(d, "AE", get000Date(date), d.expectedRepaymentAmount / 0.9);

    }

}

// function repayOnDayAndProduceAE(date, balance, repayments, newAEs) {
//     var dayRepayments = [];
//     var repaytotal = getRepaymentsOnDay(date, repayments, dayRepayments);

//     for (var i = 0; i < dayRepayments.length; i++) {
//         var d = dayRepayments[i];
//         if (balance >= d.expectedRepaymentAmount) {
//             addScheduleStatus(d, "paid", get000Date(date), d.expectedRepaymentAmount);
//             var ae = {
//                 orign: 'REPAYMENT_AE',
//                 investmentAmount: d.expectedRepaymentAmount / 0.9,
//                 applyTime: get000Date(date)
//             }
//             addScheduleStatus(ae, 'AE', get000Date(date), ae.investmentAmount);
//             newAEs.push(ae)
//         }
//         balance -= d.expectedRepaymentAmount;
//     }

//     return balance;
// }

function getRepaymentsOnDay(date, data, repayments) {
    var total = 0;
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (getScheduleStatus(d) !== "repayment") continue;
        var expectedDate = getScheduleStatusTime(d, "repayment")
        if (expectedDate <= date) {
            repayments.push(d);
            total += getScheduleStatusAmount(d, "repayment");
        }
    }
    repayments.sort(function (rep0, rep1) {
        var rep0v = getScheduleStatusAmount(rep0, "repayment");
        var rep1v = getScheduleStatusAmount(rep1, "repayment");
        if (rep0v > rep1v) return 1;
        if (rep0v < rep1v) return -1;
        return 0;
    })

    return total;
}

// function EXableToBalanceAndProduceRepayment(date, exable) {
//     if (getScheduleStatus(exable) !== "EXable") return null;
//     var prc = getScheduleStatusAmount(exable, "EXable") * 0.9;
//     addScheduleStatus(exable, "balance", get000Date(date), prc);
//     var repayment = {
//         expectedRepaymentAmount: prc,
//         expectedRepaymentDate: get000Date(date, 30),
//         orign: 'EXable'
//     }

//     return repayment;
// }

// function EXableToBalanceAndProduceRepayments(date, data, repayments) {
//     var balance = 0;
//     for (var i = 0; i < data.length; i++) {
//         var d = data[i];
//         if (getScheduleStatus(d) !== "EXable") continue;
//         var prc = d.remainingPrincipal * 0.9;
//         addScheduleStatus(d, "balance", get000Date(date), prc);
//         balance += prc;
//         var repayment = {
//             expectedRepaymentAmount: prc,
//             expectedRepaymentDate: get000Date(date, 30),
//             orign: 'EXable'
//         }
//         repayments.push(repayment);
//     }

//     return balance;
// }

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

function balanceToAE(date, productList) {

    var balances = [];
    var available = getAvailableBalanceOnDay(dt, productList, balances);

    var c = Math.floor(available / AEPrice);

    for (var i = 0; i < c; i++) {
        var d = {
            orign: 'BALANCE_AE',
            investmentAmount: AEPrice,
            applyTime: get000Date(date)

        }
        available -= AEPrice;
        addScheduleStatus(d, 'AE', get000Date(date), AEPrice);
        productList.push(d);
    }

    balances.forEach(function(balance){
        addScheduleStatus(balance, "available", get000Date(date), 0);
    })
        


    if (available > 0) {
        var d = {
            orign: 'BALANCE',
            amount: available,
            applyTime: get000Date(date)

        }
        addScheduleStatus(d, 'available', get000Date(date), -available);
        productList.push(d);
    }



    return balance;
}

function AEToEXable(date, data) {
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (getScheduleStatus(d) !== 'AE') continue;
        var applyTime = new Date(d.applyTime);
        if (date.getDate() - applyTime.getDate() < 5) continue;
        addScheduleStatus(d, "EXable", get000Date(date), Number(d.investmentAmount));
    }

    return data;
}

function getEXableAmount(d) {
    if (!d.scheduleStatus || d.scheduleStatus.length === 0) return null;
    if (d.scheduleStatus[d.scheduleStatus.length - 1].status !== 'EXable') return null;
    return d.scheduleStatus[d.scheduleStatus.length - 1].amount;
}

function getScheduleStatusAmount(d, status) {
    if (!d.scheduleStatus || d.scheduleStatus.length === 0 || getScheduleStatus(d) !== status) return null;
    return d.scheduleStatus[d.scheduleStatus.length - 1].amount;
}

function getScheduleStatusTime(d, status) {
    if (!d.scheduleStatus || d.scheduleStatus.length === 0 || getScheduleStatus(d) !== status) return null;
    return d.scheduleStatus[d.scheduleStatus.length - 1].time;
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
    var dateStr = date.toJSON().substr(0, 10);
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
                        item.expectedRepaymentAmount = Number(item.expectedRepaymentAmount);
                        addScheduleStatus(item, "repayment", get000Date(item.expectedRepaymentDate), item.expectedRepaymentAmount);
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
                console.error("getRepaymentDetails exception:", err, e.stack);
                callback(null);
            }
        });
}

function getRecentApply(account, callback) {
    requestM6059(account, 'APPLY', '', function (data) {
        var applys = [];
        var today = get000Date();
        for (var i = 0; i < data.length; i++) {
            var time = get000Date(data[i].applyTime, 5);
            if (time > today) {
                addScheduleStatus(data[i], "AE", get000Date(data[i].applyTime), Number(data[i].investmentAmount))
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
        data.forEach(function (item) {
            addScheduleStatus(item, "EXable", get000Date(), Number(item.remainingPrincipal))
        })
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
                    d.orign = filter ? filter : requestType;
                });


                if (pageNum < Number(result.totalPage)) {
                    requestM6059(account, requestType, filter, function (applys) {
                        callback(applys.concat(result.data));
                    }, pageNum + 1)
                } else {
                    callback(result.data);
                }

            } catch (e) {
                console.error("getRecentApply exception:", err, e.stack);
                callback(null);
            }
        });
}


function sendSteps(e, t, n, r) {
    $.post(url(step_url.trace), {
        sid: e,
        productId: t,
        curStep: n
    }, function(e) {
        e.result ? typeof r == "function" && r() : window.location.href = url("step-error")
    })
}

function checkSteps(e, t, n, r, i) {
    $.getJSON(url(step_url.check_trace), {
        sid: e,
        productId: t,
        userId: n,
        curStep: r
    }, function(e) {
        e ? typeof i == "function" && i() : window.location.href = url("step-error")
    })
}

function checkStatus(e, t) {
    $.getJSON(url(statusUrl.checkStatus.format(e)), function(e) {
        e.result ? typeof t == "function" && t() : popupForCancelError()
    }).error(errorHandler())
}

function popupForCancelError() {
    lufax.popup.newIconPopup({
        popupTitleName: "投资失败",
        message: "抱歉，该投资项目信息已变更，现在无法投资，请投资其他项目。",
        button: '<a class="btns btn_info confirmBtn" href="javascript:void(0);">更多投资项目</a>',
        iconClass: "prompt-popup-icon",
        onConfirm: function() {
            window.location.href = listUrl("listing")
        },
        onClose: function() {
            window.location.href = listUrl("listing")
        }
    })
}

function url(e) {
    return Global.basePath === undefined && (Global.basePath = ""), Global.basePath + e
}

function listUrl(e) {
    return document.getElementById("listUrl") + "/" + e
}

function errorHandler(e) {
    return function(t) {
        if (e && e[t.status]) return e[t.status]();
        t.status == 404 ? window.top.location.href = url("notFound.html") : t.status == 500 && (window.top.location.href = url("error.html"))
    }
}
define("basePath/constant", {
        SOURCE_TYPE: {
            XINBAO: "1",
            LICAI: "2",
            HUIFU: "3",
            FUYING: "4",
            PIAOJU: "5",
            ZHUJIANG: "6",
            ANRONG: "7",
            ANSHUO: " 9"
        },
        CATEGORY: {
            ANYI: "101",
            JINYINGTONG: "201",
            ANXIN: "204",
            HUIFU: "301",
            YL: "401",
            SHILIPAI: "402",
            PIAOJU: "501",
            WALLET: "801",
            ANYI2: "901",
            BAILING: "902",
            ANYE: "903",
            POS2: "905",
            XINBAO: "907"
        },
        SALES_AREA: {
            DIANJINA: 1,
            DIANJINB: 2,
            DIANJINC: 3
        },
        CONTRACT_COUNT: {
            402: 5,
            801: 2,
            905: 3,
            901: 3,
            902: 3,
            701: 2,
            802: 3,
            A01: 3
        },
        CONTRACT_NAME_DISPLAY: {
            402: !1,
            801: !1,
            905: !0,
            901: !0,
            902: !0,
            701: !0,
            802: !0,
            A01: !0
        },
        HOST_URL: {
            LIST: document.getElementById("listUrl").value,
            MY: document.getElementById("myUrl").value,
            YEB: document.getElementById("yebUrl").value
        },
        PAYMENT_METHOD: {
            BALANCE: "1",
            WITHHOLD: "2",
            QUICKPAY: "3"
        },
        QUICKPAY_BANK_RESPONSE_STATUS: {
            INPROGRESS: 1,
            FAILURE: 2,
            SUCCESS: 3
        },
        QUICKPAY_BANK_RESPONSE: {
            SUCCESS: "PBB00",
            BALANCE_NOT_ENOUGH: "PBB02",
            CARD_BIN_ERROR: "PBB16",
            IDENTITY_NOT_MATCH: "PBB34",
            NAME_NOT_MATCH: "PBB35",
            TEL_NOT_MATCH: "PBB101"
        },
        QUICKPAY_ERROR_CODE: {
            "01": {
                SELECTOR: "#bankNo",
                MSG: "银行卡号不在支持范围内"
            },
            "02": {
                SELECTOR: "#bankNo",
                MSG: "{0}每日{1}系统维护，期间无法进行正常交易"
            },
            77: {
                SELECTOR: "#bankNo",
                MSG: "该卡已被使用，暂不支持快速支付"
            },
            PBB02: {
                SELECTOR: "#bankNo",
                MSG: "该银行卡余额不足"
            },
            PBB16: {
                SELECTOR: "#bankNo",
                MSG: "银行卡号不在支持范围内"
            },
            PBB34: {
                SELECTOR: "#bankNo",
                MSG: "银行卡号和您当前的开户姓名不匹配"
            },
            PBB35: {
                SELECTOR: "#bankNo",
                MSG: "银行卡号和您当前的开户姓名不匹配"
            },
            PBB101: {
                SELECTOR: "#mobileNo",
                MSG: "您填写的手机号和开卡时预留的手机号不一致"
            },
            PBB102: {
                SELECTOR: "#otpNo",
                MSG: "手机动态码错误"
            },
            OTHERS: {
                SELECTOR: "#bankNo",
                MSG: "您当前的银行卡无法进行支付，请确认银行卡状态后再试"
            }
        },
        QUICKPAY_TRADE_RESULT: {
            SUCCESS: "SUCCESS",
            PROCESSING: "PROCESSING",
            FAIL: "FAIL"
        },
        OTP_RESPONSE: {
            SUCCESS: "000",
            BANK_NOT_SUPPORT: "01",
            BANK_MAINTAIN: "02",
            BANK_USED: "77",
            USER_NOT_SUPPORT: "99"
        },
        TIMEOUT: "TIMEOUT"
    }),
    function(e) {
        e.fn.zoomTips = function(t) {
            var n = {
                    isCash: !1
                },
                r = e.extend(n, t),
                i = '<div class="zoomTips"></div>';
            return e("body").append(i), this.each(function() {
                function t(t) {
                    r.isCash ? e(".zoomTips").text(lufax.NumFormat.numberFormatWithoutCurrency(t)) : e(".zoomTips").text(t)
                }

                function n(t) {
                    var n = e(t).offset(),
                        r = n.top,
                        i = n.left,
                        s = e(t).innerHeight();
                    e(".zoomTips").css({
                        left: i,
                        top: r + 30
                    }).show()
                }

                function i() {
                    e(".zoomTips").hide()
                }
                e(this).blur(function() {
                    var t = e(this).val();
                    r.isCash ? t = t : t = t.replace(/\s/g, "").replace(/(\d{4})(?=\d)/g, "$1 "), e(this).val(t), i()
                }), e(this).bind("focus", function() {
                    var r = e(this).val();
                    r.length == 0 ? i() : (t(r), n(this))
                }), e(this).bind("keydown keyup", function() {
                    var s = e(this).val();
                    r.isCash ? (s = s, e(this).next().text(lufax.NumFormat.convertCurrency(s))) : s = s.replace(/\s/g, "").replace(/(\d{4})(?=\d)/g, "$1 "), s.length > 0 ? (t(s), n(this)) : i()
                })
            })
        }
    }(jQuery), define("basePath/zoomtip", function() {});
var step_url = {
    trace: "service/trade/trace",
    check_trace: "service/trade/check-trace"
};
define("tradingLibPath/stepsValidate", function() {});
var statusUrl = {
    checkStatus: "service/trade/product/{0}/check-status"
};
define("tradingLibPath/checkStatus", function() {}), $.ajaxSetup({
    cache: !1
}), String.prototype.trim = function() {
    return this.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, "")
}, String.prototype.format = function(e) {
    if (arguments.length == 0) return null;
    var e = Array.prototype.slice.call(arguments, 0);
    return this.replace(/\{(\d+)\}/g, function(t, n) {
        return e[n]
    })
}, String.prototype.safely = function() {
    return this.replace(/\n\r/g, "")
}, Array.prototype.clone = function() {
    return this.slice(0)
}, Array.prototype.removeAt = function(e) {
    return this.splice(e, 1), this
};
var utility = function() {
        function e(e) {
            var t;
            $(window).bind("resize", function() {
                t && clearTimeout(t), t = setTimeout(e, 100)
            })
        }

        function t() {
            return $.browser.msie && /msie 7\.0/i.test(navigator.userAgent) ? !0 : !1
        }

        function n(e) {
            var t = 99999999999.99,
                n = "零",
                r = "壹",
                i = "贰",
                s = "叁",
                o = "肆",
                u = "伍",
                a = "陆",
                f = "柒",
                l = "捌",
                c = "玖",
                h = "拾",
                p = "佰",
                d = "仟",
                v = "万",
                m = "亿",
                g = "人民币",
                y = "元",
                b = "角",
                w = "分",
                E = "整",
                S, x, T, N, C, k, L, A, O, M, _, D, P, H;
            e += "";
            if (e == "") return "Empty input!";
            if (e.match(/[^,.\d]/) != null) return "Invalid characters in the input string!";
            if (e.match(/^((\d{1,3}(,\d{3})*(.\d+)?)|(\d+(.\d+)?))$/) == null) return "Illegal format of digit number!";
            e = e.replace(/,/g, ""), e = e.replace(/^0+/, "");
            if (Number(e) > t) return "Too large a number to convert!";
            e = parseFloat(e), e += "", N = e.split("."), N.length > 1 ? (S = N[0], x = N[1], x = x.substr(0, 2)) : (S = N[0], x = ""), C = [n, r, i, s, o, u, a, f, l, c], k = ["", h, p, d], L = ["", v, m], A = [b, w], T = "";
            if (Number(S) > 0) {
                O = 0;
                for (M = 0; M < S.length; M++) _ = S.length - M - 1, D = S.substr(M, 1), P = _ / 4, H = _ % 4, D == "0" ? O++ : (O > 0 && (T += C[0]), O = 0, T += C[Number(D)] + k[H]), H == 0 && O < 4 && (T += L[P]);
                T += y
            }
            if (x != "")
                for (M = 0; M < x.length; M++) D = x.substr(M, 1), D != "0" && (T += C[Number(D)] + A[M]);
            return T == "" && (T = n + y), x == "" && (T += E), T
        }

        function r(e) {
            return i(e) + "%"
        }

        function i(e) {
            if (e === 0 || e === "0") return "0.00%";
            if (!e || isNaN(e)) return "";
            e = parseFloat(e), e = Math.round(e * 1e4) / 100 + "", e.indexOf(".") == -1 ? e += ".00" : e += "00";
            var t = e.split("."),
                n = t[1].substring(0, 2);
            return t[0] + "." + n
        }

        function o(e) {
            return e > 1e9 ? !1 : s.test(e)
        }

        function u(e) {
            return s.test(e)
        }

        function a(e) {
            var t = "￥",
                n = f(e);
            return n == "" ? n : t + n
        }

        function f(e) {
            if (e === 0 || e === "0") return "0.00";
            if (!e || isNaN(e)) return "";
            e += "";
            var t = e.split("."),
                n = t[0],
                r = t.length > 1 ? "." + t[1] : ".00";
            r.length < 3 && (r += "00"), r = r.substring(0, 3);
            var i = /(\d+)(\d{3})/;
            while (i.test(n)) n = n.replace(i, "$1,$2");
            return n + r
        }

        function l(e) {
            return Math.round(e * 100) / 100
        }

        function c(e, t) {
            return t ? e.replace(/\$\{(.+?)\}/g, function(e, n) {
                return t[n]
            }) : e
        }
        var s = new RegExp(/^\d+(\.\d{1,2})?$/);
        return {
            resize: e,
            convertCurrency: n,
            isIE7: t,
            percentageFormat: r,
            withoutPercentageFormat: i,
            numberFormat: a,
            numberFormatWithoutCurrency: f,
            round: l,
            formatMessage: c,
            validateMoney: o,
            validateAmount: u
        }
    }(),
    keyCode = {
        esc: 27,
        enter: 13
    };
$(document).bind("keydown", function(e) {
    if (e.keyCode == keyCode.esc) try {} catch (e) {}
});
var jsTemplate = function() {
    function e(e) {
        return e == null ? "" : e.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    }

    function t(t, n, r) {
        var i = TrimPath.parseTemplate(e(t), "templateId").process({
            model: n
        });
        return r && r(i), i
    }

    function n(t, n, r) {
        var i = TrimPath.parseTemplate(e(t), "templateId").process(n);
        return r && r(i), i
    }

    function r(e, t, n) {
        var r = TrimPath.processDOMTemplate(e, {
            model: t
        });
        return typeof n == "function" && n(r), r
    }
    return {
        mergeAndShow: t,
        nativeMergeAndShow: r,
        originMergeAndShow: n
    }
}();
$("head").ajaxError(function(e, t) {
    if (t.status == 500) {
        window.top.location.href = url("error.html");
        return
    }
    if (t.status == 404) {
        window.top.location.href = url("notFound.html");
        return
    }
    var n = t.responseText;
    if (n == undefined || n.indexOf("isNotAuthenticated") < 0) return;
    var r = $.parseJSON(n);
    if (r != undefined && r.isNotAuthenticated) {
        if (t.status == 403) {
            window.top.location.href = r.location + "&returnPostURL=" + encodeURIComponent(window.location.href);
            return
        }
        window.top.location.href = r.location
    }
}), define("base", function() {}), define("requirePath/loadBasicStatic", ["base"], function() {}), requirejs(["basePath/constant", "basePath/zoomtip", "tradingLibPath/stepsValidate", "tradingLibPath/checkStatus", "requirePath/loadBasicStatic", "com"], function(e) {
    var t = {
            createCaptcha: "service/trade/captcha/create-captcha",
            captchaCheck: "service/trade/captcha-pre-check",
            getPaymentInfo: "service/trade/get-payment-info",
            tradeResult: "service/trade/trx-result",
            otp: "service/quick-pay/auth",
            bindBank: "service/quick-pay/auth/query"
        },
        n = !0,
        r = $("#productId").val(),
        i = $("#userId").val(),
        s = $("#sid").val(),
        o = $("#coinSwitch").val(),
        u = $("#productCoinSwitch").val(),
        a = $("#productCategory").val(),
        f = document.getElementById("isAllowBank").value,
        l = document.getElementById("balanceAmount").value - 0,
        c = a == e.CATEGORY.SHILIPAI,
        h = document.getElementById("paymentMethod").value,
        p = h == e.PAYMENT_METHOD.QUICKPAY,
        d = ["#bankNo", "#mobileNo", "#otpNo"],
        v = {
            empty: {
                text: "请填写",
                reg: /\S+/g
            },
            bankNo: {
                text: "请填写有效的储蓄卡卡号",
                reg: /^\d*$/g
            },
            mobileNo: {
                text: "手机号码格式不正确",
                reg: /^1\d{10}$/g
            },
            otpNo: {
                text: "动态码为6位数字",
                reg: /^\d{6}$/g
            }
        },
        m = {
            COUNT_DOWN_SECOND: 59,
            INPUTS_TO_VALIDATE: ["#bankNo", "#mobileNo"],
            _otpResponse: "",
            _tradeResponse: "",
            _bankQueryResponse: "",
            countDownCallback: function(e) {
                var t = this;
                t.COUNT_DOWN_SECOND > 1 ? (--t.COUNT_DOWN_SECOND, e.html(t.COUNT_DOWN_SECOND), t._countDownObj = setTimeout(function() {
                    t.countDownCallback(e)
                }, 1e3)) : ($("#otp-sending").hide(), $("#btn-otp").show(), t.COUNT_DOWN_SECOND = 59, e.html(t.COUNT_DOWN_SECOND))
            },
            resetCountDown: function() {
                var e = this;
                setTimeout(function() {
                    $("#otp-sending").hide(), $("#btn-otp").show(), clearTimeout(e._countDownObj), e.COUNT_DOWN_SECOND = 59, $("#otp-sending i").html(e.COUNT_DOWN_SECOND)
                }, 1e3)
            },
            registerEvents: function() {
                var e = this;
                $(".quickpay-form .inputs").focus(function() {
                    var e = $(this).closest(".controls"),
                        t = e.find(".help-line");
                    e.find(".input-wrap").removeClass("error"), e.find(".errorPanel").removeClass("show"), t.length > 0 && t.removeClass("hidden")
                }), $(".quickpay-form .inputs").blur(function() {
                    var t = $(this);
                    e.validateInput(t)
                }), $("#btn-otp").click(function() {
                    e._otpResponse = "", e._tradeResponse = "", e._bankQueryResponse = "", e.validateForm(e.INPUTS_TO_VALIDATE) && ($(this).hide(), $("#otp-sending").css("display", "inline-block"), setTimeout(function() {
                        e.countDownCallback($("#otp-sending i"))
                    }, 1e3), e.sendOtp())
                }), $("#bankNo").zoomTips()
            },
            validateForm: function(e, t) {
                var n = this,
                    r = !0;
                for (var i = e.length - 1; i >= 0; i--) {
                    var s = $(e[i]),
                        o = n.validateInput(s, !0);
                    r = r && o
                }
                return t && !$(".quickpay-form").data("responseNo") ? (n.showInputError("#otpNo", "请先获取短信验证码"), !1) : r
            },
            validateInput: function(e, t) {
                var n = this;
                if (e.data("isValid")) return !0;
                var r = e.closest(".controls"),
                    i = e.val().replace(/^\s+|\s+$/g, "");
                e.is("#bankNo") && (i = i.replace(/\s+/g, ""));
                var s = e.data("validateOrder").split(",");
                r.find(".help-line").addClass("hidden");
                for (var o = 0; o < s.length; o++)
                    if ((t || i !== "") && !i.match(v[s[o]].reg)) {
                        var u = v[s[o]].text;
                        return s[o] == "empty" && (u += e.data("label")), n.showInputError("#" + e[0].id, u, !0), !1
                    }
                return r.find(".errorPanel").removeClass("show"), r.find(".input-wrap").removeClass("error"), !0
            },
            updateResult: function(t) {
                var n = this;
                n.showOTPLoading(!1);
                var r = e.QUICKPAY_ERROR_CODE;
                t == e.OTP_RESPONSE.USER_NOT_SUPPORT ? n.goToErrorPage(t) : (r[t] || (t = "OTHERS"), n.showInputError(r[t].SELECTOR, r[t].MSG))
            },
            showInputError: function(e, t, n) {
                var r = this,
                    i = $(e).closest(".controls");
                i.find(".errorPanel").addClass("show").find(".errorContent").html(t), i.find(".input-wrap").addClass("error"), n || r.resetCountDown()
            },
            sendOtp: function() {
                var n = this;
                $(".wait-message").show(), n.showOTPLoading(!0), n.handleOTPTimeout();
                var i = {
                    bankAccount: $("#bankNo").val().replace(/\s+/g, ""),
                    mobileNo: $("#mobileNo").val(),
                    sid: s,
                    productId: r,
                    authAmount: $(".quickPayAmount").data("authPay")
                };
                $.ajax({
                    type: "POST",
                    url: url(t.otp),
                    data: i,
                    dataType: "json",
                    success: function(t) {
                        n._otpResponse = t.retCode, t.retCode == e.OTP_RESPONSE.SUCCESS ? (setTimeout(function() {
                            n._bankQueryResponse === "" && (n._bankQueryResponse = e.TIMEOUT, n.showOTPLoading(!1), n.showInputError(e.QUICKPAY_ERROR_CODE.OTHERS.SELECTOR, e.QUICKPAY_ERROR_CODE.OTHERS.MSG))
                        }, 5e3), n.queryBank(t.responseNo), $("#bankCodeName").val(t.bankName)) : t.retCode == e.OTP_RESPONSE.BANK_MAINTAIN ? (n.showOTPLoading(!1), n.showInputError(e.QUICKPAY_ERROR_CODE[t.retCode].SELECTOR, "因" + t.reason + "，该期间暂不支持该银行快捷支付")) : t.retCode == e.OTP_RESPONSE.BANK_USED ? (n.showOTPLoading(!1), n.showInputError(e.QUICKPAY_ERROR_CODE[t.retCode].SELECTOR, e.QUICKPAY_ERROR_CODE[t.retCode].MSG)) : n.updateResult(t.retCode)
                    }
                })
            },
            queryBank: function(n) {
                var r = this;
                $.getJSON(url(t.bindBank), {
                    responseNo: n
                }, function(t) {
                    t.status == e.QUICKPAY_BANK_RESPONSE_STATUS.INPROGRESS ? r._bankQueryResponse != e.TIMEOUT && setTimeout(function() {
                        r.queryBank(n)
                    }, 500) : (r._bankQueryResponse = t.status, t.status == e.QUICKPAY_BANK_RESPONSE_STATUS.FAILURE ? r.updateResult(t.authResultCode) : (r.showOTPLoading(!1), $(".quickpay-form").data("responseNo", n), r.handleOTPSuccess()))
                })
            },
            sendTradeResult: function(n) {
                var r = this,
                    i = $.Deferred();
                return p ? $.getJSON(url(t.tradeResult), {
                    trxId: n
                }, function(t) {
                    if (t.retMessage == e.QUICKPAY_TRADE_RESULT.SUCCESS) r._tradeResponse = t.retMessage, i.resolve({
                        success: !0,
                        isQuickPay: !0
                    });
                    else if (t.retMessage == e.QUICKPAY_TRADE_RESULT.FAIL) {
                        r._tradeResponse = t.retMessage;
                        if (e.QUICKPAY_ERROR_CODE[t.retCode]) {
                            r.updateResult(t.retCode);
                            return
                        }
                        r.goToErrorPage(e.OTP_RESPONSE.USER_NOT_SUPPORT)
                    } else setTimeout(function() {
                        r.sendTradeResult(n)
                    }, 500)
                }) : i.resolve({
                    success: !0
                }), i
            },
            handleOTPTimeout: function() {
                var e = this;
                setTimeout(function() {
                    e._otpResponse === "" && lufax.popup.newIconPopup({
                        popupTitleName: "提示",
                        message: "系统异常，建议您重新尝试",
                        button: '<a class="btns btn_info confirmBtn" href="javascript:void(0);">确认</a>',
                        onConfirm: function() {
                            e.showOTPLoading(), e.resetCountDown()
                        },
                        onClose: function() {
                            e.showOTPLoading(), e.resetCountDown()
                        }
                    })
                }, 3e3)
            },
            handleOTPSuccess: function() {
                var e = this,
                    t = e.INPUTS_TO_VALIDATE;
                for (var n = 0; n < t.length; n++) {
                    var r = $(t[n]),
                        i = r.closest(".controls"),
                        s = r.val(),
                        o = "";
                    r.data("isValid", !0), i.find(".input-wrap, .errorPanel").hide(), t[n] == "#mobileNo" ? (o = s.replace(/^(\d{3})(\d*)(\d{4})$/, function(e, t, n, r) {
                        return t + n.replace(/\d/g, "*") + r
                    }), $(".mobile-mask").html(o)) : t[n] == "#bankNo" && (o = $("#bankCodeName").val() + "(尾号" + s.substr(-4) + ")"), i.find(".valid-info").show().find(".valid-text").html(o)
                }
                $(".quickpay-form .correct-icon").show(), $(".message-sent").show()
            },
            showOTPLoading: function(e) {
                e ? $(".wait-message").show() : $(".wait-message").hide()
            },
            goToErrorPage: function(e) {
                $("#error-code").val(e), $("#result-error").submit()
            }
        };
    $(function() {
        function e() {
            checkSteps(s, r, i, "OTP", a)
        }

        function a() {
            function e() {
                g.onSuccess($("#tradeCode").val(), p ? "" : $(".inputValid").val())
            }
            p ? m.registerEvents() : g.changeCaptcha(), g.showPaymentInfo(r), g.focusAndBlur(), g.activeCoin(), $(".list_main dd:odd").css("background", "#fef9f1"), !c && (u == "1" || o != 1) && $(".tab_lucoin").click(function() {
                $(".list_main").is(":visible") ? g.listHide() : g.listShow()
            }), $(".inputValid").blur(function() {
                var e = $(this).val().replace(/^\s+|\s+$/g, "");
                e !== "" && $.ajax({
                    url: url(t.captchaCheck),
                    data: {
                        captcha: e,
                        sid: s,
                        imgId: $(".validNum").attr("data-image-id")
                    },
                    async: !1,
                    dataType: "json",
                    success: function(e) {
                        e.result == "SUCCESS" ? (g.updateCaptchaStatus(!0), g.removeError(".inputValid"), $("#inputValid").data("isValid", !0)) : (g.updateCaptchaStatus(!1), g.showError(".inputValid", "验证码错误。"), $("#inputValid").data("isValid", !1), g.changeCaptcha())
                    },
                    error: errorHandler()
                })
            }), $(".tradeCode").blur(function() {
                $("#pwd-tip").hide()
            }), $(".tradeCode, .inputValid").focus(function() {
                g.removeError(this), $(this).is(".tradeCode") && $("#pwd-tip").show(), $(this).is(".inputValid") && g.updateCaptchaStatus()
            }), $(".changeValidNum,.validNum").click(function() {
                $(".inputValid").val(""), g.removeError(".validNum"), g.updateCaptchaStatus(), g.changeCaptcha()
            }), $(".validBtn").click(function() {
                if ($(".overCount-status").val() == 1 || p && !m.validateForm(d, !0)) return !1;
                $(this).addClass("disabled").removeClass("validBtn").text("提交并支付中"), g.removeError("#validBtn"), p || $(".inputValid").blur();
                var t = f && $(".payment-bank").is(".is-show"),
                    i = f || p ? document.getElementById("payment-bank-check").checked : !0;
                if (g.validateInvestForm() && n && (!t || i) && (!p || i)) {
                    $(this).after('<span class="processing"/>');
                    var o = l >= $("#totalAmount").val() || l >= $("#validBtn").data("payAmount");
                    !c && (o || f && $(".payment-bank").is(".is-show")) && $("input[name='coinNum']:checked").length === 0 && $("#coinSize").val() != "0" ? lufax.popup.newIconPopup({
                        popupTitleName: "提醒",
                        iconClass: "prompt-popup-icon",
                        message: "您当前有可使用的陆金币还未使用，请确认是否继续支付？",
                        button: "<a class='btns btn-info confirmBtn' href='javascript:void(0);'>确认支付</a><a class='btns btn-cancel ml20 close' href='javascript:void(0);'>使用陆金币抵扣</a>",
                        onClose: function() {
                            window.location.reload()
                        },
                        onConfirm: function() {
                            sendSteps(s, r, "OTP", e)
                        }
                    }) : sendSteps(s, r, "OTP", e)
                } else $("#validBtn").removeClass("disabled").addClass("validBtn").text("提交并支付"), p || $(".inputValid").blur(), $(".tradeCode").blur(), (t || p) && g.showBankAcceptError(i)
            }), $("#link-contract").click(function() {
                var e = new Date,
                    t = e.getFullYear() + "年" + (e.getMonth() + 1) + "月" + e.getDate() + "日";
                $("#recharge-date").val(t), $("#recharge-contract").submit()
            }), $(".inputValid").on({
                keydown: function(e) {
                    e.keyCode === 13 && ($(this).blur(), $(".validBtn").click())
                }
            })
        }
        checkStatus(r, e);
        var h = !0;
        $(".analyze-tradeCode").focusin(function() {
            if (h) {
                var e = (new Date).getTime();
                lufax.statistic.send({
                    "data-sk": "投资流程-陆金币",
                    "data-type": "first-focus",
                    time: e
                }), h = !1
            }
        })
    });
    var g = {
        listShow: function() {
            $(".tab_lucoin").find("i").addClass("hid"), $(".lucoin_status").show()
        },
        listHide: function() {
            $(".tab_lucoin").find("i").removeClass("hid"), $(".lucoin_status").hide()
        },
        focusAndBlur: function() {
            $(".input-wrap .inputs").live({
                focus: function() {
                    $(this).parent().addClass("focus-form")
                },
                blur: function() {
                    $(this).parent().removeClass("focus-form")
                }
            })
        },
        showError: function(e, t) {
            $(e).parents(".controls").find(".errorContent").html(t).end().find(".errorPanel").css("display", "inline-block"), $(e).closest(".input-wrap").addClass("error")
        },
        removeError: function(e) {
            $(e).parents(".controls").find(".errorContent").empty().end().find(".errorPanel").hide(), $(e).closest(".input-wrap").removeClass("error")
        },
        updateCaptchaStatus: function(e, t) {
            var n = $("#captchaIcon");
            e === t ? n.removeClass("failureCircleIcon correctCircleIcon") : e ? n.removeClass("failureCircleIcon").addClass("correctCircleIcon") : n.removeClass("correctCircleIcon").addClass("failureCircleIcon")
        },
        changeCaptcha: function() {
            var e = $(".validNum"),
                n = e.attr("data-resource-uri");
            e.attr("src", "");
            var i = "";
            $.post(t.createCaptcha, {
                sid: s,
                productId: r
            }, function(t) {
                t.retCode === "00" ? (i = t.imageId, $(".validNum").attr("data-image-id", i), e.attr("src", n + "&imageId=" + i + "&_=" + (new Date).getTime())) : t.retCode === "01" ? popupForCancelError() : t.retCode === "02" && (window.location.href = url("step-error"))
            }), $("#inputValid").data("isValid", !1)
        },
        lockedPrompt: function(t) {
            lufax.popup.newIconPopup({
                popupTitleName: "安全提示",
                message: "由于您" + t.lockRange + "小时内连续输错" + t.maxErrorTime + "次交易密码，为了保障您的账户安全，" + t.lockHours + "小时内无法进行任何交易操作。如有疑问请咨询客服4008-6666-18",
                iconClass: "prompt-popup-icon",
                button: '<a class="btns btn_info confirmBtn" href="javascript:void(0);">查看我的账户</a>',
                closeDisplay: "false",
                onConfirm: function() {
                    window.location.href = e.HOST_URL.MY + "/account"
                },
                onClose: function() {
                    window.location.reload()
                }
            })
        },
        popInsufficientBalance: function(e, t) {
            var n = t ? "<p class='pop-insufficient-balance-recharge'>" + t + "</p>" : "";
            lufax.popup.newIconPopup({
                popupTitleName: "提醒",
                message: "您的金额（包含已使用的陆金币）不足，暂不能投资该项目" + n + "<p class='pop-insufficient-balance-recharge'>需充值金额：<span class='amount'>" + lufax.NumFormat.numberFormatWithoutCurrency(e.rechargeAmount) + "</span> 元</p>",
                iconClass: "prompt-popup-icon",
                button: '<a class="btns btn-info confirmBtn" href="javascript:void(0);">充值</a>&emsp;或&emsp;<a class="btns btn-cancel close cancleBtn" href="javascript:void(0);">使用陆金币抵扣</a>',
                closeDisplay: "true",
                onConfirm: function() {
                    window.open("//cashier." + location.hostname.split(".").slice(location.hostname.split(".").length - 2).join(".") + "/cashier/recharge?amount=" + e.rechargeAmount), window.location.reload()
                },
                onCancel: function() {
                    window.location.reload()
                },
                onClose: function() {
                    window.location.reload()
                }
            })
        },
        generateCoinString: function() {
            var e = "";
            return $("input[name=coinNum]").each(function() {
                $(this).prop("checked") && (e.length === 0 ? e += $(this).attr("data-coin-num") : e = e + "|" + $(this).attr("data-coin-num"))
            }), e
        },
        onSuccess: function(e, t) {
            var n = g.generateCoinString(),
                o = $(".payment-bank").length > 0 ? $(".payment-bank").is(".is-show") : !1,
                u = {
                    productId: r,
                    password: g.encryptPwd(e),
                    captcha: t,
                    sid: s,
                    source: "0",
                    coinString: n,
                    imgId: $(".validNum").attr("data-image-id"),
                    needWithholding: o,
                    paymentMethod: h
                };
            p && $.extend(u, {
                bankAccount: document.getElementById("bankNo").value.replace(/\s+/g, ""),
                bankMobileNo: document.getElementById("mobileNo").value,
                validCode: document.getElementById("otpNo").value,
                responseNo: $(".quickpay-form").data("responseNo")
            }), $.ajax({
                type: "POST",
                url: url("users/" + i + "/investment-request"),
                data: u,
                dataType: "json",
                success: function(e) {
                    switch (e.code) {
                        case "02":
                            g.popInsufficientBalance(e);
                            break;
                        case "17":
                            $("#pwd-tip").hide(), g.showError(".tradeCode", e.message), $("#validBtn").removeClass("disabled").addClass("validBtn").text("支付并提交"), $(".blockUI").remove();
                            break;
                        case "18":
                            g.lockedPrompt(e);
                            break;
                        case "38":
                            g.popInsufficientBalance(e, "您当前的投资金额暂时无法支持实时代扣，建议您先充值再投资");
                            break;
                        case "39":
                            g.popInsufficientBalance(e, "由于您当前有多笔项目处于实时代扣中，投资该笔项目需要先进行充值");
                            break;
                        case "40":
                            g.popInsufficientBalance(e, "由于您当前的银行卡暂时无法支持实时代扣，建议您先充值再投资");
                            break;
                        case "41":
                            g.popInsufficientBalance(e, "由于您当前的银行卡暂时无法支持实时代扣，建议您先充值再投资");
                            break;
                        default:
                            p && setTimeout(function() {
                                m._tradeResponse === "" && g.submitResult(e)
                            }, 5e3), m.sendTradeResult(e.trxId).done(function(t) {
                                t && t.success && g.submitResult(e)
                            })
                    }
                }
            })
        },
        submitResult: function(e) {
            $("#resultCode").val(e.code), $("#trxId").val(e.trxId), $("#investmentRequestId").val(e.investmentRequestId), $("#rechargeAmount").val(e.rechargeAmount), $("#riskLevelDesc").val(e.riskLevelDesc), $("#productRiskLevelDesc").val(e.productRiskLevelDesc), $("#needWithholding").val(e.needWithholding), $("#withholdingAmount").val(e.withholdingAmount), $("#result").submit()
        },
        encryptPwd: function(e) {
            var t = "BE24E372DC1B329633A6A014A7C02797915E3C363DD6EE119377BD645329B7E6446B4A71AC5F878EBC870C6D8BFD3C06B92E6C6E93390B34192A7A9E430800091761473FAC2CC0A68A828B2589A8CB729C19161E8E27F4C0F3CDE9701FAFE48D2B65947799072AFA6A3F2D7BDBEF8B6D7429C2D115A3E5F723467D57B3AC6967",
                n = new RSAKey;
            return n.setPublic(t, "10001"), n.encrypt(e)
        },
        showCheckBox: function() {
            $(".form_checkbox").each(function() {
                $(this).find("a").length <= 0 && $(this).prepend("<a></a>")
            })
        },
        changeCoinAmount: function() {
            var e = 0,
                t = 0,
                r = $("#totalAmount").val(),
                i = r;
            $("input[name='coinNum']").each(function() {
                $(this).prop("checked") && (t += Number($(this).attr("data-coin-amount")), e += 1)
            }), e > 100 ? ($(".overCount-status").val(1), $(".overCount").show()) : ($(".overCount-status").val(0), $(".overCount").hide());
            if (o == "1") {
                var s = $("#maxCoinUseAmount").val(),
                    u = s - t;
                u < 0 ? (i = Number(r) - s, $(".payAmount").text(lufax.NumFormat.numberFormatWithoutCurrency(i)), $(".coinAmount").text(lufax.NumFormat.numberFormatWithoutCurrency(s)), $("#canUserCoin").text(lufax.NumFormat.numberFormatWithoutCurrency(0)), $(".errorTips").show()) : ($("input[name='coinNum']").not("input:checked").attr("disabled", !0), i = Number(r) - t, $(".payAmount").text(lufax.NumFormat.numberFormatWithoutCurrency(i)), $(".coinAmount").text(lufax.NumFormat.numberFormatWithoutCurrency(t)), $("#canUserCoin").text(lufax.NumFormat.numberFormatWithoutCurrency(u)), $(".errorTips").hide()), u <= 0 ? $("input[name='coinNum']").not("input:checked").attr("disabled", !0) : $("input[name='coinNum']").not("input:checked").attr("disabled", !1)
            } else i = Number(r) - t, $(".payAmount").text(lufax.NumFormat.numberFormatWithoutCurrency(i)), $(".coinAmount").text(lufax.NumFormat.numberFormatWithoutCurrency(t)), t >= r ? (n = !1, $(".errorTips").show()) : (n = !0, $(".errorTips").hide());
            $("#coinCount").text(e);
            var a = Number(i - l).toFixed(2);
            $(".quickPayAmount").text(lufax.NumFormat.numberFormatWithoutCurrency(a)).data("authPay", a);
            var c = i >= l ? l : i;
            $("#balance-pay").text(lufax.NumFormat.numberFormatWithoutCurrency(c));
            if (f && l < i) {
                $(".payment-bank").is(".is-show") || $(".payment-bank").addClass("is-show"), $(".payment-balance-lack").hide(), $(".payment-balance-enough").show();
                var h = i - c;
                $("#bank-pay").text(lufax.NumFormat.numberFormatWithoutCurrency(h))
            } else l < i ? ($(".payment-balance-lack").show(), $(".payment-balance-enough").hide()) : ($(".payment-bank").removeClass("is-show"), g.removeError("#validBtn"), $(".payment-balance-lack").hide(), $(".payment-balance-enough").show())
        },
        bindCoinMutual: function() {
            $("input[name='coinNum']").click(function() {
                g.changeCoinAmount()
            })
        },
        showPaymentInfo: function() {
            g.bindCoinMutual()
        },
        activeCoin: function() {
            var e = lufax.com.ActivationLufaxCoin;
            $("#active-coin").click(function() {
                e.pop()
            }), e.onSuccess = function(e) {
                var t = "";
                $.getJSON(url("service/trade/match-current-product"), {
                    productId: r,
                    coinNum: e.LufaCoin_code,
                    investAmount: $("#totalAmount").val(),
                    source: "0"
                }, function(n) {
                    n.result || (t = '<p class="LC-limited">因使用规则的限制，不能用于本次投资。</p>'), $.getJSON(url("service/trade/get-coin-rule"), {
                        coinNum: e.LufaCoin_code
                    }, function(n) {
                        e.LufaCoin_code && lufax.popup.blankPopup({
                            content: '<div class="modal-content lufaxCoin-content"><div class="modal-header clearfix"><div class="close"><a class="modal-close" href="javascript:;"></a></div><h4 class="modal-title">激活陆金币</h4></div><div class="modal-body"><p><i class="icon correctCircleIcon">&nbsp;</i><span class="message">您已成功激活一张编号为<span class="active-code">' + e.LufaCoin_code + "</span>的陆金币。</span></p>" + t + '<table class="table-rules">' + "<tr>" + '<td class="table-name">使用规则</td>' + '<td class="table-value">' + n.ruleDescription + "</td>" + "</tr>" + "<tr>" + '<td class="table-name">有效期</td>' + '<td class="table-value">' + n.validTime + "</td>" + "</tr>" + "</table>" + "</div>" + '<div class="modal-footer"><a class="btns btn-info close confirmBtn" target="_self" href="javascript:;">确定</a></div>' + "</div>",
                            onConfirm: function() {
                                window.location.reload()
                            }
                        })
                    })
                })
            }
        },
        showBankAcceptError: function(e) {
            e ? this.removeError("#validBtn") : this.showError("#validBtn", "银行卡支付需要先勾选同意《充值代扣协议》")
        },
        validateInvestForm: function() {
            var e = this,
                t = !0,
                n = ["#tradeCode"];
            p || n.push("#inputValid");
            for (var r = n.length - 1; r >= 0; r--) e.validateInvestInput(n[r]) || (t = !1);
            return t && (p ? !0 : $("#inputValid").data("isValid"))
        },
        validateInvestInput: function(e) {
            var t = $(e),
                n = t.val().replace(/^\s+|\s+$/g, "");
            return n === "" ? (g.showError(e, "请填写" + t.data("label")), !1) : (g.removeError(e), !0)
        }
    }
}), define("securityValid/main/securityValid", function() {});

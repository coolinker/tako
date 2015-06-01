

// define(function(a, b, c) {
//     console.log("a", a)
//     console.log("b", b);
//     console.log("c", c)
//     var d = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDMO0o8vYsqInbD/8uraIdWqP8Y\ncc7KQuLS7w0VbCWocyMRYu582LwzycBOPvbbEKt2feqpUKQ+F3peq+HQnI6gL9d6\n6l0ZG3KjflZTQJ8M847USfUNGVbAi3PJG/NiwQHddUUudmjIEAXwadelp/g+/p97\nYcBAz8caQDcEyI0AjQIDAQAB\n-----END PUBLIC KEY-----;";
//     c.exports = d
// });
 define(function(a, b, c) {
    function d() {
        function a(a) {
            a || (a = 8);
            for (var b = new Array(a), c = [], d = 0; 256 > d; d++) c[d] = d;
            for (d = 0; d < b.length; d++) b[d] = c[Math.floor(Math.random() * c.length)];
            return b
        }
        this.setDefaults = function() {
            this.params.nBits = 256, this.params.salt = a(8), this.params.salt = pidCryptUtil.byteArray2String(this.params.salt), this.params.salt = pidCryptUtil.convertToHex(this.params.salt), this.params.blockSize = 16, this.params.UTF8 = !0, this.params.A0_PAD = !0
        }, this.debug = !0, this.params = {}, this.params.dataIn = "", this.params.dataOut = "", this.params.decryptIn = "", this.params.decryptOut = "", this.params.encryptIn = "", this.params.encryptOut = "", this.params.key = "", this.params.iv = "", this.params.clear = !0, this.setDefaults(), this.errors = "", this.warnings = "", this.infos = "", this.debugMsg = "", this.setParams = function(a) {
            a || (a = {});
            for (var b in a) this.params[b] = a[b]
        }, this.getParams = function() {
            return this.params
        }, this.getParam = function(a) {
            return this.params[a] || ""
        }, this.clearParams = function() {
            this.params = {}
        }, this.getNBits = function() {
            return this.params.nBits
        }, this.getOutput = function() {
            return this.params.dataOut
        }, this.setError = function(a) {
            this.error = a
        }, this.appendError = function(a) {
            return this.errors += a, ""
        }, this.getErrors = function() {
            return this.errors
        }, this.isError = function() {
            return this.errors.length > 0 ? !0 : !1
        }, this.appendInfo = function(a) {
            return this.infos += a, ""
        }, this.getInfos = function() {
            return this.infos
        }, this.setDebug = function(a) {
            this.debug = a
        }, this.appendDebug = function(a) {
            return this.debugMsg += a, ""
        }, this.isDebug = function() {
            return this.debug
        }, this.getAllMessages = function(a) {
            var b = {
                lf: "\n",
                clr_mes: !1,
                verbose: 15
            };
            a || (a = b);
            for (var c in b) "undefined" == typeof a[c] && (a[c] = b[c]);
            var d = "",
                e = "";
            for (var f in this.params) {
                switch (f) {
                    case "encryptOut":
                        e = pidCryptUtil.toByteArray(this.params[f].toString()), e = pidCryptUtil.fragment(e.join(), 64, a.lf);
                        break;
                    case "key":
                    case "iv":
                        e = pidCryptUtil.formatHex(this.params[f], 48);
                        break;
                    default:
                        e = pidCryptUtil.fragment(this.params[f].toString(), 64, a.lf)
                }
                d += "<p><b>" + f + "</b>:<pre>" + e + "</pre></p>"
            }
            return this.debug && (d += "debug: " + this.debug + a.lf), this.errors.length > 0 && 1 == (1 & a.verbose) && (d += "Errors:" + a.lf + this.errors + a.lf), this.warnings.length > 0 && 2 == (2 & a.verbose) && (d += "Warnings:" + a.lf + this.warnings + a.lf), this.infos.length > 0 && 4 == (4 & a.verbose) && (d += "Infos:" + a.lf + this.infos + a.lf), this.debug && 8 == (8 & a.verbose) && (d += "Debug messages:" + a.lf + this.debugMsg + a.lf), a.clr_mes && (this.errors = this.infos = this.warnings = this.debug = ""), d
        }, this.getRandomBytes = function(b) {
            return a(b)
        }
    }

    function e(a, b) {
        a instanceof e ? (this.enc = a.enc, this.pos = a.pos) : (this.enc = a, this.pos = b)
    }

    function f(a, b, c) {
        null != a && ("number" == typeof a ? this.fromNumber(a, b, c) : null == b && "string" != typeof a ? this.fromString(a, 256) : this.fromString(a, b))
    }

    function g() {
        return new f(null)
    }

    function h(a, b, c, d, e, f) {
        for (; --f >= 0;) {
            var g = b * this[a++] + c[d] + e;
            e = Math.floor(g / 67108864), c[d++] = 67108863 & g
        }
        return e
    }

    function i(a, b, c, d, e, f) {
        for (var g = 32767 & b, h = b >> 15; --f >= 0;) {
            var i = 32767 & this[a],
                j = this[a++] >> 15,
                k = h * i + j * g;
            i = g * i + ((32767 & k) << 15) + c[d] + (1073741823 & e), e = (i >>> 30) + (k >>> 15) + h * j + (e >>> 30), c[d++] = 1073741823 & i
        }
        return e
    }

    function j(a, b, c, d, e, f) {
        for (var g = 16383 & b, h = b >> 14; --f >= 0;) {
            var i = 16383 & this[a],
                j = this[a++] >> 14,
                k = h * i + j * g;
            i = g * i + ((16383 & k) << 14) + c[d] + e, e = (i >> 28) + (k >> 14) + h * j, c[d++] = 268435455 & i
        }
        return e
    }

    function k(a) {
        return tc.charAt(a)
    }

    function l(a, b) {
        var c = uc[a.charCodeAt(b)];
        return null == c ? -1 : c
    }

    function m(a) {
        for (var b = this.t - 1; b >= 0; --b) a[b] = this[b];
        a.t = this.t, a.s = this.s
    }

    function n(a) {
        this.t = 1, this.s = 0 > a ? -1 : 0, a > 0 ? this[0] = a : -1 > a ? this[0] = a + DV : this.t = 0
    }

    function o(a) {
        var b = g();
        return b.fromInt(a), b
    }

    function p(a, b) {
        var c;
        if (16 == b) c = 4;
        else if (8 == b) c = 3;
        else if (256 == b) c = 8;
        else if (2 == b) c = 1;
        else if (32 == b) c = 5;
        else {
            if (4 != b) return void this.fromRadix(a, b);
            c = 2
        }
        this.t = 0, this.s = 0;
        for (var d = a.length, e = !1, g = 0; --d >= 0;) {
            var h = 8 == c ? 255 & a[d] : l(a, d);
            0 > h ? "-" == a.charAt(d) && (e = !0) : (e = !1, 0 == g ? this[this.t++] = h : g + c > this.DB ? (this[this.t - 1] |= (h & (1 << this.DB - g) - 1) << g, this[this.t++] = h >> this.DB - g) : this[this.t - 1] |= h << g, g += c, g >= this.DB && (g -= this.DB))
        }
        8 == c && 0 != (128 & a[0]) && (this.s = -1, g > 0 && (this[this.t - 1] |= (1 << this.DB - g) - 1 << g)), this.clamp(), e && f.ZERO.subTo(this, this)
    }

    function q() {
        for (var a = this.s & this.DM; this.t > 0 && this[this.t - 1] == a;) --this.t
    }

    function r(a) {
        if (this.s < 0) return "-" + this.negate().toString(a);
        var b;
        if (16 == a) b = 4;
        else if (8 == a) b = 3;
        else if (2 == a) b = 1;
        else if (32 == a) b = 5;
        else {
            if (4 != a) return this.toRadix(a);
            b = 2
        }
        var c, d = (1 << b) - 1,
            e = !1,
            f = "",
            g = this.t,
            h = this.DB - g * this.DB % b;
        if (g-- > 0)
            for (h < this.DB && (c = this[g] >> h) > 0 && (e = !0, f = k(c)); g >= 0;) b > h ? (c = (this[g] & (1 << h) - 1) << b - h, c |= this[--g] >> (h += this.DB - b)) : (c = this[g] >> (h -= b) & d, 0 >= h && (h += this.DB, --g)), c > 0 && (e = !0), e && (f += k(c));
        return e ? f : "0"
    }

    function s() {
        var a = g();
        return f.ZERO.subTo(this, a), a
    }

    function t() {
        return this.s < 0 ? this.negate() : this
    }

    function u(a) {
        var b = this.s - a.s;
        if (0 != b) return b;
        var c = this.t;
        if (b = c - a.t, 0 != b) return b;
        for (; --c >= 0;)
            if (0 != (b = this[c] - a[c])) return b;
        return 0
    }

    function v(a) {
        var b, c = 1;
        return 0 != (b = a >>> 16) && (a = b, c += 16), 0 != (b = a >> 8) && (a = b, c += 8), 0 != (b = a >> 4) && (a = b, c += 4), 0 != (b = a >> 2) && (a = b, c += 2), 0 != (b = a >> 1) && (a = b, c += 1), c
    }

    function w() {
        return this.t <= 0 ? 0 : this.DB * (this.t - 1) + v(this[this.t - 1] ^ this.s & this.DM)
    }

    function x(a, b) {
        var c;
        for (c = this.t - 1; c >= 0; --c) b[c + a] = this[c];
        for (c = a - 1; c >= 0; --c) b[c] = 0;
        b.t = this.t + a, b.s = this.s
    }

    function y(a, b) {
        for (var c = a; c < this.t; ++c) b[c - a] = this[c];
        b.t = Math.max(this.t - a, 0), b.s = this.s
    }

    function z(a, b) {
        var c, d = a % this.DB,
            e = this.DB - d,
            f = (1 << e) - 1,
            g = Math.floor(a / this.DB),
            h = this.s << d & this.DM;
        for (c = this.t - 1; c >= 0; --c) b[c + g + 1] = this[c] >> e | h, h = (this[c] & f) << d;
        for (c = g - 1; c >= 0; --c) b[c] = 0;
        b[g] = h, b.t = this.t + g + 1, b.s = this.s, b.clamp()
    }

    function A(a, b) {
        b.s = this.s;
        var c = Math.floor(a / this.DB);
        if (c >= this.t) return void(b.t = 0);
        var d = a % this.DB,
            e = this.DB - d,
            f = (1 << d) - 1;
        b[0] = this[c] >> d;
        for (var g = c + 1; g < this.t; ++g) b[g - c - 1] |= (this[g] & f) << e, b[g - c] = this[g] >> d;
        d > 0 && (b[this.t - c - 1] |= (this.s & f) << e), b.t = this.t - c, b.clamp()
    }

    function B(a, b) {
        for (var c = 0, d = 0, e = Math.min(a.t, this.t); e > c;) d += this[c] - a[c], b[c++] = d & this.DM, d >>= this.DB;
        if (a.t < this.t) {
            for (d -= a.s; c < this.t;) d += this[c], b[c++] = d & this.DM, d >>= this.DB;
            d += this.s
        } else {
            for (d += this.s; c < a.t;) d -= a[c], b[c++] = d & this.DM, d >>= this.DB;
            d -= a.s
        }
        b.s = 0 > d ? -1 : 0, -1 > d ? b[c++] = this.DV + d : d > 0 && (b[c++] = d), b.t = c, b.clamp()
    }

    function C(a, b) {
        var c = this.abs(),
            d = a.abs(),
            e = c.t;
        for (b.t = e + d.t; --e >= 0;) b[e] = 0;
        for (e = 0; e < d.t; ++e) b[e + c.t] = c.am(0, d[e], b, e, 0, c.t);
        b.s = 0, b.clamp(), this.s != a.s && f.ZERO.subTo(b, b)
    }

    function D(a) {
        for (var b = this.abs(), c = a.t = 2 * b.t; --c >= 0;) a[c] = 0;
        for (c = 0; c < b.t - 1; ++c) {
            var d = b.am(c, b[c], a, 2 * c, 0, 1);
            (a[c + b.t] += b.am(c + 1, 2 * b[c], a, 2 * c + 1, d, b.t - c - 1)) >= b.DV && (a[c + b.t] -= b.DV, a[c + b.t + 1] = 1)
        }
        a.t > 0 && (a[a.t - 1] += b.am(c, b[c], a, 2 * c, 0, 1)), a.s = 0, a.clamp()
    }

    function E(a, b, c) {
        var d = a.abs();
        if (!(d.t <= 0)) {
            var e = this.abs();
            if (e.t < d.t) return null != b && b.fromInt(0), void(null != c && this.copyTo(c));
            null == c && (c = g());
            var h = g(),
                i = this.s,
                j = a.s,
                k = this.DB - v(d[d.t - 1]);
            k > 0 ? (d.lShiftTo(k, h), e.lShiftTo(k, c)) : (d.copyTo(h), e.copyTo(c));
            var l = h.t,
                m = h[l - 1];
            if (0 != m) {
                var n = m * (1 << this.F1) + (l > 1 ? h[l - 2] >> this.F2 : 0),
                    o = this.FV / n,
                    p = (1 << this.F1) / n,
                    q = 1 << this.F2,
                    r = c.t,
                    s = r - l,
                    t = null == b ? g() : b;
                for (h.dlShiftTo(s, t), c.compareTo(t) >= 0 && (c[c.t++] = 1, c.subTo(t, c)), f.ONE.dlShiftTo(l, t), t.subTo(h, h); h.t < l;) h[h.t++] = 0;
                for (; --s >= 0;) {
                    var u = c[--r] == m ? this.DM : Math.floor(c[r] * o + (c[r - 1] + q) * p);
                    if ((c[r] += h.am(0, u, c, s, 0, l)) < u)
                        for (h.dlShiftTo(s, t), c.subTo(t, c); c[r] < --u;) c.subTo(t, c)
                }
                null != b && (c.drShiftTo(l, b), i != j && f.ZERO.subTo(b, b)), c.t = l, c.clamp(), k > 0 && c.rShiftTo(k, c), 0 > i && f.ZERO.subTo(c, c)
            }
        }
    }

    function F(a) {
        var b = g();
        return this.abs().divRemTo(a, null, b), this.s < 0 && b.compareTo(f.ZERO) > 0 && a.subTo(b, b), b
    }

    function G(a) {
        this.m = a
    }

    function H(a) {
        return a.s < 0 || a.compareTo(this.m) >= 0 ? a.mod(this.m) : a
    }

    function I(a) {
        return a
    }

    function J(a) {
        a.divRemTo(this.m, null, a)
    }

    function K(a, b, c) {
        a.multiplyTo(b, c), this.reduce(c)
    }

    function L(a, b) {
        a.squareTo(b), this.reduce(b)
    }

    function M() {
        if (this.t < 1) return 0;
        var a = this[0];
        if (0 == (1 & a)) return 0;
        var b = 3 & a;
        return b = 15 & b * (2 - (15 & a) * b), b = 255 & b * (2 - (255 & a) * b), b = 65535 & b * (2 - (65535 & (65535 & a) * b)), b = b * (2 - a * b % this.DV) % this.DV, b > 0 ? this.DV - b : -b
    }

    function N(a) {
        this.m = a, this.mp = a.invDigit(), this.mpl = 32767 & this.mp, this.mph = this.mp >> 15, this.um = (1 << a.DB - 15) - 1, this.mt2 = 2 * a.t
    }

    function O(a) {
        var b = g();
        return a.abs().dlShiftTo(this.m.t, b), b.divRemTo(this.m, null, b), a.s < 0 && b.compareTo(f.ZERO) > 0 && this.m.subTo(b, b), b
    }

    function P(a) {
        var b = g();
        return a.copyTo(b), this.reduce(b), b
    }

    function Q(a) {
        for (; a.t <= this.mt2;) a[a.t++] = 0;
        for (var b = 0; b < this.m.t; ++b) {
            var c = 32767 & a[b],
                d = c * this.mpl + ((c * this.mph + (a[b] >> 15) * this.mpl & this.um) << 15) & a.DM;
            for (c = b + this.m.t, a[c] += this.m.am(0, d, a, b, 0, this.m.t); a[c] >= a.DV;) a[c] -= a.DV, a[++c]++
        }
        a.clamp(), a.drShiftTo(this.m.t, a), a.compareTo(this.m) >= 0 && a.subTo(this.m, a)
    }

    function R(a, b) {
        a.squareTo(b), this.reduce(b)
    }

    function S(a, b, c) {
        a.multiplyTo(b, c), this.reduce(c)
    }

    function T() {
        return 0 == (this.t > 0 ? 1 & this[0] : this.s)
    }

    function U(a, b) {
        if (a > 4294967295 || 1 > a) return f.ONE;
        var c = g(),
            d = g(),
            e = b.convert(this),
            h = v(a) - 1;
        for (e.copyTo(c); --h >= 0;)
            if (b.sqrTo(c, d), (a & 1 << h) > 0) b.mulTo(d, e, c);
            else {
                var i = c;
                c = d, d = i
            }
        return b.revert(c)
    }

    function V(a, b) {
        var c;
        return c = 256 > a || b.isEven() ? new G(b) : new N(b), this.exp(a, c)
    }

    function W() {
        var a = g();
        return this.copyTo(a), a
    }

    function X() {
        if (this.s < 0) {
            if (1 == this.t) return this[0] - this.DV;
            if (0 == this.t) return -1
        } else {
            if (1 == this.t) return this[0];
            if (0 == this.t) return 0
        }
        return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0]
    }

    function Y() {
        return 0 == this.t ? this.s : this[0] << 24 >> 24
    }

    function Z() {
        return 0 == this.t ? this.s : this[0] << 16 >> 16
    }

    function $(a) {
        return Math.floor(Math.LN2 * this.DB / Math.log(a))
    }

    function _() {
        return this.s < 0 ? -1 : this.t <= 0 || 1 == this.t && this[0] <= 0 ? 0 : 1
    }

    function ab(a) {
        if (null == a && (a = 10), 0 == this.signum() || 2 > a || a > 36) return "0";
        var b = this.chunkSize(a),
            c = Math.pow(a, b),
            d = o(c),
            e = g(),
            f = g(),
            h = "";
        for (this.divRemTo(d, e, f); e.signum() > 0;) h = (c + f.intValue()).toString(a).substr(1) + h, e.divRemTo(d, e, f);
        return f.intValue().toString(a) + h
    }

    function bb(a, b) {
        this.fromInt(0), null == b && (b = 10);
        for (var c = this.chunkSize(b), d = Math.pow(b, c), e = !1, g = 0, h = 0, i = 0; i < a.length; ++i) {
            var j = l(a, i);
            0 > j ? "-" == a.charAt(i) && 0 == this.signum() && (e = !0) : (h = b * h + j, ++g >= c && (this.dMultiply(d), this.dAddOffset(h, 0), g = 0, h = 0))
        }
        g > 0 && (this.dMultiply(Math.pow(b, g)), this.dAddOffset(h, 0)), e && f.ZERO.subTo(this, this)
    }

    function cb(a, b, c) {
        if ("number" == typeof b)
            if (2 > a) this.fromInt(1);
            else
                for (this.fromNumber(a, c), this.testBit(a - 1) || this.bitwiseTo(f.ONE.shiftLeft(a - 1), kb, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(b);) this.dAddOffset(2, 0), this.bitLength() > a && this.subTo(f.ONE.shiftLeft(a - 1), this);
        else {
            var d = new Array,
                e = 7 & a;
            d.length = (a >> 3) + 1, b.nextBytes(d), e > 0 ? d[0] &= (1 << e) - 1 : d[0] = 0, this.fromString(d, 256)
        }
    }

    function db() {
        var a = this.t,
            b = new Array;
        b[0] = this.s;
        var c, d = this.DB - a * this.DB % 8,
            e = 0;
        if (a-- > 0)
            for (d < this.DB && (c = this[a] >> d) != (this.s & this.DM) >> d && (b[e++] = c | this.s << this.DB - d); a >= 0;) 8 > d ? (c = (this[a] & (1 << d) - 1) << 8 - d, c |= this[--a] >> (d += this.DB - 8)) : (c = 255 & this[a] >> (d -= 8), 0 >= d && (d += this.DB, --a)), 0 != (128 & c) && (c |= -256), 0 == e && (128 & this.s) != (128 & c) && ++e, (e > 0 || c != this.s) && (b[e++] = c);
        return b
    }

    function eb(a) {
        return 0 == this.compareTo(a)
    }

    function fb(a) {
        return this.compareTo(a) < 0 ? this : a
    }

    function gb(a) {
        return this.compareTo(a) > 0 ? this : a
    }

    function hb(a, b, c) {
        var d, e, f = Math.min(a.t, this.t);
        for (d = 0; f > d; ++d) c[d] = b(this[d], a[d]);
        if (a.t < this.t) {
            for (e = a.s & this.DM, d = f; d < this.t; ++d) c[d] = b(this[d], e);
            c.t = this.t
        } else {
            for (e = this.s & this.DM, d = f; d < a.t; ++d) c[d] = b(e, a[d]);
            c.t = a.t
        }
        c.s = b(this.s, a.s), c.clamp()
    }

    function ib(a, b) {
        return a & b
    }

    function jb(a) {
        var b = g();
        return this.bitwiseTo(a, ib, b), b
    }

    function kb(a, b) {
        return a | b
    }

    function lb(a) {
        var b = g();
        return this.bitwiseTo(a, kb, b), b
    }

    function mb(a, b) {
        return a ^ b
    }

    function nb(a) {
        var b = g();
        return this.bitwiseTo(a, mb, b), b
    }

    function ob(a, b) {
        return a & ~b
    }

    function pb(a) {
        var b = g();
        return this.bitwiseTo(a, ob, b), b
    }

    function qb() {
        for (var a = g(), b = 0; b < this.t; ++b) a[b] = this.DM & ~this[b];
        return a.t = this.t, a.s = ~this.s, a
    }

    function rb(a) {
        var b = g();
        return 0 > a ? this.rShiftTo(-a, b) : this.lShiftTo(a, b), b
    }

    function sb(a) {
        var b = g();
        return 0 > a ? this.lShiftTo(-a, b) : this.rShiftTo(a, b), b
    }

    function tb(a) {
        if (0 == a) return -1;
        var b = 0;
        return 0 == (65535 & a) && (a >>= 16, b += 16), 0 == (255 & a) && (a >>= 8, b += 8), 0 == (15 & a) && (a >>= 4, b += 4), 0 == (3 & a) && (a >>= 2, b += 2), 0 == (1 & a) && ++b, b
    }

    function ub() {
        for (var a = 0; a < this.t; ++a)
            if (0 != this[a]) return a * this.DB + tb(this[a]);
        return this.s < 0 ? this.t * this.DB : -1
    }

    function vb(a) {
        for (var b = 0; 0 != a;) a &= a - 1, ++b;
        return b
    }

    function wb() {
        for (var a = 0, b = this.s & this.DM, c = 0; c < this.t; ++c) a += vb(this[c] ^ b);
        return a
    }

    function xb(a) {
        var b = Math.floor(a / this.DB);
        return b >= this.t ? 0 != this.s : 0 != (this[b] & 1 << a % this.DB)
    }

    function yb(a, b) {
        var c = f.ONE.shiftLeft(a);
        return this.bitwiseTo(c, b, c), c
    }

    function zb(a) {
        return this.changeBit(a, kb)
    }

    function Ab(a) {
        return this.changeBit(a, ob)
    }

    function Bb(a) {
        return this.changeBit(a, mb)
    }

    function Cb(a, b) {
        for (var c = 0, d = 0, e = Math.min(a.t, this.t); e > c;) d += this[c] + a[c], b[c++] = d & this.DM, d >>= this.DB;
        if (a.t < this.t) {
            for (d += a.s; c < this.t;) d += this[c], b[c++] = d & this.DM, d >>= this.DB;
            d += this.s
        } else {
            for (d += this.s; c < a.t;) d += a[c], b[c++] = d & this.DM, d >>= this.DB;
            d += a.s
        }
        b.s = 0 > d ? -1 : 0, d > 0 ? b[c++] = d : -1 > d && (b[c++] = this.DV + d), b.t = c, b.clamp()
    }

    function Db(a) {
        var b = g();
        return this.addTo(a, b), b
    }

    function Eb(a) {
        var b = g();
        return this.subTo(a, b), b
    }

    function Fb(a) {
        var b = g();
        return this.multiplyTo(a, b), b
    }

    function Gb(a) {
        var b = g();
        return this.divRemTo(a, b, null), b
    }

    function Hb(a) {
        var b = g();
        return this.divRemTo(a, null, b), b
    }

    function Ib(a) {
        var b = g(),
            c = g();
        return this.divRemTo(a, b, c), new Array(b, c)
    }

    function Jb(a) {
        this[this.t] = this.am(0, a - 1, this, 0, 0, this.t), ++this.t, this.clamp()
    }

    function Kb(a, b) {
        for (; this.t <= b;) this[this.t++] = 0;
        for (this[b] += a; this[b] >= this.DV;) this[b] -= this.DV, ++b >= this.t && (this[this.t++] = 0), ++this[b]
    }

    function Lb() {}

    function Mb(a) {
        return a
    }

    function Nb(a, b, c) {
        a.multiplyTo(b, c)
    }

    function Ob(a, b) {
        a.squareTo(b)
    }

    function Pb(a) {
        return this.exp(a, new Lb)
    }

    function Qb(a, b, c) {
        var d = Math.min(this.t + a.t, b);
        for (c.s = 0, c.t = d; d > 0;) c[--d] = 0;
        var e;
        for (e = c.t - this.t; e > d; ++d) c[d + this.t] = this.am(0, a[d], c, d, 0, this.t);
        for (e = Math.min(a.t, b); e > d; ++d) this.am(0, a[d], c, d, 0, b - d);
        c.clamp()
    }

    function Rb(a, b, c) {
        --b;
        var d = c.t = this.t + a.t - b;
        for (c.s = 0; --d >= 0;) c[d] = 0;
        for (d = Math.max(b - this.t, 0); d < a.t; ++d) c[this.t + d - b] = this.am(b - d, a[d], c, 0, 0, this.t + d - b);
        c.clamp(), c.drShiftTo(1, c)
    }

    function Sb(a) {
        this.r2 = g(), this.q3 = g(), f.ONE.dlShiftTo(2 * a.t, this.r2), this.mu = this.r2.divide(a), this.m = a
    }

    function Tb(a) {
        if (a.s < 0 || a.t > 2 * this.m.t) return a.mod(this.m);
        if (a.compareTo(this.m) < 0) return a;
        var b = g();
        return a.copyTo(b), this.reduce(b), b
    }

    function Ub(a) {
        return a
    }

    function Vb(a) {
        for (a.drShiftTo(this.m.t - 1, this.r2), a.t > this.m.t + 1 && (a.t = this.m.t + 1, a.clamp()), this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3), this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); a.compareTo(this.r2) < 0;) a.dAddOffset(1, this.m.t + 1);
        for (a.subTo(this.r2, a); a.compareTo(this.m) >= 0;) a.subTo(this.m, a)
    }

    function Wb(a, b) {
        a.squareTo(b), this.reduce(b)
    }

    function Xb(a, b, c) {
        a.multiplyTo(b, c), this.reduce(c)
    }

    function Yb(a, b) {
        var c, d, e = a.bitLength(),
            f = o(1);
        if (0 >= e) return f;
        c = 18 > e ? 1 : 48 > e ? 3 : 144 > e ? 4 : 768 > e ? 5 : 6, d = 8 > e ? new G(b) : b.isEven() ? new Sb(b) : new N(b);
        var h = new Array,
            i = 3,
            j = c - 1,
            k = (1 << c) - 1;
        if (h[1] = d.convert(this), c > 1) {
            var l = g();
            for (d.sqrTo(h[1], l); k >= i;) h[i] = g(), d.mulTo(l, h[i - 2], h[i]), i += 2
        }
        var m, n, p = a.t - 1,
            q = !0,
            r = g();
        for (e = v(a[p]) - 1; p >= 0;) {
            for (e >= j ? m = a[p] >> e - j & k : (m = (a[p] & (1 << e + 1) - 1) << j - e, p > 0 && (m |= a[p - 1] >> this.DB + e - j)), i = c; 0 == (1 & m);) m >>= 1, --i;
            if ((e -= i) < 0 && (e += this.DB, --p), q) h[m].copyTo(f), q = !1;
            else {
                for (; i > 1;) d.sqrTo(f, r), d.sqrTo(r, f), i -= 2;
                i > 0 ? d.sqrTo(f, r) : (n = f, f = r, r = n), d.mulTo(r, h[m], f)
            }
            for (; p >= 0 && 0 == (a[p] & 1 << e);) d.sqrTo(f, r), n = f, f = r, r = n, --e < 0 && (e = this.DB - 1, --p)
        }
        return d.revert(f)
    }

    function Zb(a) {
        var b = this.s < 0 ? this.negate() : this.clone(),
            c = a.s < 0 ? a.negate() : a.clone();
        if (b.compareTo(c) < 0) {
            var d = b;
            b = c, c = d
        }
        var e = b.getLowestSetBit(),
            f = c.getLowestSetBit();
        if (0 > f) return b;
        for (f > e && (f = e), f > 0 && (b.rShiftTo(f, b), c.rShiftTo(f, c)); b.signum() > 0;)(e = b.getLowestSetBit()) > 0 && b.rShiftTo(e, b), (e = c.getLowestSetBit()) > 0 && c.rShiftTo(e, c), b.compareTo(c) >= 0 ? (b.subTo(c, b), b.rShiftTo(1, b)) : (c.subTo(b, c), c.rShiftTo(1, c));
        return f > 0 && c.lShiftTo(f, c), c
    }

    function $b(a) {
        if (0 >= a) return 0;
        var b = this.DV % a,
            c = this.s < 0 ? a - 1 : 0;
        if (this.t > 0)
            if (0 == b) c = this[0] % a;
            else
                for (var d = this.t - 1; d >= 0; --d) c = (b * c + this[d]) % a;
        return c
    }

    function _b(a) {
        var b = a.isEven();
        if (this.isEven() && b || 0 == a.signum()) return f.ZERO;
        for (var c = a.clone(), d = this.clone(), e = o(1), g = o(0), h = o(0), i = o(1); 0 != c.signum();) {
            for (; c.isEven();) c.rShiftTo(1, c), b ? (e.isEven() && g.isEven() || (e.addTo(this, e), g.subTo(a, g)), e.rShiftTo(1, e)) : g.isEven() || g.subTo(a, g), g.rShiftTo(1, g);
            for (; d.isEven();) d.rShiftTo(1, d), b ? (h.isEven() && i.isEven() || (h.addTo(this, h), i.subTo(a, i)), h.rShiftTo(1, h)) : i.isEven() || i.subTo(a, i), i.rShiftTo(1, i);
            c.compareTo(d) >= 0 ? (c.subTo(d, c), b && e.subTo(h, e), g.subTo(i, g)) : (d.subTo(c, d), b && h.subTo(e, h), i.subTo(g, i))
        }
        return 0 != d.compareTo(f.ONE) ? f.ZERO : i.compareTo(a) >= 0 ? i.subtract(a) : i.signum() < 0 ? (i.addTo(a, i), i.signum() < 0 ? i.add(a) : i) : i
    }

    function ac(a) {
        var b, c = this.abs();
        if (1 == c.t && c[0] <= vc[vc.length - 1]) {
            for (b = 0; b < vc.length; ++b)
                if (c[0] == vc[b]) return !0;
            return !1
        }
        if (c.isEven()) return !1;
        for (b = 1; b < vc.length;) {
            for (var d = vc[b], e = b + 1; e < vc.length && wc > d;) d *= vc[e++];
            for (d = c.modInt(d); e > b;)
                if (0 == d % vc[b++]) return !1
        }
        return c.millerRabin(a)
    }

    function bc(a) {
        var b = this.subtract(f.ONE),
            c = b.getLowestSetBit();
        if (0 >= c) return !1;
        var d = b.shiftRight(c);
        a = a + 1 >> 1, a > vc.length && (a = vc.length);
        for (var e = g(), h = 0; a > h; ++h) {
            e.fromInt(vc[h]);
            var i = e.modPow(d, this);
            if (0 != i.compareTo(f.ONE) && 0 != i.compareTo(b)) {
                for (var j = 1; j++ < c && 0 != i.compareTo(b);)
                    if (i = i.modPowInt(2, this), 0 == i.compareTo(f.ONE)) return !1;
                if (0 != i.compareTo(b)) return !1
            }
        }
        return !0
    }

    function cc() {
        if (this.rng_state, this.rng_pool, this.rng_pptr, this.rng_seed_int = function(a) {
                this.rng_pool[this.rng_pptr++] ^= 255 & a, this.rng_pool[this.rng_pptr++] ^= 255 & a >> 8, this.rng_pool[this.rng_pptr++] ^= 255 & a >> 16, this.rng_pool[this.rng_pptr++] ^= 255 & a >> 24, this.rng_pptr >= xc && (this.rng_pptr -= xc)
            }, this.rng_seed_time = function() {
                this.rng_seed_int((new Date).getTime())
            }, null == this.rng_pool) {
            this.rng_pool = new Array, this.rng_pptr = 0;
            var a;
            // if ("Netscape" == navigator.appName && navigator.appVersion < "5" && window.crypto) {
            //     var b = window.crypto.random(32);
            //     for (a = 0; a < b.length; ++a) this.rng_pool[this.rng_pptr++] = 255 & b.charCodeAt(a)
            // }
            for (; this.rng_pptr < xc;) a = Math.floor(65536 * Math.random()), this.rng_pool[this.rng_pptr++] = a >>> 8, this.rng_pool[this.rng_pptr++] = 255 & a;
            this.rng_pptr = 0, this.rng_seed_time()
        }
        this.rng_get_byte = function() {
            if (null == this.rng_state) {
                for (this.rng_seed_time(), this.rng_state = gc(), this.rng_state.init(this.rng_pool), this.rng_pptr = 0; this.rng_pptr < this.rng_pool.length; ++this.rng_pptr) this.rng_pool[this.rng_pptr] = 0;
                this.rng_pptr = 0
            }
            return this.rng_state.next()
        }, this.nextBytes = function(a) {
            var b;
            for (b = 0; b < a.length; ++b) a[b] = this.rng_get_byte()
        }
    }

    function dc() {
        this.i = 0, this.j = 0, this.S = new Array
    }

    function ec(a) {
        var b, c, d;
        for (b = 0; 256 > b; ++b) this.S[b] = b;
        for (c = 0, b = 0; 256 > b; ++b) c = 255 & c + this.S[b] + a[b % a.length], d = this.S[b], this.S[b] = this.S[c], this.S[c] = d;
        this.i = 0, this.j = 0
    }

    function fc() {
        var a;
        return this.i = 255 & this.i + 1, this.j = 255 & this.j + this.S[this.i], a = this.S[this.i], this.S[this.i] = this.S[this.j], this.S[this.j] = a, this.S[255 & a + this.S[this.i]]
    }

    function gc() {
        return new dc
    }

    function hc(a, b) {
        return new f(a, b)
    }

    function ic(a, b) {
        for (var c = a.toByteArray(), d = 0; d < c.length && 0 == c[d];) ++d;
        if (c.length - d != b - 1 || 2 != c[d]) return null;
        for (++d; 0 != c[d];)
            if (++d >= c.length) return null;
        for (var e = ""; ++d < c.length;) e += String.fromCharCode(c[d]);
        return e
    }

    function jc(a, b) {
        if (b < a.length + 11) return alert("Message too long for RSA"), null;
        for (var c = new Array, d = a.length - 1; d >= 0 && b > 0;) c[--b] = a.charCodeAt(d--);
        c[--b] = 0;
        for (var e = new cc, g = new Array; b > 2;) {
            for (g[0] = 0; 0 == g[0];) e.nextBytes(g);
            c[--b] = g[0]
        }
        return c[--b] = 2, c[--b] = 0, new f(c)
    }

    function kc(a) {
        var b = a.split("\n"),
            c = !1,
            d = !1,
            e = "",
            f = {};
        f.info = "", f.salt = "", f.iv, f.b64 = "", f.aes = !1, f.mode = "", f.bits = 0;
        for (var g = 0; g < b.length; g++) switch (e = b[g].substr(0, 9), 1 == g && "Proc-Type" != e && 0 == e.indexOf("M") && (d = !0), e) {
            case "-----BEGI":
                c = !0;
                break;
            case "Proc-Type":
                c && (f.info = b[g]);
                break;
            case "DEK-Info:":
                if (c) {
                    var h = b[g].split(","),
                        i = h[0].split(": "),
                        j = i[1].split("-");
                    f.aes = "AES" == j[0] ? !0 : !1, f.mode = j[2], f.bits = parseInt(j[1]), f.salt = h[1].substr(0, 16), f.iv = h[1]
                }
                break;
            case "":
                c && (d = !0);
                break;
            case "-----END ":
                c && (d = !1, c = !1);
                break;
            default:
                c && d && (f.b64 += pidCryptUtil.stripLineFeeds(b[g]))
        }
        return f
    }

    function lc(a, publickKey) {
        var b, c = publickKey,
            e = {};
        if (e = kc(c), e.b64) {
            var f = pidCryptUtil.decodeBase64(e.b64),
                g = new d.RSA,
                h = d.ASN1.decode(pidCryptUtil.toByteArray(f)),
                i = h.toHexTree();
            return g.setPublicKeyFromASN(i), b = g.encrypt(a), pidCryptUtil.encodeBase64(pidCryptUtil.convertFromHex(b))
        }
        return "error"
    }
    var mc = a("rsa/rsa.config");
    pidCryptUtil = {}, pidCryptUtil.encodeBase64 = function(a, b) {
        a || (a = "");
        var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        b = "undefined" == typeof b ? !1 : b;
        var d, e, f, g, h, i, j, k, l, m, n, o = [],
            p = "";
        if (m = b ? pidCryptUtil.encodeUTF8(a) : a, l = m.length % 3, l > 0)
            for (; l++ < 3;) p += "=", m += "\x00";
        for (l = 0; l < m.length; l += 3) d = m.charCodeAt(l), e = m.charCodeAt(l + 1), f = m.charCodeAt(l + 2), g = d << 16 | e << 8 | f, h = 63 & g >> 18, i = 63 & g >> 12, j = 63 & g >> 6, k = 63 & g, o[l / 3] = c.charAt(h) + c.charAt(i) + c.charAt(j) + c.charAt(k);
        return n = o.join(""), n = n.slice(0, n.length - p.length) + p
    }, pidCryptUtil.decodeBase64 = function(a, b) {
        a || (a = "");
        var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        b = "undefined" == typeof b ? !1 : b;
        var d, e, f, g, h, i, j, k, l, m, n = [];
        m = b ? pidCryptUtil.decodeUTF8(a) : a;
        for (var o = 0; o < m.length; o += 4) g = c.indexOf(m.charAt(o)), h = c.indexOf(m.charAt(o + 1)), i = c.indexOf(m.charAt(o + 2)), j = c.indexOf(m.charAt(o + 3)), k = g << 18 | h << 12 | i << 6 | j, d = 255 & k >>> 16, e = 255 & k >>> 8, f = 255 & k, n[o / 4] = String.fromCharCode(d, e, f), 64 == j && (n[o / 4] = String.fromCharCode(d, e)), 64 == i && (n[o / 4] = String.fromCharCode(d));
        return l = n.join(""), l = b ? pidCryptUtil.decodeUTF8(l) : l
    }, pidCryptUtil.encodeUTF8 = function(a) {
        return a || (a = ""), a = a.replace(/[\u0080-\u07ff]/g, function(a) {
            var b = a.charCodeAt(0);
            return String.fromCharCode(192 | b >> 6, 128 | 63 & b)
        }), a = a.replace(/[\u0800-\uffff]/g, function(a) {
            var b = a.charCodeAt(0);
            return String.fromCharCode(224 | b >> 12, 128 | 63 & b >> 6, 128 | 63 & b)
        })
    }, pidCryptUtil.decodeUTF8 = function(a) {
        return a || (a = ""), a = a.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function(a) {
            var b = (31 & a.charCodeAt(0)) << 6 | 63 & a.charCodeAt(1);
            return String.fromCharCode(b)
        }), a = a.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, function(a) {
            var b = (15 & a.charCodeAt(0)) << 12 | (63 & a.charCodeAt(1)) << 6 | 63 & a.charCodeAt(2);
            return String.fromCharCode(b)
        })
    }, pidCryptUtil.convertToHex = function(a) {
        a || (a = "");
        for (var b = "", c = "", d = 0; d < a.length; d++) c = a.charCodeAt(d).toString(16), b += 1 == c.length ? "0" + c : c;
        return b
    }, pidCryptUtil.convertFromHex = function(a) {
        a || (a = "");
        for (var b = "", c = 0; c < a.length; c += 2) b += String.fromCharCode(parseInt(a.substring(c, c + 2), 16));
        return b
    }, pidCryptUtil.stripLineFeeds = function(a) {
        a || (a = "");
        var b = "";
        return b = a.replace(/\n/g, ""), b = b.replace(/\r/g, "")
    }, pidCryptUtil.toByteArray = function(a) {
        a || (a = "");
        for (var b = [], c = 0; c < a.length; c++) b[c] = a.charCodeAt(c);
        return b
    }, pidCryptUtil.fragment = function(a, b, c) {
        if (a || (a = ""), !b || b >= a.length) return a;
        c || (c = "\n");
        for (var d = "", e = 0; e < a.length; e += b) d += a.substr(e, b) + c;
        return d
    }, pidCryptUtil.formatHex = function(a, b) {
        a || (a = ""), b || (b = 45);
        for (var c = "", d = a.toLowerCase(), e = 0; e < d.length; e += 2) c += d.substr(e, 2) + ":";
        return d = this.fragment(c, b)
    }, pidCryptUtil.byteArray2String = function(a) {
        for (var b = "", c = 0; c < a.length; c++) b += String.fromCharCode(a[c]);
        return b
    }, e.prototype.parseStringHex = function(a, b) {
        "undefined" == typeof b && (b = this.enc.length);
        for (var c = "", d = a; b > d; ++d) {
            var e = this.get(d);
            c += this.hexDigits.charAt(e >> 4) + this.hexDigits.charAt(15 & e)
        }
        return c
    }, e.prototype.get = function(a) {
        if (void 0 == a && (a = this.pos++), a >= this.enc.length) throw "Requesting byte offset " + a + " on a stream of length " + this.enc.length;
        return this.enc[a]
    }, e.prototype.hexDigits = "0123456789ABCDEF", e.prototype.hexDump = function(a, b) {
        for (var c = "", d = a; b > d; ++d) {
            var e = this.get(d);
            c += this.hexDigits.charAt(e >> 4) + this.hexDigits.charAt(15 & e), 7 == (15 & d) && (c += " "), c += 15 == (15 & d) ? "\n" : " "
        }
        return c
    }, e.prototype.parseStringISO = function(a, b) {
        for (var c = "", d = a; b > d; ++d) c += String.fromCharCode(this.get(d));
        return c
    }, e.prototype.parseStringUTF = function(a, b) {
        for (var c = "", d = 0, e = a; b > e;) {
            var d = this.get(e++);
            c += String.fromCharCode(128 > d ? d : d > 191 && 224 > d ? (31 & d) << 6 | 63 & this.get(e++) : (15 & d) << 12 | (63 & this.get(e++)) << 6 | 63 & this.get(e++))
        }
        return c
    }, e.prototype.reTime = /^((?:1[89]|2\d)?\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/, e.prototype.parseTime = function(a, b) {
        var c = this.parseStringISO(a, b),
            d = this.reTime.exec(c);
        return d ? (c = d[1] + "-" + d[2] + "-" + d[3] + " " + d[4], d[5] && (c += ":" + d[5], d[6] && (c += ":" + d[6], d[7] && (c += "." + d[7]))), d[8] && (c += " UTC", "Z" != d[8] && (c += d[8], d[9] && (c += ":" + d[9]))), c) : "Unrecognized time: " + c
    }, e.prototype.parseInteger = function(a, b) {
        if (b - a > 4) return void 0;
        for (var c = 0, d = a; b > d; ++d) c = c << 8 | this.get(d);
        return c
    }, e.prototype.parseOID = function(a, b) {
        for (var c, d = 0, e = 0, f = a; b > f; ++f) {
            var g = this.get(f);
            d = d << 7 | 127 & g, e += 7, 128 & g || (void 0 == c ? c = parseInt(d / 40) + "." + d % 40 : c += "." + (e >= 31 ? "big" : d), d = e = 0), c += String.fromCharCode()
        }
        return c
    }, "undefined" != typeof d && (d.ASN1 = function(a, b, c, d, e) {
        this.stream = a, this.header = b, this.length = c, this.tag = d, this.sub = e
    }, d.ASN1.prototype.toHexTree = function() {
        var a = {};
        if (a.type = this.typeName(), "SEQUENCE" != a.type && (a.value = this.stream.parseStringHex(this.posContent(), this.posEnd())), null != this.sub) {
            a.sub = [];
            for (var b = 0, c = this.sub.length; c > b; ++b) a.sub[b] = this.sub[b].toHexTree()
        }
        return a
    }, d.ASN1.prototype.typeName = function() {
        if (void 0 == this.tag) return "unknown";
        var a = this.tag >> 6;
        1 & this.tag >> 5;
        var b = 31 & this.tag;
        switch (a) {
            case 0:
                switch (b) {
                    case 0:
                        return "EOC";
                    case 1:
                        return "BOOLEAN";
                    case 2:
                        return "INTEGER";
                    case 3:
                        return "BIT_STRING";
                    case 4:
                        return "OCTET_STRING";
                    case 5:
                        return "NULL";
                    case 6:
                        return "OBJECT_IDENTIFIER";
                    case 7:
                        return "ObjectDescriptor";
                    case 8:
                        return "EXTERNAL";
                    case 9:
                        return "REAL";
                    case 10:
                        return "ENUMERATED";
                    case 11:
                        return "EMBEDDED_PDV";
                    case 12:
                        return "UTF8String";
                    case 16:
                        return "SEQUENCE";
                    case 17:
                        return "SET";
                    case 18:
                        return "NumericString";
                    case 19:
                        return "PrintableString";
                    case 20:
                        return "TeletexString";
                    case 21:
                        return "VideotexString";
                    case 22:
                        return "IA5String";
                    case 23:
                        return "UTCTime";
                    case 24:
                        return "GeneralizedTime";
                    case 25:
                        return "GraphicString";
                    case 26:
                        return "VisibleString";
                    case 27:
                        return "GeneralString";
                    case 28:
                        return "UniversalString";
                    case 30:
                        return "BMPString";
                    default:
                        return "Universal_" + b.toString(16)
                }
            case 1:
                return "Application_" + b.toString(16);
            case 2:
                return "[" + b + "]";
            case 3:
                return "Private_" + b.toString(16)
        }
    }, d.ASN1.prototype.content = function() {
        if (void 0 == this.tag) return null;
        var a = this.tag >> 6;
        if (0 != a) return null;
        var b = 31 & this.tag,
            c = this.posContent(),
            d = Math.abs(this.length);
        switch (b) {
            case 1:
                return 0 == this.stream.get(c) ? "false" : "true";
            case 2:
                return this.stream.parseInteger(c, c + d);
            case 6:
                return this.stream.parseOID(c, c + d);
            case 12:
                return this.stream.parseStringUTF(c, c + d);
            case 18:
            case 19:
            case 20:
            case 21:
            case 22:
            case 26:
                return this.stream.parseStringISO(c, c + d);
            case 23:
            case 24:
                return this.stream.parseTime(c, c + d)
        }
        return null
    }, d.ASN1.prototype.toString = function() {
        return this.typeName() + "@" + this.stream.pos + "[header:" + this.header + ",length:" + this.length + ",sub:" + (null == this.sub ? "null" : this.sub.length) + "]"
    }, d.ASN1.prototype.print = function(a) {
        if (void 0 == a && (a = ""), document.writeln(a + this), null != this.sub) {
            a += "  ";
            for (var b = 0, c = this.sub.length; c > b; ++b) this.sub[b].print(a)
        }
    }, d.ASN1.prototype.toPrettyString = function(a) {
        void 0 == a && (a = "");
        var b = a + this.typeName() + " @" + this.stream.pos;
        if (this.length >= 0 && (b += "+"), b += this.length, 32 & this.tag ? b += " (constructed)" : 3 != this.tag && 4 != this.tag || null == this.sub || (b += " (encapsulates)"), b += "\n", null != this.sub) {
            a += "  ";
            for (var c = 0, d = this.sub.length; d > c; ++c) b += this.sub[c].toPrettyString(a)
        }
        return b
    }, d.ASN1.prototype.toDOM = function() {
        var a = document.createElement("div");
        a.className = "node", a.asn1 = this;
        var b = document.createElement("div");
        b.className = "head";
        var c = this.typeName();
        b.innerHTML = c, a.appendChild(b), this.head = b;
        var d = document.createElement("div");
        d.className = "value", c = "Offset: " + this.stream.pos + "<br/>", c += "Length: " + this.header + "+", c += this.length >= 0 ? this.length : -this.length + " (undefined)", 32 & this.tag ? c += "<br/>(constructed)" : 3 != this.tag && 4 != this.tag || null == this.sub || (c += "<br/>(encapsulates)");
        var e = this.content();
        if (null != e && (c += "<br/>Value:<br/><b>" + e + "</b>", "object" == typeof oids && 6 == this.tag)) {
            var f = oids[e];
            f && (f.d && (c += "<br/>" + f.d), f.c && (c += "<br/>" + f.c), f.w && (c += "<br/>(warning!)"))
        }
        d.innerHTML = c, a.appendChild(d);
        var g = document.createElement("div");
        if (g.className = "sub", null != this.sub)
            for (var h = 0, i = this.sub.length; i > h; ++h) g.appendChild(this.sub[h].toDOM());
        return a.appendChild(g), b.switchNode = a, b.onclick = function() {
            var a = this.switchNode;
            a.className = "node collapsed" == a.className ? "node" : "node collapsed"
        }, a
    }, d.ASN1.prototype.posStart = function() {
        return this.stream.pos
    }, d.ASN1.prototype.posContent = function() {
        return this.stream.pos + this.header
    }, d.ASN1.prototype.posEnd = function() {
        return this.stream.pos + this.header + Math.abs(this.length)
    }, d.ASN1.prototype.toHexDOM_sub = function(a, b, c, d, e) {
        if (!(d >= e)) {
            var f = document.createElement("span");
            f.className = b, f.appendChild(document.createTextNode(c.hexDump(d, e))), a.appendChild(f)
        }
    }, d.ASN1.prototype.toHexDOM = function() {
        var a = document.createElement("span");
        if (a.className = "hex", this.head.hexNode = a, this.head.onmouseover = function() {
                this.hexNode.className = "hexCurrent"
            }, this.head.onmouseout = function() {
                this.hexNode.className = "hex"
            }, this.toHexDOM_sub(a, "tag", this.stream, this.posStart(), this.posStart() + 1), this.toHexDOM_sub(a, this.length >= 0 ? "dlen" : "ulen", this.stream, this.posStart() + 1, this.posContent()), null == this.sub) a.appendChild(document.createTextNode(this.stream.hexDump(this.posContent(), this.posEnd())));
        else if (this.sub.length > 0) {
            var b = this.sub[0],
                c = this.sub[this.sub.length - 1];
            this.toHexDOM_sub(a, "intro", this.stream, this.posContent(), b.posStart());
            for (var d = 0, e = this.sub.length; e > d; ++d) a.appendChild(this.sub[d].toHexDOM());
            this.toHexDOM_sub(a, "outro", this.stream, c.posEnd(), this.posEnd())
        }
        return a
    }, d.ASN1.decodeLength = function(a) {
        var b = a.get(),
            c = 127 & b;
        if (c == b) return c;
        if (c > 3) throw "Length over 24 bits not supported at position " + (a.pos - 1);
        if (0 == c) return -1;
        b = 0;
        for (var d = 0; c > d; ++d) b = b << 8 | a.get();
        return b
    }, d.ASN1.hasContent = function(a, b, c) {
        if (32 & a) return !0;
        if (3 > a || a > 4) return !1;
        var f = new e(c);
        3 == a && f.get();
        var g = f.get();
        if (1 & g >> 6) return !1;
        try {
            var h = d.ASN1.decodeLength(f);
            return f.pos - c.pos + h == b
        } catch (i) {
            return !1
        }
    }, d.ASN1.decode = function(a) {
        a instanceof e || (a = new e(a, 0));
        var b = new e(a),
            c = a.get(),
            f = d.ASN1.decodeLength(a),
            g = a.pos - b.pos,
            h = null;
        if (d.ASN1.hasContent(c, f, a)) {
            var i = a.pos;
            if (3 == c && a.get(), h = [], f >= 0) {
                for (var j = i + f; a.pos < j;) h[h.length] = d.ASN1.decode(a);
                if (a.pos != j) throw "Content size is not correct for container starting at offset " + i
            } else try {
                for (;;) {
                    var k = d.ASN1.decode(a);
                    if (0 == k.tag) break;
                    h[h.length] = k
                }
                f = i - a.pos
            } catch (l) {
                throw "Exception while decoding undefined length content: " + l
            }
        } else a.pos += f;
        return new d.ASN1(b, g, f, c, h)
    }, d.ASN1.test = function() {
        for (var a = [{
                value: [39],
                expected: 39
            }, {
                value: [129, 201],
                expected: 201
            }, {
                value: [131, 254, 220, 186],
                expected: 16702650
            }], b = 0, c = a.length; c > b; ++b) {
            var f = new e(a[b].value, 0),
                g = d.ASN1.decodeLength(f);
            g != a[b].expected && document.write("In test[" + b + "] expected " + a[b].expected + " got " + g + "\n")
        }
    });
    var nc, oc = 0xdeadbeefcafe,
        pc = 15715070 == (16777215 & oc);
     var navigator = {};   
    pc && "Microsoft Internet Explorer" == navigator.appName ? (f.prototype.am = i, nc = 30) : pc  && "Netscape" != navigator.appName ? (f.prototype.am = h, nc = 26) : (f.prototype.am = j, nc = 28),
    f.prototype.DB = nc, f.prototype.DM = (1 << nc) - 1, f.prototype.DV = 1 << nc;
    var qc = 52;
    f.prototype.FV = Math.pow(2, qc), f.prototype.F1 = qc - nc, f.prototype.F2 = 2 * nc - qc;
    var rc, sc, tc = "0123456789abcdefghijklmnopqrstuvwxyz",
        uc = new Array;
    for (rc = "0".charCodeAt(0), sc = 0; 9 >= sc; ++sc) uc[rc++] = sc;
    for (rc = "a".charCodeAt(0), sc = 10; 36 > sc; ++sc) uc[rc++] = sc;
    for (rc = "A".charCodeAt(0), sc = 10; 36 > sc; ++sc) uc[rc++] = sc;
    G.prototype.convert = H, G.prototype.revert = I, G.prototype.reduce = J, G.prototype.mulTo = K, G.prototype.sqrTo = L, N.prototype.convert = O, N.prototype.revert = P, N.prototype.reduce = Q, N.prototype.mulTo = S, N.prototype.sqrTo = R, f.prototype.copyTo = m, f.prototype.fromInt = n, f.prototype.fromString = p, f.prototype.clamp = q, f.prototype.dlShiftTo = x, f.prototype.drShiftTo = y, f.prototype.lShiftTo = z, f.prototype.rShiftTo = A, f.prototype.subTo = B, f.prototype.multiplyTo = C, f.prototype.squareTo = D, f.prototype.divRemTo = E, f.prototype.invDigit = M, f.prototype.isEven = T, f.prototype.exp = U, f.prototype.toString = r, f.prototype.negate = s, f.prototype.abs = t, f.prototype.compareTo = u, f.prototype.bitLength = w, f.prototype.mod = F, f.prototype.modPowInt = V, f.ZERO = o(0), f.ONE = o(1), Lb.prototype.convert = Mb, Lb.prototype.revert = Mb, Lb.prototype.mulTo = Nb, Lb.prototype.sqrTo = Ob, Sb.prototype.convert = Tb, Sb.prototype.revert = Ub, Sb.prototype.reduce = Vb, Sb.prototype.mulTo = Xb, Sb.prototype.sqrTo = Wb;
    var vc = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509],
        wc = (1 << 26) / vc[vc.length - 1];
    f.prototype.chunkSize = $, f.prototype.toRadix = ab, f.prototype.fromRadix = bb, f.prototype.fromNumber = cb, f.prototype.bitwiseTo = hb, f.prototype.changeBit = yb, f.prototype.addTo = Cb, f.prototype.dMultiply = Jb, f.prototype.dAddOffset = Kb, f.prototype.multiplyLowerTo = Qb, f.prototype.multiplyUpperTo = Rb, f.prototype.modInt = $b, f.prototype.millerRabin = bc, f.prototype.clone = W, f.prototype.intValue = X, f.prototype.byteValue = Y, f.prototype.shortValue = Z, f.prototype.signum = _, f.prototype.toByteArray = db, f.prototype.equals = eb, f.prototype.min = fb, f.prototype.max = gb, f.prototype.and = jb, f.prototype.or = lb, f.prototype.xor = nb, f.prototype.andNot = pb, f.prototype.not = qb, f.prototype.shiftLeft = rb, f.prototype.shiftRight = sb, f.prototype.getLowestSetBit = ub, f.prototype.bitCount = wb, f.prototype.testBit = xb, f.prototype.setBit = zb, f.prototype.clearBit = Ab, f.prototype.flipBit = Bb, f.prototype.add = Db, f.prototype.subtract = Eb, f.prototype.multiply = Fb, f.prototype.divide = Gb, f.prototype.remainder = Hb, f.prototype.divideAndRemainder = Ib, f.prototype.modPow = Yb, f.prototype.modInverse = _b, f.prototype.pow = Pb, f.prototype.gcd = Zb, f.prototype.isProbablePrime = ac, dc.prototype.init = ec, dc.prototype.next = fc;
    var xc = 256;
    "undefined" != typeof d && "undefined" != typeof f && "undefined" != typeof cc && "undefined" != typeof dc && (d.RSA = function() {
        this.n = null, this.e = 0, this.d = null, this.p = null, this.q = null, this.dmp1 = null, this.dmq1 = null, this.coeff = null
    }, d.RSA.prototype.doPrivate = function(a) {
        if (null == this.p || null == this.q) return a.modPow(this.d, this.n);
        for (var b = a.mod(this.p).modPow(this.dmp1, this.p), c = a.mod(this.q).modPow(this.dmq1, this.q); b.compareTo(c) < 0;) b = b.add(this.p);
        return b.subtract(c).multiply(this.coeff).mod(this.p).multiply(this.q).add(c)
    }, d.RSA.prototype.setPublic = function(a, b, c) {
        "undefined" == typeof c && (c = 16), null != a && null != b && a.length > 0 && b.length > 0 ? (this.n = hc(a, c), this.e = parseInt(b, c)) : alert("Invalid RSA public key")
    }, d.RSA.prototype.doPublic = function(a) {
        return a.modPowInt(this.e, this.n)
    }, d.RSA.prototype.encryptRaw = function(a) {
        var b = jc(a, this.n.bitLength() + 7 >> 3);
        if (null == b) return null;
        var c = this.doPublic(b);
        if (null == c) return null;
        var d = c.toString(16);
        return 0 == (1 & d.length) ? d : "0" + d
    }, d.RSA.prototype.encrypt = function(a) {
        return a = pidCryptUtil.encodeBase64(a), this.encryptRaw(a)
    }, d.RSA.prototype.decryptRaw = function(a) {
        var b = hc(a, 16),
            c = this.doPrivate(b);
        return null == c ? null : ic(c, this.n.bitLength() + 7 >> 3)
    }, d.RSA.prototype.decrypt = function(a) {
        var b = this.decryptRaw(a);
        return b = b ? pidCryptUtil.decodeBase64(b) : ""
    }, d.RSA.prototype.setPrivate = function(a, b, c, d) {
        "undefined" == typeof d && (d = 16), null != a && null != b && a.length > 0 && b.length > 0 ? (this.n = hc(a, d), this.e = parseInt(b, d), this.d = hc(c, d)) : alert("Invalid RSA private key")
    }, d.RSA.prototype.setPrivateEx = function(a, b, c, d, e, f, g, h, i) {
        "undefined" == typeof i && (i = 16), null != a && null != b && a.length > 0 && b.length > 0 ? (this.n = hc(a, i), this.e = parseInt(b, i), this.d = hc(c, i), this.p = hc(d, i), this.q = hc(e, i), this.dmp1 = hc(f, i), this.dmq1 = hc(g, i), this.coeff = hc(h, i)) : alert("Invalid RSA private key")
    }, d.RSA.prototype.generate = function(a, b) {
        var c = new cc,
            d = a >> 1;
        this.e = parseInt(b, 16);
        for (var e = new f(b, 16);;) {
            for (; this.p = new f(a - d, 1, c), 0 != this.p.subtract(f.ONE).gcd(e).compareTo(f.ONE) || !this.p.isProbablePrime(10););
            for (; this.q = new f(d, 1, c), 0 != this.q.subtract(f.ONE).gcd(e).compareTo(f.ONE) || !this.q.isProbablePrime(10););
            if (this.p.compareTo(this.q) <= 0) {
                var g = this.p;
                this.p = this.q, this.q = g
            }
            var h = this.p.subtract(f.ONE),
                i = this.q.subtract(f.ONE),
                j = h.multiply(i);
            if (0 == j.gcd(e).compareTo(f.ONE)) {
                this.n = this.p.multiply(this.q), this.d = e.modInverse(j), this.dmp1 = this.d.mod(h), this.dmq1 = this.d.mod(i), this.coeff = this.q.modInverse(this.p);
                break
            }
        }
    }, d.RSA.prototype.getASNData = function(a) {
        var b = [],
            c = 0;
        if (a.value && "INTEGER" == a.type && (b[c++] = a.value), a.sub)
            for (var d = 0; d < a.sub.length; d++) b = b.concat(this.getASNData(a.sub[d]));
        return b
    }, d.RSA.prototype.setKeyFromASN = function(a, b) {
        var c = ["N", "E", "D", "P", "Q", "DP", "DQ", "C"],
            d = {},
            e = this.getASNData(b);
        switch (a) {
            case "Public":
            case "public":
                for (var f = 0; f < e.length; f++) d[c[f]] = e[f].toLowerCase();
                this.setPublic(d.N, d.E, 16);
                break;
            case "Private":
            case "private":
                for (var f = 1; f < e.length; f++) d[c[f - 1]] = e[f].toLowerCase();
                this.setPrivateEx(d.N, d.E, d.D, d.P, d.Q, d.DP, d.DQ, d.C, 16)
        }
    }, d.RSA.prototype.setPublicKeyFromASN = function(a) {
        this.setKeyFromASN("public", a)
    }, d.RSA.prototype.setPrivateKeyFromASN = function(a) {
        this.setKeyFromASN("private", a)
    }, d.RSA.prototype.getParameters = function() {
        var a = {};
        return null != this.n && (a.n = this.n), a.e = this.e, null != this.d && (a.d = this.d), null != this.p && (a.p = this.p), null != this.q && (a.q = this.q), null != this.dmp1 && (a.dmp1 = this.dmp1), null != this.dmq1 && (a.dmq1 = this.dmq1), null != this.coeff && (a.c = this.coeff), a
    });
    var yc = function(a, publicKey) {
        return a ? (a += "", a.length > 60 ? a : lc(a, publicKey)) : void 0
    };
    c.exports = yc
});

var crypto = require('crypto');

exports.getHeaders = getHeaders;
function getHeaders(uid) {
    var t = new Date().getTime() - 2345;
    var headers = {
        "mobile_agent": "appVersion:3.4.9,platform:android,osVersion:17,device:GT-P5210,resourceVersion:2.7.0,channel:H5",
        "X-LUFAX-MOBILE-DATA-AGENT": '',
        "x-lufax-mobile-t": t,
        "x-lufax-mobile-signature": genSig(uid?uid:null, t),
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    };
    return headers;
}

//exports.genSig = genSig;
function genSig(userId, time) {
    // "{\"userId\":1770933,\"_t\":1443018369935}", "1|4"
    var str = userId ? "{\"userId\":"+userId+",\"_t\":"+time+"}" : "{\"_t\":"+time+"}";
    var str2 = "1|4";
    var sha25Bytes = sha256(str);
    // console.log("***" + sha25Bytes.length, String.fromCharCode.apply(null, sha25Bytes));
    var str3 = String.fromCharCode.apply(null, sha25Bytes);
    var subtypes = str2.split("\|");
    for (var i = 0; i < subtypes.length; i++) {
        var parseInt = Number(subtypes[i])

        if (parseInt == 1) {
            str3 = m11559b(str3);
        }
        // if (parseInt2 == 2) {
        //     str3 = Siggen.m11560c(str3);
        // }
        // if (parseInt2 == 3) {
        //     str3 = Siggen.m11557a(str3);
        // }
        if (parseInt == 4) {
            str3 = m11561d(str3);
        }
        // if (parseInt2 == 5) {
        //     str3 = Siggen.m11562e(str3);
        // }                
    }
    return str3.toUpperCase();

}

function sha256(str) {
    var bArr = new Int8Array(crypto.createHash('sha256').update(str).digest());
    // console.log("===", bArr[0], bArr[1], bArr[2], bArr[3], bArr.length)

    var sha256Dependence = new Sha256Dependence(0, new Int8Array([13, 10]), false);
    var d = sha256Dependence.m9290d(bArr);
    var encoded = sha256Dependence.encode(bArr);
    return encoded;
}

function m11559b(str) {
    var length = "abcdefghiklmnopqrstuvwxyz0123456789".length;
    var pre = "";
    for (var i = 0; i < 20; i++) {
        pre += "abcdefghiklmnopqrstuvwxyz0123456789".charAt(Math.round(length * Math.random()));
    }
    return pre + str;
}

function m11561d(str) {
    var str2 = "";
    var str3 = "";
    var str4 = str2;
    for (var i = 0; i < str.length; i++) {
        if (i % 2 == 0) {
            str4 = str4.concat(str.charAt(i));
        } else {
            str3 = str3.concat(str.charAt(i));
        }
    }
    return str4.concat(str3);
}

function arrayCopy(src, srcPos, dest, destPos, length) {
    for (var i = 0; i < length; i++) {
        dest[destPos + i] = src[srcPos + i]
    }
}

var Sha256Dependence = function(i, bArr, z) {
    this.f7442a = new Int8Array([13, 10]);
    this.f7443i = new Int8Array([65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47]);
    this.f7444j = new Int8Array([65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 45, 95]);
    this.f7445k = new Int8Array([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, 62, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]);
    var me = this;
    superC(3, 4, i, bArr == null ? 0 : bArr.length);
    this.f7447m = this.f7445k;
    this.f7450p = 4;
    this.f7448n = null;

    this.f7449o = this.f7450p - 1;
    this.f7446l = z ? this.f7444j : this.f7443i;

    function superC(i, i2, i3, i4) {
        me.f7432b = new Int8Array([61])[0] //(byte) 61;
        me.f7431a = i;
        me.f7439i = i2;
        var i5 = (i3 <= 0 || i4 <= 0) ? 0 : (i3 / i2) * i2;
        me.f7433c = i5;
        me.f7440j = i4;
        // console.log("superC", me.f7431a, me.f7439i);
    }

};

Sha256Dependence.prototype.m9290d = function(bArr) {
    var length = Math.round(((((bArr.length + this.f7431a) - 1) / this.f7431a))) * (this.f7439i);
    // console.log("lenght---", length, bArr.length, this.f7431a, this.f7439i);
    return this.f7433c > 0 ? length + (((((this.f7433c) + length) - 1) / (this.f7433c)) * (this.f7440j)) : length;
}

Sha256Dependence.prototype.m9280d = function() {
    this.f7434d = null;
    this.f7435e = 0;
    this.f7441k = 0;
    this.f7437g = 0;
    this.f7438h = 0;
    this.f7436f = false;
}

Sha256Dependence.prototype.encode = function(bArr) {
    this.m9280d();
    if (bArr == null || bArr.length == 0) {
        return bArr;
    }
    this.m9283a(bArr, 0, bArr.length);
    this.m9283a(bArr, 0, -1);
    bArr = new Int8Array(this.f7435e - this.f7441k);
    this.m9288c(bArr, 0, bArr.length);
    return bArr;
}

Sha256Dependence.prototype.m9283a = function(bArr, i, i2) {
    if (!this.f7436f) {
        var i3;
        var i4;
        if (i2 < 0) {
            this.f7436f = true;
            if (this.f7438h != 0 || this.f7433c != 0) {
                this.m9282a(this.f7450p);
                i3 = this.f7435e;
                var bArr2;
                switch (this.f7438h) {
                    // case Base64.NO_PADDING /*1*/:
                    case 1:
                        bArr2 = this.f7434d;
                        i4 = this.f7435e;
                        this.f7435e = i4 + 1;
                        bArr2[i4] = this.f7446l[(this.f7451q >> 2) & 63];
                        bArr2 = this.f7434d;
                        i4 = this.f7435e;
                        this.f7435e = i4 + 1;
                        bArr2[i4] = this.f7446l[(this.f7451q << 4) & 63];
                        if (this.f7446l == this.f7443i) {
                            bArr2 = this.f7434d;
                            i4 = this.f7435e;
                            this.f7435e = i4 + 1;
                            bArr2[i4] = 61; //(byte) 61;
                            bArr2 = this.f7434d;
                            i4 = this.f7435e;
                            this.f7435e = i4 + 1;
                            bArr2[i4] = 61; //(byte) 61;
                            break;
                        }
                        break;
                        // case Base64.NO_WRAP /*2*/:
                    case 2:
                        bArr2 = this.f7434d;
                        i4 = this.f7435e;
                        this.f7435e = i4 + 1;
                        bArr2[i4] = this.f7446l[(this.f7451q >> 10) & 63];
                        bArr2 = this.f7434d;
                        i4 = this.f7435e;
                        this.f7435e = i4 + 1;
                        bArr2[i4] = this.f7446l[(this.f7451q >> 4) & 63];
                        bArr2 = this.f7434d;
                        i4 = this.f7435e;
                        this.f7435e = i4 + 1;
                        bArr2[i4] = this.f7446l[(this.f7451q << 2) & 63];
                        if (this.f7446l == this.f7443i) {
                            bArr2 = this.f7434d;
                            i4 = this.f7435e;
                            this.f7435e = i4 + 1;
                            bArr2[i4] = 61; //(byte) 61;
                            break;
                        }
                        break;
                }
                this.f7437g = (this.f7435e - i3) + this.f7437g;
                if (this.f7433c > 0 && this.f7437g > 0) {
                    arrayCopy(this.f7448n, 0, this.f7434d, this.f7435e, this.f7448n.length);
                    this.f7435e += this.f7448n.length;
                    return;
                }
                return;
            }
            return;
        }
        i5 = 0;
        while (i5 < i2) {
            this.m9282a(this.f7450p);
            this.f7438h = (this.f7438h + 1) % 3;
            i4 = i + 1;
            i3 = bArr[i];
            if (i3 < 0) {
                i3 += 256;
            }
            this.f7451q = i3 + (this.f7451q << 8);
            if (this.f7438h == 0) {
                bArr3 = this.f7434d;
                i6 = this.f7435e;
                this.f7435e = i6 + 1;
                bArr3[i6] = this.f7446l[(this.f7451q >> 18) & 63];
                bArr3 = this.f7434d;
                i6 = this.f7435e;
                this.f7435e = i6 + 1;
                bArr3[i6] = this.f7446l[(this.f7451q >> 12) & 63];
                bArr3 = this.f7434d;
                i6 = this.f7435e;
                this.f7435e = i6 + 1;
                bArr3[i6] = this.f7446l[(this.f7451q >> 6) & 63];
                bArr3 = this.f7434d;
                i6 = this.f7435e;
                this.f7435e = i6 + 1;
                bArr3[i6] = this.f7446l[this.f7451q & 63];
                this.f7437g += 4;
                if (this.f7433c > 0 && this.f7433c <= this.f7437g) {
                    arrayCopy(this.f7448n, 0, this.f7434d, this.f7435e, this.f7448n.length);
                    this.f7435e += this.f7448n.length;
                    this.f7437g = 0;
                }
            }
            i5++;
            i = i4;
        }
    }
}

Sha256Dependence.prototype.m9288c = function(bArr, i, i2) {
    if (this.f7434d == null) {
        return this.f7436f ? -1 : 0;
    } else {
        var min = Math.min(this.m9281a(), i2);
        arrayCopy(this.f7434d, this.f7441k, bArr, i, min);
        this.f7441k += min;
        if (this.f7441k < this.f7435e) {
            return min;
        }
        this.f7434d = null;
        return min;
    }
}

Sha256Dependence.prototype.m9281a = function() {
    return this.f7434d != null ? this.f7435e - this.f7441k : 0;
}

Sha256Dependence.prototype.m9282a = function(i) {
    if (this.f7434d == null || this.f7434d.length < this.f7435e + i) {
        this.m9279c();
    }
}

Sha256Dependence.prototype.m9279c = function() {
    if (this.f7434d == null) {
        this.f7434d = new Int8Array(8192); //new byte[m9286b()];
        this.f7435e = 0;
        this.f7441k = 0;
        return;
    }
    obj = new Int8Array(this.f7434d.length * 2); //new byte[(this.f7434d.length * 2)];
    arrayCopy(this.f7434d, 0, obj, 0, this.f7434d.length);
    this.f7434d = obj;
}

// var hashstr = genSig(1770933);
// console.log(hashstr)

//var pgeCert="308188028180D72CFA8C301002AEA457DC10FCBBF74BF922311C32729D3698BAD833BF1ED1F8B7BEFBA48CBEA6B677295923DCC97E70B52928083FDEC91EC28C102F73AE04B59FCA996959D42EBC53CF5ADCDED65433D9E72F69A2DAA7D91E1D8E5219DCA208A9F79DBC49417E0CF525A9EBD561F5FD5E1AB12316AC313774E69D12B2E3F81D0203010001";
//var pgeCert="3081870281810096BC873914F4EFB5D2E9107AEBF577A60AC62B078973DDE7C350738AA9771035A6150B3FFC425E83813463A2912D8A06D3B9A88116660645B0AF3FA2742743C2A2F573885C00504FD1DAF677075C0534B787CC23F202C100175CC7908A6B68AFA820B5C9687D1B16F48AB391CE7C66EC6A5A8E71EAC007605CC1898122CB72C9020103";
//var pgEmail="30818702818100DE90F1FEE497FF8274F77FB5A770428AD7CC98B0A2855D80C540DC0ACBE18D0141349BED8D7A9E26FDD3B82BDC6CC6FE1A51552EC4A6DAE3A2988EFECE304730C6876DAB616CD75578C3EE8E2AB19941366BC22DE63A5C4647D300CE702421E4FE0CDF58DF96833DCA2BDB6EAEA00335BFC24435DB03C82B0A5076406841D4A9020103";
var pgeCert = "3081870281810096BC873914F4EFB5D2E9107AEBF577A60AC62B078973DDE7C350738AA9771035A6150B3FFC425E83813463A2912D8A06D3B9A88116660645B0AF3FA2742743C2A2F573885C00504FD1DAF677075C0534B787CC23F202C100175CC7908A6B68AFA820B5C9687D1B16F48AB391CE7C66EC6A5A8E71EAC007605CC1898122CB72C9020103";
var pgEmail = "30818702818100D7C70626D0E7C14C730F5879DB77B824DBBEDD4E983335C3B7C179936ECB1C35BC393A96753BF9CE3E809C70F2A181CF2DD6141942A7352AAB619B038A17A2BBECDEE61301D7E8D955F4230AED8DA13C5F82F1A59C572321DD7EC7FD35BEAFEB1F24C97C123BD6AC0E1DFAF57C33DB7C941FF075E460EB3F3966B84D043CE533020103";

var PGEdit_PATH = "../ocx/";

var PGEdit_IE32_CLASSID = "52CCD7E1-0C8A-4C70-B43C-7810D9A8000D";
var PGEdit_IE32_CAB = "CMBCIE32.cab#version=1,0,0,1";
var PGEdit_IE32_EXE = "CMBCEditSetupIE.exe";
//var PGEdit_IE32_EXE="CMBCIE32.exe";

var PGEdit_IE64_CLASSID = "2C325764-1613-4116-A769-ECAD189C7DB2";
var PGEdit_IE64_CAB = "CMBCIE64.cab#version=1,0,0,1";
var PGEdit_IE64_EXE = "CMBCEditSetupX64.exe";
//var PGEdit_IE64_EXE="CMBCIE64.exe";

var PGEdit_FF = "CMBCEditSetupFF.exe";
//var PGEdit_FF="CMBCPlugin.exe";
var PGEdit_FF_VERSION = "1.0.0.1";

var PGEdit_Linux32 = "";
var PGEdit_Linux64 = "";
var PGEdit_Linux_VERSION = "";

var PGEdit_MacOs = "CMBCEdit.pkg";
var PGEdit_MacOs_VERSION = "1.0.0.0";

var PGEdit_Update = "0"; //非IE控件是否强制升级 1强制升级,0不强制升级

var pgeLoginEreg1 = new Array();
var pgeLoginEreg2 = new Array();
var pgeLoginMaxlength = new Array();

//交易密码规则
pgeLoginEreg1[1] = "[0-9]*";
pgeLoginEreg2[1] = "[0-9]{6,6}";
pgeLoginMaxlength[1] = 6;

pgeLoginEreg1[2] = "[0-9]*";
pgeLoginEreg2[2] = "[0-9]{6,20}";
pgeLoginMaxlength[2] = 20;

//登录密码规则
pgeLoginEreg1[3] = "[A-Za-z0-9]*";
pgeLoginEreg2[3] = "(?![a-zA-Z]+$)(?![0-9]+$).{6,20}";
pgeLoginMaxlength[3] = 20;


pgeLoginEreg1[4] = "[A-Za-z0-9]*";
pgeLoginEreg2[4] = "[A-Za-z0-9]{6,20}";
pgeLoginMaxlength[4] = 20;


pgeLoginEreg1[5] = "[A-Za-z0-9]*";
pgeLoginEreg2[5] = "[A-Za-z0-9]{6,20}";
pgeLoginMaxlength[5] = 20;

//密码修改
pgeLoginEreg1[6] = "[A-Za-z0-9]*";
pgeLoginEreg2[6] = "[A-Za-z0-9]{6,8}";
pgeLoginMaxlength[6] = 8;

pgeLoginEreg1[7] = "[A-Za-z0-9]*";
pgeLoginEreg2[7] = "[A-Za-z0-9]{6,16}";
pgeLoginMaxlength[7] = 16;

pgeLoginEreg1[8] = "[A-Za-z0-9]*";
pgeLoginEreg2[8] = "[A-Za-z0-9]{6,6}";
pgeLoginMaxlength[8] = 6;

pgeLoginEreg1[9] = "[A-Za-z0-9]*";
pgeLoginEreg2[9] = "[A-Za-z0-9]{4,10}";
pgeLoginMaxlength[9] = 10;

pgeLoginEreg1[10] = "[A-Za-z0-9]*";
pgeLoginEreg2[10] = "[A-Za-z0-9]{4,20}";
pgeLoginMaxlength[10] = 20;

pgeLoginEreg1[11] = "[A-Za-z0-9]*";
pgeLoginEreg2[11] = "[A-Za-z0-9]{4,8}";
pgeLoginMaxlength[11] = 8;

pgeLoginEreg1[12] = "[\\s\\S]*";
pgeLoginEreg2[12] = "[\\s\\S]{4,16}";
pgeLoginMaxlength[12] = 16;

pgeLoginEreg1[13] = "[\\s\\S]*";
pgeLoginEreg2[13] = "[\\s\\S]{6,8}";
pgeLoginMaxlength[13] = 8;

pgeLoginEreg1[14] = "[\\s\\S]*";
pgeLoginEreg2[14] = "[\\s\\S]{6,10}";
pgeLoginMaxlength[14] = 10;

pgeLoginEreg1[15] = "[\\s\\S]*";
pgeLoginEreg2[15] = "[\\s\\S]{4,8}";
pgeLoginMaxlength[15] = 8;


pgeLoginEreg1[16] = "[A-Za-z0-9]*";
pgeLoginEreg2[16] = "(?![a-zA-Z]+$)(?![0-9]+$).{6,8}";
pgeLoginMaxlength[16] = 8;

pgeLoginEreg1[17] = "[A-Za-z0-9]*";
pgeLoginEreg2[17] = "[0-9]{6,20}";
pgeLoginMaxlength[17] = 20;

pgeLoginEreg1[18] = "[A-Za-z0-9]*";
pgeLoginEreg2[18] = "(?![a-zA-Z]+$)(?![0-9]+$).{8,10}";
pgeLoginMaxlength[18] = 10;

pgeLoginEreg1[19] = "[\\s\\S]*";
pgeLoginEreg2[19] = "[\\s\\S]{4,20}";
pgeLoginMaxlength[19] = 20;

pgeLoginEreg1[20] = "";
pgeLoginEreg2[20] = "";
pgeLoginMaxlength[20] = 20;

if (navigator.userAgent.indexOf("MSIE") < 0) {
    navigator.plugins.refresh();
}

function _PGEObj(id) {
    return document.getElementById(id);
}
//控件初始化
function PGEdit(options, flag) {
    this.pgeId = options.pgeId;
    this.pgeEdittype = options.pgeEdittype;
    //	this.pgeCert=options.pgeCert;
    if (flag) {
        this.pgeCert = pgEmail;
    } else {
        this.pgeCert = options.pgeCert;
    }
    this.pgeRandomNum = options.pgeRandomNum;
    this.pgeHasskb = options.pgeHasskb;
    //this.pgeEreg1=options.pgeEreg1;
    //this.pgeEreg2=options.pgeEreg2;
    this.pgeType = options.pgeType;
    //this.pgeMaxlength=options.pgeMaxlength;
    this.pgeTabindex = options.pgeTabindex;
    this.pgeClass = options.pgeClass;
    this.pgeOnkeydown = options.pgeOnkeydown;
    this.tabCallback = options.tabCallback;
    this.pgeOnFocus = options.pgeOnFocus;
    this.pgeBackColor = options.pgeBackColor;
    this.pgeForeColor = options.pgeForeColor;


    if (this.pgeType != undefined && this.pgeType != "") {
        this.pgeEreg1 = pgeLoginEreg1[this.pgeType];
        this.pgeEreg2 = pgeLoginEreg2[this.pgeType];
        this.pgeMaxlength = pgeLoginMaxlength[this.pgeType];
    } else {
        this.pgeEreg1 = pgeLoginEreg1[3];
        this.pgeEreg2 = pgeLoginEreg2[3];
        this.pgeMaxlength = pgeLoginMaxlength[3];
    }
    if (this.pgeCert == undefined || this.pgeCert == "") {
        this.pgeCert = pgeCert;
    }
    this.pgePath = PGEdit_PATH;
    this.pgeDownText = "请点此安装控件";
    this.osBrowser = this.checkOsBrowser();
    this.pgeVersion = this.getVersion();
    this.isInstalled = this.checkInstall();
}
//判断操作系统和浏览器
PGEdit.prototype.checkOsBrowser = function() {
        var userosbrowser;
        if ((navigator.platform == "Win32") || (navigator.platform == "Windows")) {
            if (navigator.userAgent.indexOf("MSIE") > 0 || navigator.userAgent.indexOf("msie") > 0 || navigator.userAgent.indexOf("Trident") > 0 || navigator.userAgent.indexOf("trident") > 0) {
                userosbrowser = 1; //windows32ie32
                this.pgeditIEClassid = PGEdit_IE32_CLASSID;
                this.pgeditIECab = PGEdit_IE32_CAB;
                this.pgeditIEExe = PGEdit_IE32_EXE;
            } else {
                userosbrowser = 2; //windowsff
                this.pgeditFFExe = PGEdit_FF;
            }
        } else if ((navigator.platform == "Win64")) {
            if (navigator.userAgent.indexOf("Windows NT 6.2") > 0 || navigator.userAgent.indexOf("windows nt 6.2") > 0) {
                userosbrowser = 1; //windows32ie32
                this.pgeditIEClassid = PGEdit_IE32_CLASSID;
                this.pgeditIECab = PGEdit_IE32_CAB;
                this.pgeditIEExe = PGEdit_IE32_EXE;
            } else if (navigator.userAgent.indexOf("MSIE") > 0 || navigator.userAgent.indexOf("msie") > 0 || navigator.userAgent.indexOf("Trident") > 0 || navigator.userAgent.indexOf("trident") > 0) {
                userosbrowser = 3; //windows64ie64
                this.pgeditIEClassid = PGEdit_IE64_CLASSID;
                this.pgeditIECab = PGEdit_IE64_CAB;
                this.pgeditIEExe = PGEdit_IE64_EXE;
            } else {
                userosbrowser = 2; //windowsff
                this.pgeditFFExe = PGEdit_FF;
            }
        } else if (navigator.userAgent.indexOf("Linux") > 0) {
            if (navigator.userAgent.indexOf("_64") > 0) {
                userosbrowser = 4; //linux64
                this.pgeditFFExe = PGEdit_Linux64;
            } else {
                userosbrowser = 5; //linux32
                this.pgeditFFExe = PGEdit_Linux32;
            }
            if (navigator.userAgent.indexOf("Android") > 0) {
                userosbrowser = 7; //Android
            }
        } else if (navigator.userAgent.indexOf("Macintosh") > 0) {
            userosbrowser = 6;
            this.pgeditFFExe = PGEdit_MacOs;
        }
        return userosbrowser;
    }
    //控件脚本
PGEdit.prototype.getpgeHtml = function() {

        if (this.osBrowser == 1 || this.osBrowser == 3) {

            // <!-- cmbc begin -->
            var pgeOcx = '<span id="' + this.pgeId + '_pge" style="display:inline;"><OBJECT ID="' + this.pgeId + '" CLASSID="CLSID:' + this.pgeditIEClassid + '" codebase="' + this.pgePath + this.pgeditIECab + '"';
            // <!-- cmbc end -->		
            if (this.pgeOnkeydown != undefined && this.pgeOnkeydown != "") pgeOcx += ' onkeydown="console.log(event.keyCode);if(13==event.keyCode || 27==event.keyCode)' + this.pgeOnkeydown + ';"';

            if (this.pgeOnFocus != undefined && this.pgeOnFocus != "") pgeOcx += ' onFocus="' + this.pgeOnFocus + '"';

            if (this.pgeTabindex != undefined && this.pgeTabindex != "") pgeOcx += ' tabindex="' + this.pgeTabindex + '"';

            if (this.pgeClass != undefined && this.pgeClass != "") pgeOcx += ' class="' + this.pgeClass + '"';

            pgeOcx += '>';

            if (this.pgeHasskb != undefined && this.pgeHasskb != "" && this.pgeHasskb != "0") pgeOcx += '<param name="hasskb" value="1">';

            if (this.pgeEdittype != undefined && this.pgeEdittype != "") pgeOcx += '<param name="edittype" value="' + this.pgeEdittype + '">';

            if (this.pgeMaxlength != undefined && this.pgeMaxlength != "") pgeOcx += '<param name="maxlength" value="' + this.pgeMaxlength + '">';

            if (this.pgeEreg1 != undefined && this.pgeEreg1 != "") pgeOcx += '<param name="input2" value="' + this.pgeEreg1 + '">';

            if (this.pgeEreg2 != undefined && this.pgeEreg2 != "") pgeOcx += '<param name="input3" value="' + this.pgeEreg2 + '">';

            pgeOcx += '</OBJECT></span>';

            pgeOcx += '<span id="' + this.pgeId + '_down" class="' + this.pgeClass + '" style="text-align:center;display:none;"><a href="' + this.pgePath + this.pgeditIEExe + '">' + this.pgeDownText + '</a></span>';

            return pgeOcx;

        } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {

            var pgeOcx = '<embed ID="' + this.pgeId + '"  maxlength="' + this.pgeMaxlength + '" edittype="' + this.pgeEdittype + '" type="application/x-cmbc-edit" tabindex="' + this.pgeTabindex + '" class="' + this.pgeClass + '" ';

            if (this.pgeEreg1 != undefined && this.pgeEreg1 != "") pgeOcx += ' input_2="' + this.pgeEreg1 + '"';

            if (this.pgeEreg2 != undefined && this.pgeEreg2 != "") pgeOcx += ' input_3="' + this.pgeEreg2 + '"';

            if (this.pgeOnFocus != undefined && this.pgeOnFocus != "") pgeOcx += ' onFocus="' + this.pgeOnFocus + '"';

            if (this.pgeOnkeydown != undefined && this.pgeOnkeydown != "") pgeOcx += ' input_1013="' + this.pgeOnkeydown + '"';

            if (this.tabCallback != undefined && this.tabCallback != "") pgeOcx += ' input_1009="document.getElementById(\'' + this.tabCallback + '\').focus()"';

            if (this.pgeHasskb != undefined && this.pgeHasskb != "" && this.pgeHasskb != "0") pgeOcx += ' osk=1 ';

            pgeOcx += '>';

            return pgeOcx;

        } else if (this.osBrowser == 6) {

            return '<embed ID="' + this.pgeId + '" input2="' + this.pgeEreg1 + '" input3="' + this.pgeEreg2 + '" input4="' + Number(this.pgeMaxlength) + '" input0="' + Number(this.pgeEdittype) + '" type="application/CMB-SecurityEdit-Safari-plugin" version="' + PGEdit_MacOs_VERSION + '" tabindex="' + this.pgeTabindex + '" class="' + this.pgeClass + '">';

        } else {

            return '<div id="' + this.pgeId + '_down" class="' + this.pgeClass + '" style="text-align:center;">暂不支持此浏览器</div>';

        }

    }
    //下载地址
PGEdit.prototype.getDownHtml = function() {

    if (this.osBrowser == 1 || this.osBrowser == 3) {
        return '<div id="' + this.pgeId + '_down" class="' + this.pgeClass + '" style="text-align:center;"><a href="' + this.pgePath + this.pgeditIEExe + '">' + this.pgeDownText + '</a></div>';
    } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5 || this.osBrowser == 6) {

        return '<div id="' + this.pgeId + '_down" class="' + this.pgeClass + '" style="text-align:center;"><a href="' + this.pgePath + this.pgeditFFExe + '">' + this.pgeDownText + '</a></div>';

    } else {

        return '<div id="' + this.pgeId + '_down" class="' + this.pgeClass + '" style="text-align:center;">暂不支持此浏览器</div>';

    }

}

PGEdit.prototype.load = function() {
    if (!this.checkInstall()) {
        return this.getDownHtml();
    } else {
        if (this.osBrowser == 2) {
            if (this.pgeVersion != PGEdit_FF_VERSION && PGEdit_Update == 1) {
                this.setDownText();
                return document.write(this.getDownHtml());
            }
        } else if (this.osBrowser == 4 || this.osBrowser == 5) {
            if (this.pgeVersion != PGEdit_Linux_VERSION && PGEdit_Update == 1) {
                this.setDownText();
                return this.getDownHtml();
            }
        } else if (this.osBrowser == 6) {
            if (this.pgeVersion != PGEdit_MacOs_VERSION && PGEdit_Update == 1) {
                this.setDownText();
                return this.getDownHtml();
            }
        }
        return this.getpgeHtml();
    }

}

//控件脚本
PGEdit.prototype.generate = function() {

    if (this.osBrowser == 2) {
        if (this.isInstalled == false) {
            return document.write(this.getDownHtml());
        } else if (this.pgeVersion != PGEdit_FF_VERSION && PGEdit_Update == 1) {
            this.setDownText();
            return document.write(this.getDownHtml());
        }
    } else if (this.osBrowser == 4 || this.osBrowser == 5) {
        if (this.isInstalled == false) {
            return document.write(this.getDownHtml());
        } else if (this.pgeVersion != PGEdit_Linux_VERSION && PGEdit_Update == 1) {
            this.setDownText();
            return document.write(this.getDownHtml());
        }
    } else if (this.osBrowser == 6) {
        if (this.isInstalled == false) {
            return document.write(this.getDownHtml());
        } else if (this.pgeVersion != PGEdit_MacOs_VERSION && PGEdit_Update == 1) {
            this.setDownText();
            return document.write(this.getDownHtml());
        }
    }
    return document.write(this.getpgeHtml());


}

//清空输入框
PGEdit.prototype.pwdclear = function() {
        if (this.checkInstall()) {
            var control = document.getElementById(this.pgeId);
            control.ClearSeCtrl();

            // for (var att in control) {
            // 		console.log(att)
            // }
        }

    }
    //设置随机数
PGEdit.prototype.pwdSetSk = function(s) {
        if (this.checkInstall()) {
            try {
                var control = document.getElementById(this.pgeId);
                if (this.osBrowser == 1 || this.osBrowser == 3) {
                    control.input13 = s;
                } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                    control.input(901, s);
                } else if (this.osBrowser == 6) {
                    control.input6 = s;
                }
            } catch (err) {}
        }
    }
    //设置公钥
PGEdit.prototype.pwdSetCert = function(cert) {
        if (cert != undefined && cert != "") {
            this.pgeCert = cert;
        }
    }
    //密文
    //随机数,seed
PGEdit.prototype.pwdResult = function() {

    var code = '';

    if (!this.checkInstall()) {

        code = '';
    } else {
        try {

            var control = document.getElementById(this.pgeId);
            if (this.osBrowser == 1 || this.osBrowser == 3) {
                control.input12 = this.pgeCert;
                code = control.output40;
            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                control.package = 4;
                control.input(900, this.pgeCert);
                code = control.output(7);
            } else if (this.osBrowser == 6) {
                control.input5 = this.pgeCert;
                code = control.get_output6();
            }

        } catch (err) {
            code = '';
        }
    }

    //alert(code);
    return code;

}

//密码是否符合要求
PGEdit.prototype.pwdValid = function() {
        var code = '';

        if (!this.checkInstall()) {

            code = 1;
        } else {
            try {
                var control = document.getElementById(this.pgeId);
                if (this.osBrowser == 1 || this.osBrowser == 3) {
                    code = control.output5;
                } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                    code = control.output(5);
                } else if (this.osBrowser == 6) {
                    control.input5 = this.pgeCert;
                    control.get_output6();
                    code = control.get_output5();
                }

            } catch (err) {

                code = 1;

            }
        }
        if (code == 1) {
            return 1;
        } else {
            if (this.pgeType == 3) {
                if (this.pwdCharacterTypes() < 2) {
                    return 1;
                } else {
                    return 0;
                }
            } else if (this.pgeType == 4) {
                if (this.pwdCharacterTypes() != 1) {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        }
    }
    //密码hash值
PGEdit.prototype.pwdHash = function() {
        var code = '';

        if (!this.checkInstall()) {

            code = 0;
        } else {
            try {
                var control = document.getElementById(this.pgeId);
                if (this.osBrowser == 1 || this.osBrowser == 3) {
                    code = control.output2;
                } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                    code = control.output(2);
                } else if (this.osBrowser == 6) {
                    code = control.get_output2();
                }
            } catch (err) {

                code = 0;

            }
        }
        return code;
    }
    //密码长度
PGEdit.prototype.pwdLength = function() {
    var code = '';

    if (!this.checkInstall()) {

        code = 0;
    } else {
        try {
            var control = document.getElementById(this.pgeId);
            if (this.osBrowser == 1 || this.osBrowser == 3) {
                code = control.output3;
            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                code = control.output(3);
            } else if (this.osBrowser == 6) {
                code = control.get_output3();
            }
        } catch (err) {

            code = 0;

        }
    }
    return code;
}

//弱密码判断 返回1为弱密码 0不是弱密码
PGEdit.prototype.pwdSimple = function() {
    var code = '';

    if (!this.checkInstall()) {

        code = 0;
    } else {
        try {
            var control = document.getElementById(this.pgeId);
            if (this.osBrowser == 1 || this.osBrowser == 3) {
                code = control.output44;
            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                code = control.output(13);
            } else if (this.osBrowser == 6) {
                code = control.get_output10();
            }
        } catch (err) {

            code = 0;

        }
    }
    return code;
}

//密码字符类型数
PGEdit.prototype.pwdCharacterTypes = function() {
        var code = '';

        if (!this.checkInstall()) {

            code = 0;
        } else {
            try {
                var control = document.getElementById(this.pgeId);
                if (this.osBrowser == 1 || this.osBrowser == 3) {
                    code = control.output4;
                } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                    code = control.output(4);
                } else if (this.osBrowser == 6) {
                    code = control.get_output4();
                }
            } catch (err) {

                code = 0;

            }
        }
        return code;
    }
    //密码强度
PGEdit.prototype.pwdStrength = function() {

    var code = 0;

    if (!this.checkInstall()) {

        code = 0;

    } else {

        try {

            var control = document.getElementById(this.pgeId);

            if (this.osBrowser == 1 || this.osBrowser == 3) {
                var l = control.output3;
                var n = control.output4;
            } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5) {
                var l = control.output(3);
                var n = control.output(4);
            } else if (this.osBrowser == 6) {
                var l = control.get_output3();
                var n = control.get_output4();
            }
            if (l == 0) {
                code = 0;
            } else if (l < 6 || this.pwdSimple() == 1) {
                code = 1; //弱
            } else if (n == 7 && l >= 6) {
                code = 3; //强
            } else {
                code = 2; //中
            }

        } catch (err) {

            code = 0;

        }

    }
    return code;

}

//检查控件是否安装
PGEdit.prototype.checkInstall = function() {
    try {
        if (this.osBrowser == 1) {

            var comActiveX = new ActiveXObject("CMBCEdit.CMBCEditCtrl.1");
        } else if (this.osBrowser == 2 || this.osBrowser == 4 || this.osBrowser == 5 || this.osBrowser == 6 || this.osBrowser == 8) {

            var arr = new Array();
            if (this.osBrowser == 6) {
                var pge_info = navigator.plugins['CMBEditor Safari'].description;
            } else {
                var pge_info = navigator.plugins['CMBCEDIT'].description;
            }

            if (pge_info.indexOf(":") > 0) {
                arr = pge_info.split(":");
                var pge_version = arr[1];
            } else {
                var pge_version = "";
            }

        } else if (this.osBrowser == 3) {
            var comActiveX = new ActiveXObject("CMBCEditX64.CMBCEditCtrl.1");
        }
    } catch (e) {
        return false;
    }
    return true;

}

//控件版本号
PGEdit.prototype.getVersion = function() {
    try {
        if (navigator.userAgent.indexOf("MSIE") > 0 || navigator.userAgent.indexOf("msie") > 0 || navigator.userAgent.indexOf("Trident") > 0 || navigator.userAgent.indexOf("trident") > 0) {
            var control = document.getElementById(this.pgeId);
            var pge_version = control.output28;
        } else {
            var arr = new Array();
            if (this.osBrowser == 6) {
                var pge_info = navigator.plugins['CMBEditor Safari'].description;
            } else {
                var pge_info = navigator.plugins['CMBCEDIT'].description;
            }
            if (pge_info.indexOf(":") > 0) {
                arr = pge_info.split(":");
                var pge_version = arr[1];
            } else {
                var pge_version = "";
            }
        }
        return pge_version;
    } catch (e) {
        return "";
    }
}
PGEdit.prototype.setDownText = function() {
    if (this.pgeVersion != undefined && this.pgeVersion != "") {
        this.pgeDownText = "请点此升级控件";
    }
}

PGEdit.prototype.pgInitialize = function() {
    if (this.checkInstall()) {
        if (this.pgeRandomNum != undefined && this.pgeRandomNum != "") this.pwdSetSk(this.pgeRandomNum);

        var control = document.getElementById(this.pgeId);
        if (this.pgeBackColor != undefined && this.pgeBackColor != "") control.BackColor = this.pgeBackColor;
        if (this.pgeForeColor != undefined && this.pgeForeColor != "") control.ForeColor = this.pgeForeColor;

    } else {
        if (this.osBrowser == 1 || this.osBrowser == 3) {
            if (_PGEObj(this.pgeId + '_pge')) {
                _PGEObj(this.pgeId + '_pge').style.display = "none";
            }
            _PGEObj(this.pgeId + '_down').style.display = "block";

        }

    }

}

var simplehttp = require('./simplehttp');
var htmlparser = require('./htmlparser');
var TestData = require('./testdata');

var networkConnected = true;
var callbackQueue = [];
var locked = false;

exports.lock = lock;
function lock(b) {
    locked = b;
}

exports.connected = connected;
function connected() {
    return networkConnected;
}

exports.pppoeUpdate = pppoeUpdate;
function pppoeUpdate(callback, count) {
    if (locked) return false;
    if (!count) count = 0;
    var bstr = new Buffer(TestData.pppoe.user + ':' + TestData.pppoe.password).toString('base64')
    //http://admin:B3ijing19@192.168.128.1/pppoe.cgi?id=1440307927
    //192.168.128.1/BAS_pppoe.htm
    //Test=Test&login_type=PPPoE&pppoe_username=100002336592&pppoe_passwd=12213749&pppoe_servicename=&pppoe_dod=1&pppoe_idletime=5&WANAssign=Dynamic&DNSAssign=0&MACAssign=0&runtest=no&wan_ipaddr=114.249.44.136&pppoe_localip=0.0.0.0&pppoe_user_ip=...&wan_dns_sel=0&wan_dns1_pri=202.106.46.151&wan_dns1_sec=202.106.195.68&wan_hwaddr_sel=0&wan_hwaddr_def=04%3AA1%3A51%3A0F%3AA6%3A36&wan_hwaddr2=04A1510FA636&wan_hwaddr_pc=E4%3AA7%3AA0%3A51%3A51%3AC6&opendns_parental_ctrl=0&pppoe_flet_sel=fletdisable&pppoe_flet_type=0&pppoe_temp=4&pppoe_gateway=&gui_region=&pppoe_user_netmask=...&static_pppoe_enable=0&pppoe_ip_sel=0&gui_language=English&auto_time=0&ipv6_proto=&ipv6_proto_auto=&auto_conn_time_default=0

    simplehttp.GET(TestData.pppoe.url_0, {
        headers: { "Authorization": "Basic " + bstr }
    },
        function (err, httpResponse, body) {
            var id = htmlparser.getValueFromBody('pppoe.cgi?id=', '\">', body);
            //console.log("pppoeUpdate id", id)
            if (id) {
                networkConnected = false;
                simplehttp.POST(TestData.pppoe.url_1 + id, {
                    headers: { "Authorization": "Basic " + bstr },
                    form: {
                        Test: 'Test',
                        login_type: 'PPPoE',
                        pppoe_username: TestData.pppoe.pppoe_username,
                        pppoe_passwd: TestData.pppoe.pppoe_passwd,
                        pppoe_servicename: '',
                        pppoe_dod: 1,
                        pppoe_idletime: 5,
                        WANAssign: 'Dynamic',
                        DNSAssign: 0,
                        MACAssign: 0,
                        runtest: 'no',
                        wan_ipaddr: '114.249.44.136',
                        pppoe_localip: '0.0.0.0',
                        pppoe_user_ip: '...',
                        wan_dns_sel: 0,
                        wan_dns1_pri: TestData.pppoe.wan_dns1_pri,
                        wan_dns1_sec: TestData.pppoe.wan_dns1_sec,
                        wan_hwaddr_sel: 0,
                        wan_hwaddr_def: TestData.pppoe.wan_hwaddr_def,
                        wan_hwaddr2: TestData.pppoe.wan_hwaddr2,
                        wan_hwaddr_pc: TestData.pppoe.wan_hwaddr_pc,
                        opendns_parental_ctrl: 0,
                        pppoe_flet_sel: 'fletdisable',
                        pppoe_flet_type: 0,
                        pppoe_temp: 4,
                        pppoe_gateway: '',
                        gui_region: '',
                        pppoe_user_netmask: '...',
                        static_pppoe_enable: 0,
                        pppoe_ip_sel: 0,
                        gui_language: 'English',
                        auto_time: 0,
                        ipv6_proto: '',
                        ipv6_proto_auto: '',
                        auto_conn_time_default: 0
                    }
                },
                    function (err, httpResponse, body) {
                        console.log("pppoeUpdate succeed", networkConnected, new Date())
                        tryNetwork(function () {
                            networkConnected = true;
                            while (callbackQueue.length > 0) {
                                var cb = callbackQueue.shift();
                                cb(true);
                            }
                            callback(true);
                        })
                    });
            } else {
                if (count > 1) callback(false);
                pppoeUpdate(callback, ++count);
            };
        });

    return true;
}


exports.whenNetworkReady = whenNetworkReady;
function whenNetworkReady(callback) {
    if (networkConnected) callback(true);
    else callbackQueue.push(callback);
}

exports.isNetworkReady = isNetworkReady;
function isNetworkReady() {
    return networkConnected;
}

function tryNetwork(callback) {
    simplehttp.GET("https://www.lu.com", {},
        function (err, httpResponse, body) {
            if (err) {
                setTimeout(function () {
                    tryNetwork(callback)
                }, 2000)
            } else {
                //console.log("tryNetwork", body.substr(0, 20))
                callback();
            }
        });
}


// pppoeUpdate(function(){
//     simplehttp.GET("https://www.lu.com", {},
//         function (err, httpResponse, body) { 
//             console.log("tryNetwork-----------------", new Date(), body.substr(0,20))
//         });
// },0);
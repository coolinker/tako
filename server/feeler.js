var request = require("request");
var logutil = require("../logutil").config("feeler");
var simplehttp = require('../simplehttp');
var feelerController = require("./feelercontroller");
var takoIp = process.argv[2];
var services =  process.argv[3].split(',');
console.log("tako server ip:", takoIp, "services:", services);


function updateFromTako(info){
    simplehttp.POST("https://"+takoIp+"/api?action=feelerInfoIO", {
        form: {
            params: info
        }
    },
        function (err, httpResponse, body) {
            var json = JSON.parse(body);
            callback(json.result);
        });
}

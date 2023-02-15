var express = require(express);

var app = express();

var http = require('http');

var myAPIKey= 'dc55e8bbc6b73dbb17c5ecf360a0aeb1'


var options = {

    host:'weldcude.ky.local',

    port: 80,

    path:'/api/v4/Welds',

    method:'GET',

    headers: {
        "api_key": myAPIKey
      }

};

http.request(options, function(res){
    var body ='';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        var values = JSON.parse(body);
        console.log(values);
    });

}).end();
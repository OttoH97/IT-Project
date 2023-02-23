var express = require(express);
var xmlparser = require('express-xml-bodyparser');
app.use(xmlparser());

var app = express();

var http = require('http');

var myAPIKey= 'dc55e8bbc6b73dbb17c5ecf360a0aeb1'


var options = {

    host:'weldcube.ky.local',

    port: 80,

    path:'/api/v4/Welds',

    method:'GET',

    headers: {
        "api_key": myAPIKey
      }

};

router.post(options, function(req, res, next) {
    console.log('Raw XML: ' + req.rawBody);
    console.log('Parsed XML: ' + JSON.stringify(req.body));

  });

http.request(options, function(res){
    var body ='';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        var values = body;
        console.log(values);
    });

}).end();


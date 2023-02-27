var express = require('express');
var xmlparser = require('express-xml-bodyparser');
var http = require('http');
var parseString = require('xml2js').parseString; // import xml2js library for parsing XML

var app = express();

var myAPIKey = 'dc55e8bbc6b73dbb17c5ecf360a0aeb1';

app.use(xmlparser());

app.get('/welds', (req, res) => {
  const options = {
    host: 'weldcube.ky.local',
    port: 80,
    path: '/api/v4/Welds',
    method: 'GET',
    headers: {
      'api_key': myAPIKey,
      'Accept': 'application/xml'
    }
  };

  // Make API request
  http.request(options, function(response) {
    var str = '';
    response.on('data', function(chunk) {
      str += chunk;
    });

    response.on('end', function() {
      // Parse XML data using xml2js library
      parseString(str, function(err, result) {
        if (err) {
          console.error(err);
          res.status(500).send('Error parsing XML data');
        } else {
          // Send parsed XML data to React front-end
          res.send(result);
        }
      });
    });
  }).end();
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
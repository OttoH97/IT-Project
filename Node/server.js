var express = require(express);
var xmlparser = require('express-xml-bodyparser');
app.use(xmlparser());

var app = express();

var http = require('http');

var myAPIKey= 'dc55e8bbc6b73dbb17c5ecf360a0aeb1'


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
  
    http.get(options, (response) => {
      let data = '';
  
      // append incoming data to the data variable
      response.on('data', (chunk) => {
        data += chunk;
      });
  
      // when the response is complete, send the XML back to the client
      response.on('end', () => {
        res.set('Content-Type', 'application/xml');
        res.send(data);
      });
    }).on('error', (error) => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
  });
  
  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });

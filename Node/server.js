// app.js
var express = require('express');
var app = express();
const fetch = require('node-fetch');

// other Express middleware and configurations
var myAPIKey = 'dc55e8bbc6b73dbb17c5ecf360a0aeb1';



app.get('/welds', async (req, res) => {
  const url = 'http://weldcube.ky.local/api/v4/Welds';
  const headers = {
    'api_key': myAPIKey,
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
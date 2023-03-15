var express = require('express');
require('dotenv').config()
//var nodeMailer = require('nodemailer');
var app = express();
let cors = require('cors');
app.use(cors());
//const axios = require('axios');
//var http = require('http');

  //Tässä haetaan kaikki hitsit
  app.get('/welds', async (req, res) => {
    const url = 'http://weldcube.ky.local/api/v4/Welds';
    const headers = {
      'api_key': process.env.MY_API_KEY,
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

  console.log(process.env.EMAIL_PASS)

//Tässä haetaan yksittäinen hitsin lisätiedot klikkauksella
  app.get('/welds/:weldId', async (req, res) => {
    const url = `http://weldcube.ky.local/api/v4/Welds/${req.params.weldId}`;
    const headers = {
      'api_key': process.env.MY_API_KEY,
      'Accept': 'application/json',
      'Content-type' : 'application/json'
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

  //Tässä testataan POST

/*   const apiUrl = 'http://weldcube.ky.local/api/v4/Welds/{WeldID}/ChangeState'; */

  // app.post('/welds/change-state', (req, res) => {
  //   //const { WeldId, explanation, user } = req.body; // tämä ottaa frontin puolelta responsen. EI käytössä ennen kuin front valmis.
  
  //   const data = {
  //     WeldId,
  //     explanation : "testi",
  //     user : R12_K2023
  //   };
  
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     'api_key': process.env.MY_API_KEY
  //   };
  
  //   axios.post(apiUrl, data, { headers })
  //   .then(response => {
  //     res.json(response.data);
  //   })
  //   .catch(error => {
  //     console.error(error);
  //     res.status(500).json({ message: 'Internal server error' });
  //   });
  // });

  app.post('/api/v4/Welds/:weldId/ChangeState', async (req, res) => {
    const { explanation, user } = req.query;
    const url = `http://weldcube.ky.local/api/v4/Welds/${req.params.weldId}/ChangeState`;
    const headers = {
      'api_key': process.env.MY_API_KEY,
      'Accept': 'application/json',
      'Content-type' : 'application/json'
    };
    const body = {
      explanation,
      user
    };
    try {
      const response = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
      const data = await response.json();
      res.send(data);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });
  
  app.listen(4000, () => console.log('Server running on port 4000'));
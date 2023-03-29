var express = require('express');
require('dotenv').config()
var nodeMailer = require('nodemailer');
var app = express();
let cors = require('cors');
app.use(cors());
const { info } = require('console');
const axios = require('axios');
var http = require('http');
app.use(express.json());
app.use(express.urlencoded({extended:false}));


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
        console.error(error.response);
        res.status(500).send(error);
      }
    });
  
    //change state
    app.post('/api/v4/Welds/:weldId/ChangeState', async (req, res) => {
      const explanation = req.query.explanation;
      const user = req.query.user;
      const url = `http://weldcube.ky.local/api/v4/Welds/${req.params.weldId}/ChangeState?explanation=${explanation}&user=${user}`;
      console.log('url:', url);
      const headers = {
        'api_key': process.env.MY_API_KEY,
        'Accept': 'application/json',
        'Content-type' : 'application/json'
      };
  
      console.log('params:', explanation);
      try {
        const response = await axios.post(url, null, { params: null, headers });
        console.log('response:', response.data);
        res.send(response.data);
      } catch (error) {
        console.error(error);
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
        res.status(500).send(error);
      }
    });
  
    // part haku tapahtuu täällä
    app.get('/api/v4/Parts/:partItemNumber/:partSerialNumber', async (req, res) => {
      const partItemNumber = req.params.partItemNumber;
      const partSerialNumber = req.params.partSerialNumber;
    
      const apiKey = req.get('api_key');
      const acceptHeader = req.get('Accept');
      const url = `http://weldcube.ky.local/api/v4/Parts/${partItemNumber}/${partSerialNumber}`;
    
      try {
        const response = await axios.get(url, {
          headers: {
            'api_key': process.env.MY_API_KEY,
            'Accept': 'application/json',
          },
        });
    
        res.json(response.data);
      } catch (error) {
        console.error(error);
        res.status(500).send(error);
      }
    });

    //actual value haku tapahtuu täällä

  app.get('/api/v4/Welds/:weldId/ActualValues', async (req, res) => {
    const weldId = req.params.weldId;

    const url = `http://weldcube.ky.local/api/v4/Welds/${weldId}/ActualValues`;
  
    try {
      const response = await axios.get(url, {
        headers: {
          'api_key': process.env.MY_API_KEY,
          'Accept': 'application/json',
        },
      });
  
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });
    

  //section tiedot

  app.get('/api/v4/Welds/:weldId/Sections/:sectionNumber', async (req, res) => {
    const weldId = req.params.weldId;
    const sectionNumber = req.params.sectionNumber;
  
    const url = `http://weldcube.ky.local/api/v4/Welds/${weldId}/Sections/${sectionNumber}`;
  
    try {
      const response = await axios.get(url, {
        headers: {
          'api_key': process.env.MY_API_KEY,
          'Accept': 'application/json',
        },
      });
  
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });
  
/////////////////
//  EMAIL JSON //
/////////////////
//emails.json käsittelyyn

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT"],
  credentials: true
}))

const fs = require('fs');

// Route handler for modifying emails.json file
app.put('/emails', (req, res) => {
  const { emails } = req.body;

  // Check if emails property exists in the request body
  if (!emails) {
    return res.status(400).json({ message: 'Emails property missing from request body.' });
  }

  // Check if emails is an array
  if (!Array.isArray(emails)) {
    return res.status(400).json({ message: 'Emails property must be an array.' });
  }

  // Read the emails.json file
  fs.readFile('../src/components/content/emails.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Update the emails property
    jsonData.emails = emails;

    console.log(emails);

    // Write the updated data back to the emails.json file
    fs.writeFile('../src/components/content/emails.json', JSON.stringify(jsonData), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      // Send a response back to the client
      res.json({ message: 'Emails updated successfully.' });
    });
  });
});





  app.listen(4000, () => console.log('Server running on port 4000'));
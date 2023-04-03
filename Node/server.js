var express = require('express');
require('dotenv').config()
var nodeMailer = require('nodemailer');
var app = express();
let cors = require('cors');
app.use(cors());
const axios = require('axios');
var http = require('http');
app.use(express.json());
app.use(express.urlencoded({extended:false}));
const fs = require('fs');


// SÄHKÖPOSTI
let notOkCount = 0;
let sentEmails = [];

//Mailserverin luonti
const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: '587',
    secure: false,
    tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
        },
        //Autentikointiin tarvittavat tiedot .env tiedostossa. 
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/send-email', async (req, res) => { //POST metodi, sÃ¤hkÃ¶postin lÃ¤hettÃ¤miselle
  const notOkWelds = req.body.notOkWelds;
  const data = JSON.parse(fs.readFileSync('../src/components/content/emails.json')); //alustetaan recipients lukemalla json tiedosto.
  const recipients = data.emails;

  const emailPromises = [];
  const Mailoptions = {//emailin alustus
    from: 'WeldMailer123@gmail.com',
    subject: 'NotOk welds',
    html: `
    <h1>There are ${notOkWelds.length} welds with NotOk status:</h1>
    <ul>
      ${notOkWelds.map(weld => `
        <li>
          <p><strong>Weld Id:</strong> ${weld.id}</p>
          <p><strong>Part Article Number:</strong> ${weld.particle}</p>
          <p><strong>Timestamp:</strong> ${weld.time}</p>
        </li>
        <hr>
      `).join('')}
    </ul>
  `
    //text: `There are ${notOkWelds.length} welds with NotOk status:\n\n`
  };

  c
  
  notOkWelds.forEach(weld => {
    Mailoptions.text += `Weld Id: ${weld.id}, the partArticlenumber is ${weld.particle} and the timestamp was: ${weld.time}\n\n`;//kÃ¤ydÃ¤Ã¤n getistÃ¤ saadut notok hitsaukset lÃ¤pi
  });
  
 /* const filteredRecipients = {};
  for (const [name, email] of Object.entries(recipients)) {
    if (!sentEmails.some(emailInfo => emailInfo.email === email && emailInfo.weldIds.length === notOkWelds.length)) {
      filteredRecipients[name] = email;
    }
  }*/ 
  for (const [email] of Object.entries(recipients)) {
    Mailoptions.to = email;
    console.log(`Sending email to: (${email})`);
    emailPromises.push(
      transporter.sendMail(Mailoptions)
        .then(info => console.log(`Message sent: (${email}): ${info.response}`))
        .catch(error => console.error(error))
    );
  }
  if (emailPromises.length > 0) {
    // Add sent email info to sentEmails array
    const sentEmailInfo = {
      email: recipients,
      weldIds: notOkWelds.map(w => w.id)
    };
    sentEmails.push(sentEmailInfo);
  }
  Promise.all(emailPromises)
    .then(() => {
      console.log('All emails sent');
      res.send('Emails sent successfully');
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error sending emails');
    });
});

setInterval(() => {// Intervalli, joka kutsuu /weldsia tunnin vÃ¤lein. 
  fetch('http://localhost:4000/welds')
    .then(response => response.json())
    .then(data => {
      // Do something with the data
    })
    .catch(error => console.error(error));
}, 36000000);// Tunnin vÃ¤lein

//////////////////////////////
//Tässä haetaan kaikki hitsit
//////////////////////////////

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

  // Calculate the position of the weld at the time it exceeded the limit value

  function calculatePosition(actualValues, qMasterValues) {
    for (let i = 0; i < actualValues.length; i++) {
      const timestamp = actualValues[i].TimeStamp;
      const values = actualValues[i].Values;
  
      for (let j = 0; j < values.length; j++) {
        const name = values[j].Name;
        const max = values[j].Max;
        const qMasterValue = qMasterValues.find(q => q.ViolationType === name);
  
        if (qMasterValue && max > qMasterValue.CommandValue) {
          console.log("Lasketaan: " + {
            position: (timestamp - actualValues[0].TimeStamp) / 1000,
            limitType: name,
            limitValue: qMasterValue.CommandValue
          });
          return {
            position: (timestamp - actualValues[0].TimeStamp) / 1000,
            limitType: name,
            limitValue: qMasterValue.CommandValue
          };
        }
      }
    }
  
    return null;
  }

  app.get('/api/calculatePosition/:weldID', async (req, res) => {
    const { weldID } = req.params;
  
    try {
      const actualValuesResponse = await axios.get(`http://localhost:4000/api/v4/Welds/${weldID}/ActualValues`, {
        headers: {
          'api_key': process.env.MY_API_KEY,
          'Accept': 'application/json',
        },
      });
      const actualValuesData = actualValuesResponse.data.ActualValues;
      const qMasterValuesResponse = await axios.get(`http://localhost:4000/api/v4/Welds/${weldID}/Sections/${1}`, {
        headers: {
          'api_key': process.env.MY_API_KEY,
          'Accept': 'application/json',
        },
      });
      const qMasterValuesData = qMasterValuesResponse.data.QMaster.QMasterLimitValuesList;
  
      const actualValuesWithQMaster = {
        Values: actualValuesData,
        QMasterLimitValuesList: qMasterValuesData
      };
  
      const position = calculatePosition(actualValuesResponse.data, qMasterValuesResponse.data);
      console.log("position: " + position);
      res.json({ position });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  

  function getPosition(weldID) {
    console.log("getPosition: ");
    fetch(`http://localhost:4000/api/calculatePosition/${weldID}`)
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
  }
  

  getPosition("2ac2d828-66dd-418f-8368-17bc66319bad");
  
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

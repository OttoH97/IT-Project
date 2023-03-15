var express = require('express');
require('dotenv').config()
var nodeMailer = require('nodemailer');
var app = express();
let cors = require('cors');
app.use(cors());

const { info } = require('console');
const axios = require('axios');

var http = require('http');







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
//Mailoptions.to mÃ¤Ã¤ritellÃ¤Ã¤n JSON-listan mappauksessa. 
const Mailoptions  = {
    from: 'WeldMailer123@gmail.com',
    subject: 'testataan',
     
};
//TÃ¤mÃ¤ kohta korvataan erillisellÃ¤ Json tiedostolla/objektilla
const recipients = {
    'Ville Fröberg': 'viliho.fr@hotmail.com',
    'Opiskelija Ville': 'ville.froberg@edu.savonia.fi'
    
  };
//for -loopissa kÃ¤ydÃ¤Ã¤n lÃ¤pi jokainen objektissa oleva sÃ¤hkÃ¶posti
  

  app.get('/welds', async (req, res) => {
    const url = 'http://weldcube.ky.local/api/v4/welds';
    const headers = {
      'api_key': process.env.MY_API_KEY,
      'Accept': 'application/json'
    };

    
    try {
        
      const response = await fetch(url, { headers });
      const data = await response.json();
      res.send(data);
      console.log(data.WeldInfos[0].State);
      const AllWelds = [data];
      AllWelds.forEach(jsonObject=> {
        jsonObject.WeldInfos.forEach(weldInfo=>{
            const state = weldInfo.State;
            const id = weldInfo.Id;
            console.log(`State value: ${state}`);
            if(state == 'NotOk'){
            Mailoptions.text = "Ongelmia " + id + " hitsissä";
            }
            
            
        })
        
      });
      for (const [name, email] of Object.entries(recipients)) {
        Mailoptions.to = email;
        console.log("SäHKÖPOSTI "+email);
        
        

        
        transporter.sendMail(Mailoptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log(`Message sent: ${name} (${email}): ` + info.response);
          }
          sentEmails.push(id);
          console.log(sentEmails);
          console.log(sentEmails.length);
          
        });
        
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });

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

      console.log(jsonData);

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


  //Tässä testataan POST

  const apiUrl = 'http://weldcube.ky.local/api/v4/Welds/{WeldID}/ChangeState';

  app.post('/welds/change-state', (req, res) => {
    //const { WeldId, explanation, user } = req.body; // tämä ottaa frontin puolelta responsen. EI käytössä ennen kuin front valmis.
  
    const data = {
      WeldId,
      explanation : "testi",
      user : R12_K2023
    };
  
    const headers = {
      'Content-Type': 'application/json',
      'api_key': process.env.MY_API_KEY
    };
  
    axios.post(apiUrl, data, { headers })
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    });
  });
  
  app.listen(4000, () => console.log('Server running on port 4000'));
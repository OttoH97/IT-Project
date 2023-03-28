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
    //  from: 'WeldMailer123@gmail.com',
    //  subject: 'testataan',
     
};
//TÃ¤mÃ¤ kohta korvataan erillisellÃ¤ Json tiedostolla/objektilla
const recipients = {
    //  'Ville Fröberg': 'viliho.fr@hotmail.com',
    //  'Opiskelija Ville': 'ville.froberg@edu.savonia.fi'
    
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
  const { response } = require('express');

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

  // Lasketaan hitsauksen paikka

  function getWeldPosition(weldId) {
    const url = `http://weldcube.ky.local/api/v4/Welds/${weldId}`;
    const headers = {
      'api_key': process.env.MY_API_KEY,
      'Accept': 'application/json'
    };
    return fetch(url, { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(response.data);
      })
      .then(data => {
        // if (data.Errors) {
        //   console.log("Errors:", data.Errors);
        // }
        // if (data.WeldData) {
        //   console.log(data.WeldData);
        // }
        const weldingSpeed = data.WeldData.Stats.find(stat => stat.Name === "Welding speed").Mean / 60; // convert cm/min to cm/sec
        console.log("Welding Speed: " + weldingSpeed + " cm/sec (" + weldingSpeed * 60 + " cm/min)");
        const duration = data.Duration;
        console.log("Weld Duration: " + duration + " s");
        const position = weldingSpeed * duration;
        return position;
      });
  }

  /* WeldID: 
  f50d146d-9aac-4861-b03e-e3281923f861 
  60915375-a5db-4ece-84ea-709906b0031d
  de5be455-acfa-48a5-abdf-b6eb9d3e65da
  da4f459f-9443-4108-8b97-28534c80f723
  7b514c01-8a19-433b-81e1-5840c116f650*/

  getWeldPosition("60915375-a5db-4ece-84ea-709906b0031d")
  .then(position => {
    console.log(`The position of the weld is ${position} cm.`);
  })
  .catch(error => {
    console.error(`Error retrieving weld position: ${error}`);
  });

  //Tässä testataan POST

  const apiUrl = 'http://weldcube.ky.local/api/v4/Welds/{WeldID}/ChangeState';

  app.post('/welds/change-state', (req, res) => {
    //const { WeldId, explanation, user } = req.body; // tämä ottaa frontin puolelta responsen. EI käytössä ennen kuin front valmis.
  
    //change state
    app.post('/api/v4/Welds/:weldId/ChangeState', async (req, res) => {
      const explanation = req.params.explanation;
      const user = req.params.user;
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
  
});





  app.listen(4000, () => console.log('Server running on port 4000'));
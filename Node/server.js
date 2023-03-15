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
//Mailoptions.to määritellään JSON-listan mappauksessa. 
const Mailoptions  = {
    from: 'WeldMailer123@gmail.com',
    subject: 'testataan',
    text: "tämä olla viesti, jee", 
};
//Tämä kohta korvataan erillisellä Json tiedostolla/objektilla
const recipients = {
    'John Doe': 'johndoe@example.com',
    'Jane Doe': 'janedoe@example.com',
    'Bob Smith': 'bobsmith@example.com'
  };
//for -loopissa käydään läpi jokainen objektissa oleva sähköposti
  for (const [name, email] of Object.entries(recipients)) {
    Mailoptions.to = email;
    Mailoptions.text = `Hello ${name},\n\n${Mailoptions.text}`;
    
    transporter.sendMail(Mailoptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Viesti lähetetty: ${name} (${email}): ` + info.response);
      }
    });
  }

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
    
    
    
  
  app.listen(4000, () => console.log('Server running on port 4000'));
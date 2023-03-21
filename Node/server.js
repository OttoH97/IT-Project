var express = require('express');
require('dotenv').config()
var nodeMailer = require('nodemailer');
var app = express();
let cors = require('cors');
app.use(cors());
const fs = require('fs');
var http = require('http');
app.use(express.json());
app.use(express.urlencoded({extended:false}));





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
//Mailoptions.to mÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤ritellÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤n JSON-listan mappauksessa. 
const Mailoptions  = {
    from: 'WeldMailer123@gmail.com',
    subject: 'testataan',
     
};


  

app.get('/welds', async (req, res) => {//hakee kaikki hitsaukset
    const url = 'http://weldcube.ky.local/api/v4/welds';
    const headers = {
      'api_key': process.env.MY_API_KEY,
      'Accept': 'application/json'
    };
    
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      console.log(data.WeldInfos[0].State);
      const AllWelds = [data];
      const notOkWelds = [];//LisÃ¤Ã¤ kaikki hitsaukset AllWelds muuttujaan.
      
      AllWelds.forEach(jsonObject => {// kÃ¤y lÃ¤pi kaikki muuttujat
        jsonObject.WeldInfos.forEach(weldInfo => {
          const state = weldInfo.State;
          const id = weldInfo.Id;
          const stats = weldInfo.status; //tÃ¤Ã¤llÃ¤ voidaan mÃ¤Ã¤rittÃ¤Ã¤ mitÃ¤ muuttujia halutaan kÃ¤yttÃ¶Ã¶n.
          console.log(`State value: ${state}`);
          
          if (state === 'NotOk') { //Jos muuttujassa state NotOk, laitetaan se notOKwelds arraylistiin. 
            notOkWelds.push({
              id: id,
              status: weldInfo.Status
            });
          }
        })
      });
  
      if (notOkWelds.length > 0) { //arraylistin ollessa muuta kuin tyhjÃ¤ lÃ¤hdetÃ¤Ã¤n ajamaan sÃ¤hkÃ¶postin lÃ¤hetystÃ¤.
        const recipients = JSON.parse(fs.readFileSync('recipients.json')); // tÃ¤ssÃ¤ haetaan sÃ¤hkÃ¶postilistasta osoitteet, Ulkoinen JSON -tiedosto. 
        
        const emailPromises = [];
        const Mailoptions = {
          from: 'WeldMailer123@gmail.com',
          subject: 'NotOk welds',
          text: `There are ${notOkWelds.length} welds with NotOk status:\n\n`
        };
        
        notOkWelds.forEach(weld => {
          Mailoptions.text += `Weld Id: ${weld.id}\n`;
        });
        
        for (const [name, email] of Object.entries(recipients)) {
          Mailoptions.to = email;
          console.log(`Sending email to: ${name} (${email})`);
          emailPromises.push(
            transporter.sendMail(Mailoptions)
              .then(info => console.log(`Message sent: ${name} (${email}): ${info.response}`))
              .catch(error => console.error(error))
          );
        }
        
        Promise.all(emailPromises)
          .then(() => {
            console.log('All emails sent'); //lÃ¤hettÃ¤Ã¤ kaikki tiedot serveriltÃ¤.
            res.send(data);
          })
          .catch(error => {
            console.error(error);
            res.status(500).send('Error sending emails');
          });
      } else {
        console.log('No NotOk welds found');
        res.send(data);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving welds');
    }
  });

  //TÃ¤ssÃ¤ haetaan yksittÃ¤inen hitsin lisÃ¤tiedot klikkauksella
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

  //TÃ¤ssÃ¤ testataan POST

/*   const apiUrl = 'http://weldcube.ky.local/api/v4/Welds/{WeldID}/ChangeState'; */

  // app.post('/welds/change-state', (req, res) => {
  //   //const { WeldId, explanation, user } = req.body; // tÃ¤mÃ¤ ottaa frontin puolelta responsen. EI kÃ¤ytÃ¶ssÃ¤ ennen kuin front valmis.
  
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

  // part haku tapahtuu tÃ¤Ã¤llÃ¤

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
  
  
  app.listen(4000, () => console.log('Server running on port 4000'));
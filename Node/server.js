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
app.post('/send-email', async (req, res) => { //POST metodi, sähköpostin lähettämiselle
  const notOkWelds = req.body.notOkWelds;
  const recipients = JSON.parse(fs.readFileSync('recipients.json')); //alustetaan recipients lukemalla json tiedosto.

  const emailPromises = [];
  const Mailoptions = {//emailin alustus
    from: 'WeldMailer123@gmail.com',
    subject: 'NotOk welds',
    text: `There are ${notOkWelds.length} welds with NotOk status:\n\n`
  };
  
  notOkWelds.forEach(weld => {
    Mailoptions.text += `Weld Id: ${weld.id}\n`;//käydään getistä saadut notok hitsaukset läpi
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
      console.log('All emails sent');
      res.send('Emails sent successfully');
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error sending emails');
    });
});


  

app.get('/welds', async (req, res) => {
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
    const notOkWelds = new Set();
    
    AllWelds.forEach(jsonObject => {
      jsonObject.WeldInfos.forEach(weldInfo => {
        const state = weldInfo.State;
        const id = weldInfo.Id;
        const stats = weldInfo.status;
        console.log(`State value: ${state}`);
        
        if (state === 'NotOk') {// jos state on NotOk laitetaan noOkWelds arraylistiin. 
          notOkWelds.add(JSON.stringify({
            id: id,
            //status: weldInfo.Status
          }));
        }
      })
    });

    const uniqueNotOkWelds = Array.from(notOkWelds).map(w => JSON.parse(w));
    console.log(`Found ${uniqueNotOkWelds.length} unique NotOk welds.`);

    if (uniqueNotOkWelds.length > 0) { //uniqueNotOkWeldsin ollessa muuta kuin tyhjä, lähdetään kutsumaan sähköpostin lähetys postmetodia. 
      // Send email to recipients
      const response = await fetch('http://localhost:4000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notOkWelds: uniqueNotOkWelds })
      });
      const emailResponse = await response.text();
      console.log(emailResponse);
    } else {
      console.log('No NotOk welds found');
    }

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving welds');
  }
  
})
setInterval(() => {// Intervalli, joka kutsuu /weldsia tunnin välein. 
  fetch('http://localhost:4000/welds')
    .then(response => response.json())
    .then(data => {
      // Do something with the data
    })
    .catch(error => console.error(error));
}, 36000000);// Tunnin vÃ¤lein

  //TÃƒÂ¤ssÃƒÂ¤ haetaan yksittÃƒÂ¤inen hitsin lisÃƒÂ¤tiedot klikkauksella
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

  //TÃƒÂ¤ssÃƒÂ¤ testataan POST

/*   const apiUrl = 'http://weldcube.ky.local/api/v4/Welds/{WeldID}/ChangeState'; */

  // app.post('/welds/change-state', (req, res) => {
  //   //const { WeldId, explanation, user } = req.body; // tÃƒÂ¤mÃƒÂ¤ ottaa frontin puolelta responsen. EI kÃƒÂ¤ytÃƒÂ¶ssÃƒÂ¤ ennen kuin front valmis.
  
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

  // part haku tapahtuu tÃƒÂ¤ÃƒÂ¤llÃƒÂ¤

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
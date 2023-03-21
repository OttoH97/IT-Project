var express = require('express');
require('dotenv').config()
var nodeMailer = require('nodemailer');
var app = express();
let cors = require('cors');
app.use(cors());
const fs = require('fs');
var http = require('http');





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
//Mailoptions.to mÃƒÂ¤ÃƒÂ¤ritellÃƒÂ¤ÃƒÂ¤n JSON-listan mappauksessa. 
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
      const notOkWelds = [];//Lisää kaikki hitsaukset AllWelds muuttujaan.
      
      AllWelds.forEach(jsonObject => {// käy läpi kaikki muuttujat
        jsonObject.WeldInfos.forEach(weldInfo => {
          const state = weldInfo.State;
          const id = weldInfo.Id;
          const stats = weldInfo.status;
          console.log(`State value: ${state}`);
          
          if (state === 'NotOk') { //Jos muuttujassa state NotOk, laitetaan se notOKwelds arraylistiin. 
            notOkWelds.push({
              id: id,
              status: weldInfo.Status
            });
          }
        })
      });
  
      if (notOkWelds.length > 0) { //arraylistin ollessa muuta kuin tyhjä lähdetään ajamaan sähköpostin lähetystä.
        const recipients = JSON.parse(fs.readFileSync('recipients.json')); // tässä haetaan sähköpostilistasta osoitteet, Ulkoinen JSON -tiedosto. 
        
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
            console.log('All emails sent');
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
  
  
  app.listen(4000, () => console.log('Server running on port 4000'));
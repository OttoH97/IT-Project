var express = require('express');
require('dotenv').config()
var nodeMailer = require('nodemailer');
var app = express();
let cors = require('cors');
app.use(cors());

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
  
  
  app.listen(4000, () => console.log('Server running on port 4000'));
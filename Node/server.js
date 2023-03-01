var express = require('express');
require('dotenv').config()
var nodeMailer = require('nodemailer');
var app = express();
let cors = require('cors');
app.use(cors());

var http = require('http');








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
      console.log(data.WeldInfos[0].State);
      const AllWelds = [data];
      AllWelds.forEach(jsonObject=> {
        jsonObject.WeldInfos.forEach(weldInfo=>{
            const state = weldInfo.State;
            console.log(`State value: ${state}`);
        })
      })
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });
  
  app.listen(4000, () => console.log('Server running on port 4000'));
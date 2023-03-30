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
app.post('/send-email', async (req, res) => { //POST metodi, sÃƒÂ¤hkÃƒÂ¶postin lÃƒÂ¤hettÃƒÂ¤miselle
  const notOkWelds = req.body.notOkWelds;
  const recipients = JSON.parse(fs.readFileSync('../src/components/content/emails.json')); //alustetaan recipients lukemalla json tiedosto.

  const emailPromises = [];
  const Mailoptions = {
    from: 'WeldMailer123@gmail.com',
    subject: 'NotOk welds',
    html: `
      <h1>There are ${notOkWelds.length} welds with NotOk status:</h1>
      <table style="border-collable: collapse; width: 50%; margin: 0 auto;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-size: 16px; text-align: left;">Weld Id</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-size: 16px; text-align: left;">Part Article Number</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-size: 16px; text-align: left;">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${notOkWelds.map(weld => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;font-size: 14px;">${weld.id}</td>
              <td style="border: 1px solid #ddd; padding: 8px;font-size: 14px;">${weld.particle}</td>
              <td style="border: 1px solid #ddd; padding: 8px;font-size: 14px;">${weld.time}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  };

  notOkWelds.forEach(weld => {
    Mailoptions.text += `Weld Id: ${weld.id}, the partArticlenumber is ${weld.particle} and the timestamp was: ${weld.time}\n\n`;//kÃƒÂ¤ydÃƒÂ¤ÃƒÂ¤n getistÃƒÂ¤ saadut notok hitsaukset lÃƒÂ¤pi
  });
  
 /* const filteredRecipients = {};
  for (const [name, email] of Object.entries(recipients)) {
    if (!sentEmails.some(emailInfo => emailInfo.email === email && emailInfo.weldIds.length === notOkWelds.length)) {
      filteredRecipients[name] = email;
    }
  }*/ 
  for (const [name, email] of Object.entries(recipients)) {
    Mailoptions.to = email;
    console.log(`Sending email to: ${name} (${email})`);
    emailPromises.push(
      transporter.sendMail(Mailoptions)
        .then(info => console.log(`Message sent: ${name} (${email}): ${info.response}`))
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
        const timestamp = weldInfo.Timestamp;
        var tomonth=new Date(timestamp).getMonth()+1;
        var toyear=new Date(timestamp).getFullYear();
        var todate=new Date(timestamp).getDate();
        var hours = new Date(timestamp).getHours();
        var minutes = new Date(timestamp).getMinutes();
        minutes = minutes <= 9 ? '0' + minutes : minutes;
        var original_date=todate+'.'+tomonth+'.'+toyear + " " + hours + ":"+minutes;
        const particle = weldInfo.PartArticleNumber;

        console.log(`AIKA VALUE: ${original_date}`);
        
        if (state === 'NotOk') {// jos state on NotOk laitetaan noOkWelds arraylistiin. 
          notOkWelds.add(JSON.stringify({
            id: id,
            time: original_date,
            particle: particle,
            //status: weldInfo.Status
          }));
        }
      })
    });

    const uniqueNotOkWelds = Array.from(notOkWelds).map(w => JSON.parse(w));
    console.log(`Found ${uniqueNotOkWelds.length} unique NotOk welds.`);

    const newNotOkWelds = uniqueNotOkWelds.filter(w => !sentEmails.some(emailInfo => emailInfo.weldIds.includes(w.id)));
    if (newNotOkWelds.length > 0) { //newNotOkWeldsin ollessa muuta kuin tyhjÃƒÂ¤, lÃƒÂ¤hdetÃƒÂ¤ÃƒÂ¤n kutsumaan sÃƒÂ¤hkÃƒÂ¶postin lÃƒÂ¤hetys postmetodia. 
      // Send email to recipients
      const response = await fetch('http://localhost:4000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notOkWelds: newNotOkWelds })
      });
      const emailResponse = await response.text();
      console.log(emailResponse);
    } else {
      console.log('No new NotOk welds found');
    }

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving welds');
  }
  
})
setInterval(() => {// Intervalli, joka kutsuu /weldsia tunnin vÃƒÂ¤lein. 
  fetch('http://localhost:4000/welds')
    .then(response => response.json())
    .then(data => {
      // Do something with the data
    })
    .catch(error => console.error(error));
}, 36000000);// Tunnin vÃƒÂ¤lein

  //tÃƒÂ¤ÃƒÂ¤llÃƒÂ¤ haetaan yksittÃƒÂ¤inen hitsin lisÃƒÆ’Ã‚Â¤tiedot klikkauksella
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

  //tÃƒÂ¤ÃƒÂ¤llÃƒÂ¤ testataan POST

/*   const apiUrl = 'http://weldcube.ky.local/api/v4/Welds/{WeldID}/ChangeState'; */

  // app.post('/welds/change-state', (req, res) => {
  //   //const { WeldId, explanation, user } = req.body; //  ottaa frontin puolelta responsen. EI kÃƒÂ¤ytettÃƒÂ¤vissÃƒÂ¤ ennen kuin front valmis.
  
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

  // part haku tapahtuu tÃƒÂ¤ssÃƒÂ¤

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
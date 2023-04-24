var express = require('express');
require('dotenv').config()
var nodeMailer = require('nodemailer');
var app = express();
let cors = require('cors');
app.use(cors());
const axios = require('axios');
var http = require('http');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const fs = require('fs');


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
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
app.post('/send-email', async (req, res) => { //POST metodi, sÃƒÆ’Ã‚Â¤hkÃƒÆ’Ã‚Â¶postin lÃƒÆ’Ã‚Â¤hettÃƒÆ’Ã‚Â¤miselle
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
    Mailoptions.text += `Weld Id: ${weld.id}, the partArticlenumber is ${weld.particle} and the timestamp was: ${weld.time}\n\n`;//kÃƒÆ’Ã‚Â¤ydÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤n getistÃƒÆ’Ã‚Â¤ saadut notok hitsaukset lÃƒÆ’Ã‚Â¤pi
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

setInterval(() => {// Intervalli, joka kutsuu /weldsia tunnin vÃƒÂ¤lein. 
  fetch('http://localhost:4000/allwelds')
    .then(response => response.json())
    .then(data => {
      // Do something with the data
    })
    .catch(error => console.error(error));
}, 36000000);// Tunnin vÃƒÂ¤lein

//////////////////////////////
//TÃ¤ssÃ¤ haetaan kaikki hitsit
//////////////////////////////

app.get('/welds', async (req, res) => {
  const url = 'http://weldcube.ky.local/api/v4/Welds';
  const headers = {
    'api_key': process.env.MY_API_KEY,
    'Accept': 'application/json'
  };
  const pageSize = Number(req.query.pageSize) || 10; // Default page size is 10
  const pageNumber = Number(req.query.pageNumber) || 1; // Default page number is 1
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = pageNumber * pageSize;
  const filter = req.query.filter;

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    let filteredWelds = data.WeldInfos;

    if (filter && filter !== 'all') {
      const allowedStates = filter === 'Ok' || filter === 'OkEdited' ? ['Ok', 'OkEdited'] : ['NotOk', 'NotOkEdited'];
      filteredWelds = filteredWelds.filter((weld) => allowedStates.includes(weld.State));
    }

    const welds = filteredWelds.slice(startIndex, endIndex);

    const weldsDetailsPromises = welds.map((weld) =>
      fetch(`http://weldcube.ky.local/api/v4/Welds/${weld.Id}`, { headers })
        .then((response) => response.json())
        .then((detailsData) => {
          return {
            Id: weld.Id,
            State: weld.State,
            Timestamp: weld.Timestamp,
            Duration: detailsData.Duration,
            PartSerialNumber: weld.PartSerialNumber,
            PartArticleNumber: weld.PartArticleNumber,
            ProcessingStepNumber: weld.ProcessingStepNumber,
            Errors: detailsData.Errors,
            LimitViolations: detailsData.LimitViolations,
            Details: detailsData.WeldData
          };
        })
    );

    const weldsWithDetails = await Promise.all(weldsDetailsPromises);
    const totalCount = filteredWelds.length;
    const totalOk = filteredWelds.filter((weld) => weld.State === 'Ok' || weld.State === 'OkEdited').length;
    const totalNotOk = filteredWelds.filter((weld) => weld.State === 'NotOk' || weld.State === 'NotOkEdited').length;
    const totalPages = Math.ceil(totalCount / pageSize);

    res.send({
      welds: weldsWithDetails,
      pageNumber,
      pageSize,
      totalPages,
      totalCount,
      totalOk,
      totalNotOk
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
//////////////////////////////
//TÃ¤ssÃ¤ haetaan kaikki hitsit sÃ¤hkÃ¶postin lÃ¤hettÃ¤mistÃ¤ varten
//////////////////////////////

app.get('/allwelds', async (req, res) => {
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
    if (newNotOkWelds.length > 0) { //newNotOkWeldsin ollessa muuta kuin tyhjÃƒÆ’Ã‚Â¤, lÃƒÆ’Ã‚Â¤hdetÃƒÆ’Ã‚Â¤ÃƒÆ’Ã‚Â¤n kutsumaan sÃƒÆ’Ã‚Â¤hkÃƒÆ’Ã‚Â¶postin lÃƒÆ’Ã‚Â¤hetys postmetodia. 
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

//TÃ¤ssÃ¤ haetaan yksittÃ¤inen hitsin lisÃ¤tiedot klikkauksella
app.get('/welds/:weldId', async (req, res) => {
  const url = `http://weldcube.ky.local/api/v4/Welds/${req.params.weldId}`;
  const headers = {
    'api_key': process.env.MY_API_KEY,
    'Accept': 'application/json',
    'Content-type': 'application/json'
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
    'Content-type': 'application/json'
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

//actual value haku tapahtuu tÃ¤Ã¤llÃ¤

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

//Santeri sections
app.get('/welds/:weldId/Sections', async (req, res) => {
  const weldId = req.params.weldId;
  const url = `http://weldcube.ky.local/api/v4/Welds/${weldId}`;
  const headers = {
    'api_key': process.env.MY_API_KEY,
    'Accept': 'application/json',
    'Content-type': 'application/json'
  };

  try {
    const response = await axios.get(url, { headers });
    const sections = response.data.WeldData.Sections;
    const sectionDetails = [];
    let previousDuration = 0;

    // Include ActualValues array from the additional API endpoint
    const actualValuesUrl = `http://weldcube.ky.local/api/v4/Welds/${weldId}/ActualValues`;
    const actualValuesResponse = await axios.get(actualValuesUrl, { headers });
    const actualValues = actualValuesResponse.data.ActualValues;

    for (let i = 0; i < sections.length; i++) {
      const sectionNumber = sections[i].SectionNumber;
      const sectionUrl = sections[i].Details.replace('{sectionid}', sectionNumber);
      const sectionResponse = await axios.get(sectionUrl, { headers });
      const sectionData = sectionResponse.data;

      // Skip section if QMaster is not found
      if (sectionData.SingleValueStats[5].Value === "0") {
        i - 1;
        continue;
      }

      // Filter ActualValues array based on TimeStamp value
      const filteredActualValues = actualValues.filter(value => {
        if (i === 0) {
          return value.TimeStamp < sectionData.SingleValueStats[5].Value;
        } else {
          return value.TimeStamp < sectionData.SingleValueStats[5].Value;
        }
      });

      sectionData.ActualValues = filteredActualValues;
      sectionDetails.push(sectionData);
    }

    // Create a new object with SectionDetails and ActualValues
    const result = {
      ActualValues: actualValues,
      SectionDetails: sectionDetails
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

/////////////////
//  EMAIL JSON //
/////////////////
//emails.json kÃ¤sittelyyn

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





app.listen(4000, () => console.log('Server running on port 4000'));
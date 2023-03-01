var express = require('express');
var nodeMailer = require('nodemailer');
var app = express();
let cors = require("cors");
app.use(cors());

// other Express middleware and configurations
var myAPIKey = 'dc55e8bbc6b73dbb17c5ecf360a0aeb1';





//Mailserverin luonti
const transporter = nodeMailer.createTransport({
    host: 'smtp.office365.com',
    port: '587',
    secure: false,
    tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
        },
        //Outlookilla lähettäessä tarvitsee autentikoinnin, salasanan jätin poies
    auth:{
        user:'viliho.fr@hotmail.com',
        pass:''
    }
});
const Mailoptions  = {
    from: 'viliho.fr@hotmail.com',
    to: 'ville.froberg@edu.savonia.fi',
    subject: 'testataan',
    text: "tämä olla viesti, jee", 
};
//transporterin avulla lähettäminen
transporter.sendMail(Mailoptions, function(err, info){
    if(err){
        console.log(err);
        return;
    }
    console.log("Lähetetty " + info.response);
})


const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });




app.get('/welds', async (req, res) => {
  const url = 'http://weldcube.ky.local/api/v4/Welds';
  const headers = {
    'api_key': myAPIKey,
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



http.request(options, function(res){
    var body ='';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        var values = body;
        console.log(values);
    });

}).end()

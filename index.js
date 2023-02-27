require('dotenv').config()
const twilio = require("twilio");
const bodyParser = require("body-parser");
const MessagingResponse = twilio.twiml.MessagingResponse;

const express = require("express");
const app = express();

const sdk = require('api')('@writesonic/v2.2#4enbxztlcbti48j');
sdk.auth(process.env.CHAT_API_KEY);
const port = 3000;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
console.log(" auth ", accountSid, " - > ", authToken)
const client = require('twilio')(accountSid, authToken, {
  logLevel: 'debug'
});

// client.messages 
//         .create({ 
//            body: 'Hello! This is an editable text message. You are free to change it and write whatever you like.', 
//            from: 'whatsapp:+14155238886',       
//            to: 'whatsapp:+918655714226' 
//          }) 
//         .then(message => console.log(message.sid)) 

app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post('/incoming', async (req, res) => {
  console.log("message")
  const twiml = new MessagingResponse();
  // console.log(twiml)
  let response;
  await sdk.chatsonic_V2BusinessContentChatsonic_post({
    enable_google_results: true,
    enable_memory: false,
    input_text: req.body.Body
  }, { engine: 'premium' })
    .then(({ data }) => {
      response = data.message;
    })
    .catch(err => {
      response = err;
    });
  console.log(response);
  const clmes = await client.messages 
        .create({ 
           body: response, 
           from: 'whatsapp:+14155238886',       
           to: 'whatsapp:+918655714226' 
         }) 

  console.log(clmes.sid)
  // await twiml.message(response);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  // console.log("Message sent! ")
  res.end(twiml.toString());
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Test direct de Twilio
// Remplacez ces valeurs par vos vraies credentials Twilio

const TWILIO_ACCOUNT_SID = 'VOTRE_ACCOUNT_SID'; // AC...
const TWILIO_AUTH_TOKEN = 'VOTRE_AUTH_TOKEN';
const TWILIO_PHONE_NUMBER = 'VOTRE_NUMERO'; // +1...
const TO_PHONE = '+14782104764';

const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

const formData = new URLSearchParams();
formData.append('From', TWILIO_PHONE_NUMBER);
formData.append('To', TO_PHONE);
formData.append('Body', 'Test LastMinuteJob - Code: 123456');

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: formData.toString(),
})
.then(res => res.json())
.then(data => {
  console.log('Success:', data);
})
.catch(err => {
  console.error('Error:', err);
});

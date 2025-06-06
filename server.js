const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/send-quote', async (req, res) => {
  const { partNumber, quantity, shippingAddress, addressType, deadline, email, phone } = req.body;

  const quoteDetails = `
New Quote Request:
Part #: ${partNumber}
Quantity: ${quantity}
Shipping Address: ${shippingAddress} (${addressType})
Needed By: ${deadline}
Customer Email: ${email}
Customer Phone: ${phone}
  `;

  // Gmail Email Setup
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS  // use App Password if 2FA is enabled
    }
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: 'andrew@toolfetch.com',
    subject: 'New Toolfetch Quote Request',
    text: quoteDetails
  });

  // Twilio SMS Setup
  const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: quoteDetails,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: '+16463692079'
  });

  res.send({ status: 'Quote sent!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));

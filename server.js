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

  try {
    // Gmail Email Setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,  // customer
      bcc: 'andrew@toolfetch.com',  // internal copy
      subject: 'Your Toolfetch Quote Request',
      text: `Thanks for your request! Here are the details you submitted:\n\n${quoteDetails}`
    });
  } catch (err) {
    console.error('Email send error:', err.message);
    return res.status(500).json({ error: 'Failed to send quote email.' });
  }

  try {
    // Twilio SMS Setup
    const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: quoteDetails,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
  } catch (err) {
    console.error('SMS send error:', err.message);
    return res.status(500).json({ error: 'Email sent but failed to send SMS.' });
  }

  res.send({ status: 'Quote sent via email and SMS!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));

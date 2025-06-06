const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/send-quote', async (req, res) => {
  try {
    const {
      partNumber,
      quantity,
      shippingAddress,
      addressType,
      deadline,
      email,
      phone,
      part_number,
      shipping_address,
      residential,
      delivery_date
    } = req.body;

    const resolvedPart = partNumber || part_number;
    const resolvedAddress = shippingAddress || shipping_address;
    const resolvedType = addressType || (residential ? 'Residential' : 'Commercial');
    const resolvedDeadline = deadline || delivery_date;

    if (!resolvedPart || !quantity || !resolvedAddress || !email || !phone) {
      return res.status(400).send({ error: 'Missing required fields' });
    }

    const quoteDetails = `
New Quote Request:
Part #: ${resolvedPart}
Quantity: ${quantity}
Shipping Address: ${resolvedAddress} (${resolvedType})
Needed By: ${resolvedDeadline || 'Not specified'}
Customer Email: ${email}
Customer Phone: ${phone}
    `;

    console.log('Quote received for:', resolvedPart, 'to', email);

    // Email Setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'andrew@toolfetch.com',
      subject: 'New Toolfetch Quote Request',
      text: quoteDetails
    });

    // SMS Setup
    const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
    
    await client.messages.create({
      body: quoteDetails,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    res.send({ status: 'Quote sent!' });
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).send({ error: 'Failed to send quote' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

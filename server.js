app.post('/send-quote', async (req, res) => {
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

  const quoteDetails = `
New Quote Request:
Part #: ${resolvedPart}
Quantity: ${quantity}
Shipping Address: ${resolvedAddress} (${resolvedType})
Needed By: ${resolvedDeadline || 'Not specified'}
Customer Email: ${email}
Customer Phone: ${phone}
  `;

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

  const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: quoteDetails,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: '+16463692079'
  });

  res.send({ status: 'Quote sent!' });
});

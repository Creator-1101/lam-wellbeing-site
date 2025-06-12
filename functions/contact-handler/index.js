// index.js
const functions  = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');
const nodemailer = require('nodemailer');

// Initialize Firestore client to use your named database "contact-db"
const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,  // e.g. "project-mimi-462709"
  databaseId: 'contact-db'                       // your custom DB name
});

// Configure Nodemailer to use Gmail via App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // "lamwellbeing1101@gmail.com"
    pass: process.env.GMAIL_PASS   // your 16-char App Password
  }
});

// Define the HTTP Cloud Function
functions.http('handleContactForm', async (req, res) => {
  if (req.method !== 'POST') {
    res.set('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const { name, email, phone, message } = req.body;

  try {
    // 1) Save submission into your "contact-db" Firestore database
    await db.collection('contacts').add({
      name,
      email,
      phone: phone || null,
      message,
      submittedAt: Firestore.FieldValue.serverTimestamp()
    });

    // 2) Prepare HTML email
    const html = `
      <h2>📬 New “Contact Us” Submission</h2>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone || '—'}</li>
      </ul>
      <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <small>Sent at: ${new Date().toLocaleString()}</small>
    `;

    // 3) Send email via Gmail
    await transporter.sendMail({
      from: process.env.GMAIL_USER,        // your Gmail address
      to:   process.env.SUPPORT_EMAIL,     // e.g. lamwellbeing1101@gmail.com
      subject: 'New Contact Us Submission',
      html
    });

    // 4) Respond to client
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error handling contact form:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

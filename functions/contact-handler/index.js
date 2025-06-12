// index.js
const functions  = require('@google-cloud/functions-framework');
const { Firestore, FieldValue } = require('@google-cloud/firestore');
const nodemailer = require('nodemailer');

// Initialize Firestore client to use your named database "contact-db"
const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  databaseId: 'contact-db'
});

// Configure Nodemailer to use Gmail via App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// HTTP Cloud Function with CORS support
functions.http('handleContactForm', async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight handling
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.set('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const { name, email, phone, message } = req.body;

  try {
    // 1) Save to Firestore
    await db.collection('contacts').add({
      name,
      email,
      phone: phone || null,
      message,
      submittedAt: FieldValue.serverTimestamp()
    });

    // 2) Build HTML email using your template
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lam Wellbeing Contact Submission</title>
  <style>
    body { margin:0; padding:0; background:#f2f2f2; }
    .email-container { max-width:620px; margin:30px auto; background:#fff; border-radius:8px; overflow:hidden; font-family:'Montserrat',Arial,sans-serif; color:#333; box-shadow:0 4px 12px rgba(0,0,0,0.1);}    
    .header { background:#FDEBEA; padding:16px; text-align:center; border-bottom:1px solid #E9D8D0; }
    .header img { max-width:120px; height:auto; }
    .header h2 { margin:12px 0 0; font-size:24px; color:#333; }
    .content { padding:24px; margin-top:16px; }
    .data-table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    .data-table td { vertical-align:middle; padding:6px 0; }
    .data-table td.label { width:120px; font-weight:600; color:#555; text-align:right; padding-right:12px; }
    .message-card { background:#FAF9F8; border-left:4px solid #C45C4B; padding:16px; border-radius:4px; margin-bottom:20px; }
    .actions { text-align:center; margin-bottom:24px; }
    .actions a { display:inline-block; margin:0 6px; padding:10px 18px; background:#C45C4B; color:#fff; border-radius:4px; font-weight:500; font-size:14px; text-decoration:none; }
    .actions a:hover { background:#A34237; }
    .footer { background:#fff; padding:24px; font-size:12px; color:#777; border-top:1px solid #E9D8D0; }
    .footer-table { width:100%; border-collapse:collapse; margin-bottom:12px; }
    .footer-table td { vertical-align:top; padding:0 12px; }
    .footer-table h4 { margin:0 0 6px; font-size:14px; color:#333; font-weight:600; }
    .footer-table a { color:#C45C4B; display:block; margin-bottom:4px; font-size:13px; }
    .social-icons img { width:20px; margin:0 4px; vertical-align:middle; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://storage.googleapis.com/lamwellbeing-assets/lam-logo.png" alt="Lam Wellbeing Logo">
      <h2>New Contact Us Submission</h2>
    </div>
    <div class="content">
      <table class="data-table">
        <tr><td class="label">👤 Name:</td><td>${name}</td></tr>
        <tr><td class="label">📧 Email:</td><td><a href="mailto:${email}" style="color:#C45C4B;">${email}</a></td></tr>
        <tr><td class="label">📞 Phone:</td><td><a href="tel:${phone}" style="color:#C45C4B;">${phone}</a></td></tr>
      </table>
      <div class="message-card">
        <strong>💬 Message:</strong>
        <p style="margin:8px 0; line-height:1.5;">${message.replace(/\n/g,'<br>')}</p>
      </div>
      <div class="actions">
        <a href="tel:${phone}">Call ${name}</a>
        <a href="mailto:${email}?subject=Re:%20Your%20Enquiry">Email ${name}</a>
      </div>
    </div>
    <div class="footer">
      <table class="footer-table">
        <tr>
          <td>
            <h4>Contact</h4>
            <a href="tel:+447972275563">+44 07972 275 563</a>
            <a href="mailto:liliandmayawellbeing@gmail.com">liliandmayawellbeing@gmail.com</a>
          </td>
          <td>
            <h4>Quick Links</h4>
            <a href="#">Home</a>
            <a href="#">Offerings</a>
            <a href="#">Events</a>
            <a href="#">Contact</a>
          </td>
          <td>
            <h4>Follow Us</h4>
            <div class="social-icons">
              <a href="https://facebook.com/lamwellbeing"><img src="https://storage.googleapis.com/lamwellbeing-assets/facebook.png" alt="Facebook"></a>
              <a href="https://instagram.com/lamwellbeing"><img src="https://storage.googleapis.com/lamwellbeing-assets/instagram.png" alt="Instagram"></a>
              <a href="https://tiktok.com/@lamwellbeing"><img src="https://storage.googleapis.com/lamwellbeing-assets/tiktok.png" alt="TikTok"></a>
            </div>
          </td>
        </tr>
      </table>
      <p style="margin-top:12px; font-size:10px; color:#aaa;">&copy; 2025 Lam Wellbeing. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

    // 3) Send email
    await transporter.sendMail({
      from:    process.env.GMAIL_USER,
      to:      process.env.SUPPORT_EMAIL,
      subject: 'New Contact Us Submission',
      html
    });

    // 4) Success response
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error handling contact form:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

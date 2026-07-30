const nodemailer = require("nodemailer");

// Generic SMTP transport - works with Brevo, SendGrid, Mailgun, or any
// transactional email provider's SMTP relay. Gmail's own SMTP
// (smtp.gmail.com) is deliberately avoided here: Google frequently blocks or
// times out direct SMTP connections coming from cloud host IP ranges
// (Render, Railway, Heroku, etc.) as an anti-spam measure, which is why
// registration/order emails were timing out in production.
let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587/2525
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000, // fail fast instead of hanging for minutes
    });
  }
  return transporter;
};

const sendEmail = async (to, subject, message, html) => {
  try {
    const mailOptions = {
      from: `"ShopNest" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
      ...(html ? { html } : {}),
    };

    await getTransporter().sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = { sendEmail };

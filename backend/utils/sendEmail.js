
const nodemailer = require("nodemailer");

// Created once and reused across calls instead of per-email.
let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async (to, subject, message, html) => {
  try {
    const mailOptions = {
      from: `"ShopNest" <${process.env.EMAIL_USER}>`,
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
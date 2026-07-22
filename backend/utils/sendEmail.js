const NodeMailer = require('nodemailer');

const sendEmail = async (to, subject, message) => {
    try{
    const transporter = NodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: message
    };

    await transporter.sendMail(mailOptions);
}
catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
};
}
module.exports = { sendEmail };
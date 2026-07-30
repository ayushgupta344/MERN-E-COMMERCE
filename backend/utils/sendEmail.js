// Uses Brevo's HTTP Transactional Email API instead of SMTP.
//
// Render's free web services block ALL outbound SMTP ports (25, 465, 587) -
// this applies regardless of which SMTP provider you point at, which is why
// switching from Gmail to Brevo's SMTP relay still timed out. Only a paid
// Render instance lifts that restriction. The HTTP API sidesteps the problem
// entirely: it's a normal HTTPS POST request on port 443, same as any other
// API call, so it works fine on the free tier.
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendEmail = async (to, subject, message, html) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not set");
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: "ShopNest",
        email: process.env.EMAIL_FROM,
      },
      to: [{ email: to }],
      subject,
      textContent: message,
      ...(html ? { htmlContent: html } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Brevo API error (${response.status}):`, errorBody);
    throw new Error("Email could not be sent");
  }
};

module.exports = { sendEmail };

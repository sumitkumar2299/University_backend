const axios = require('axios');

async function sendEmail({ to, subject, html }) {
  return axios.post(
    'https://send.api.mailtrap.io/api/send',
    {
      from: {
        email: process.env.MAILTRAP_SENDER_EMAIL,
        name: process.env.MAILTRAP_SENDER_NAME
      },
      to: [{ email: to }],
      subject,
      html
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.MAILTRAP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

module.exports = { sendEmail }; 
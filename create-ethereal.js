const nodemailer = require('nodemailer');

async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log("SMTP_HOST=" + testAccount.smtp.host);
    console.log("SMTP_PORT=" + testAccount.smtp.port);
    console.log("SMTP_USER=" + testAccount.user);
    console.log("SMTP_PASS=" + testAccount.pass);
    console.log("ETHEREAL_WEB=" + testAccount.web);
  } catch (err) {
    console.error(err);
  }
}

createTestAccount();

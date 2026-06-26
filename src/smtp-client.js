const nodemailer = require('nodemailer');

function createTransporter(config) {
  return nodemailer.createTransport({
    host: config.server,
    port: config.smtp_port || 465,
    secure: config.ssl !== false,
    auth: {
      user: config.account,
      pass: config.password
    }
  });
}

async function sendMail(config, options) {
  const transporter = createTransporter(config);
  try {
    const info = await transporter.sendMail({
      from: options.from || config.account,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    });
    return {
      ok: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };
  } catch (err) {
    return { ok: false, error: err.message };
  } finally {
    transporter.close();
  }
}

async function testSmtp(config) {
  const transporter = createTransporter(config);
  try {
    const verified = await transporter.verify();
    return { ok: verified, server: config.server, port: config.smtp_port || 465 };
  } catch (err) {
    return { ok: false, error: err.message };
  } finally {
    transporter.close();
  }
}

module.exports = { sendMail, testSmtp };

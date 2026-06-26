const config = require('../config');
const smtp = require('../smtp-client');

async function sendMessage(args) {
  const cfg = config.load();
  if (!config.isConfigured()) {
    return { ok: false, error: '未配置' };
  }
  if (!args.to) {
    return { ok: false, error: '缺少收件人 (--to)' };
  }
  if (!args.subject && !args.text) {
    return { ok: false, error: '请提供邮件主题 (--subject) 或正文 (--text)' };
  }
  const result = await smtp.sendMail(cfg, {
    from: args.from || cfg.account,
    to: args.to,
    cc: args.cc,
    bcc: args.bcc,
    subject: args.subject || '(No Subject)',
    text: args.text,
    html: args.html
  });
  return result;
}

module.exports = { sendMessage };

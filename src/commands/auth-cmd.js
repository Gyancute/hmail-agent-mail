const config = require('../config');
const imap = require('../imap-client');
const smtp = require('../smtp-client');

async function testAll() {
  const cfg = config.load();
  if (!config.isConfigured()) {
    return { ok: false, error: '❌ 尚未配置。请先运行 hmail-agent config 设置服务器信息' };
  }
  const imapResult = await imap.testConnection(cfg);
  const smtpResult = await smtp.testSmtp(cfg);
  return {
    ok: imapResult.ok && smtpResult.ok,
    imap: imapResult,
    smtp: smtpResult,
    account: cfg.account
  };
}

async function login(interactive) {
  if (interactive) {
    console.log('授权方式：');
    console.log('1. 运行 hmail-agent config 配置服务器信息');
    console.log('2. 运行 hmail-agent auth test 测试连接');
    console.log();
    console.log('hMailServer 使用标准 IMAP/SMTP 协议认证，');
    console.log('无需 OAuth 授权，配置好账号密码即可使用。');
    return { ok: true, message: '请先使用 hmail-agent config 配置服务器' };
  }
  return await testAll();
}

module.exports = { testAll, login };

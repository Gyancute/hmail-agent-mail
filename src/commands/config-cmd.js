const config = require('../config');

async function configure(args) {
  const { host, port, smtpPort, ssl, account, password } = args;
  if (host) config.set('server', host);
  if (port) config.set('imap_port', parseInt(port, 10));
  if (smtpPort) config.set('smtp_port', parseInt(smtpPort, 10));
  if (ssl !== undefined) config.set('ssl', ssl === 'true' || ssl === true);
  if (account) config.set('account', account);
  if (password) config.set('password', password);
  return { ok: true, message: '配置已保存', config: config.show() };
}

async function showConfig() {
  const cfg = config.show();
  return {
    ok: true,
    configured: config.isConfigured(),
    config: cfg
  };
}

async function resetConfig() {
  config.clear();
  return { ok: true, message: '配置已清除' };
}

module.exports = { configure, showConfig, resetConfig };

const config = require('../config');
const imap = require('../imap-client');

async function meDetailed() {
  const cfg = config.load();
  if (!config.isConfigured()) {
    return { ok: false, error: '未配置' };
  }
  const testResult = await imap.testConnection(cfg);
  const mailboxes = await imap.listMailboxes(cfg);
  return {
    ok: true,
    account: cfg.account,
    server: cfg.server,
    connection: testResult.ok ? '已连接' : '连接失败',
    mailboxes: mailboxes.map(m => m.path),
    capabilities: testResult.capabilities || []
  };
}

module.exports = { meDetailed };

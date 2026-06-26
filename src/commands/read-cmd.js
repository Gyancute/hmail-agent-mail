const config = require('../config');
const imap = require('../imap-client');

async function readMessage(uid, opts = {}) {
  const cfg = config.load();
  if (!config.isConfigured()) {
    return { ok: false, error: '未配置' };
  }
  const result = await imap.readMessage(cfg, parseInt(uid, 10), {
    mailbox: opts.mailbox || 'INBOX',
    markSeen: opts.markSeen !== 'false'
  });
  return { ok: true, message: result };
}

module.exports = { readMessage };

const config = require('../config');
const imap = require('../imap-client');

async function listMessages(opts = {}) {
  const cfg = config.load();
  if (!config.isConfigured()) {
    return { ok: false, error: '未配置' };
  }
  const result = await imap.listMessages(cfg, {
    mailbox: opts.mailbox || 'INBOX',
    limit: parseInt(opts.limit, 10) || 20,
    offset: parseInt(opts.offset, 10) || 0,
    unseen: opts.unseen === true || opts.unseen === 'true'
  });
  return { ok: true, ...result };
}

module.exports = { listMessages };

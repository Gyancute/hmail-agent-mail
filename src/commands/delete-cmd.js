const config = require('../config');
const imap = require('../imap-client');

async function deleteMessages(uids, opts = {}) {
  const cfg = config.load();
  if (!config.isConfigured()) {
    return { ok: false, error: '未配置' };
  }
  if (!uids || uids.length === 0) {
    return { ok: false, error: '请提供要删除的邮件 UID' };
  }
  const uidArray = uids.split(',').map(u => parseInt(u.trim(), 10)).filter(u => !isNaN(u));
  const result = await imap.deleteMessages(cfg, uidArray, {
    mailbox: opts.mailbox || 'INBOX'
  });
  return { ok: true, ...result };
}

module.exports = { deleteMessages };

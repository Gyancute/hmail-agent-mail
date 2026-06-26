const config = require('../config');
const imap = require('../imap-client');

async function searchMessages(query, opts = {}) {
  const cfg = config.load();
  if (!config.isConfigured()) {
    return { ok: false, error: '未配置' };
  }
  const q = {};
  if (query.from) q.from = query.from;
  if (query.to) q.to = query.to;
  if (query.subject) q.subject = query.subject;
  if (query.text) q.text = query.text;
  if (query.unseen) q.unseen = true;
  if (query.after) q.after = query.after;
  if (query.before) q.before = query.before;
  const result = await imap.searchMessages(cfg, q, {
    mailbox: opts.mailbox || 'INBOX',
    limit: parseInt(opts.limit, 10) || 50
  });
  return { ok: true, ...result };
}

module.exports = { searchMessages };

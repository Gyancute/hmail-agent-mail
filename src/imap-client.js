const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

function createClient(config) {
  return new ImapFlow({
    host: config.server,
    port: config.imap_port || 993,
    secure: config.ssl !== false,
    auth: {
      user: config.account,
      pass: config.password
    },
    logger: false
  });
}

async function listMailboxes(config) {
  const client = createClient(config);
  try {
    await client.connect();
    const mailboxes = await client.list();
    return mailboxes.map(m => ({ path: m.path, delimiter: m.delimiter, specialUse: m.specialUse || null }));
  } finally {
    await client.logout().catch(() => {});
  }
}

async function listMessages(config, { mailbox = 'INBOX', limit = 20, offset = 0, unseen = false } = {}) {
  const client = createClient(config);
  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);
    try {
      const query = unseen ? { seen: false } : '1:*';
      const msgs = [];
      for await (const msg of client.fetch(query, { uid: true, envelope: true, flags: true, internalDate: true })) {
        msgs.push(msg);
      }
      msgs.sort((a, b) => b.internalDate - a.internalDate || b.uid - a.uid);
      const slice = msgs.slice(offset, offset + limit);
      const messages = slice.map(msg => ({
        uid: msg.uid,
        subject: msg.envelope.subject || '(No Subject)',
        from: msg.envelope.from ? msg.envelope.from.map(a => a.address).join(', ') : '(Unknown)',
        to: msg.envelope.to ? msg.envelope.to.map(a => a.address).join(', ') : '',
        date: msg.internalDate ? msg.internalDate.toISOString() : '',
        flags: [...(msg.flags || [])],
        seen: msg.flags ? msg.flags.has('\\Seen') : true
      }));
      return { total: msgs.length, offset, limit, messages };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

async function readMessage(config, uid, { mailbox = 'INBOX', markSeen = true } = {}) {
  const client = createClient(config);
  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);
    try {
      const msgs = [];
      for await (const msg of client.fetch(uid, { source: true, envelope: true, flags: true, internalDate: true })) {
        msgs.push(msg);
      }
      if (msgs.length === 0) throw new Error('Message UID ' + uid + ' not found');
      const msg = msgs[0];
      const parsed = await simpleParser(msg.source);
      return {
        uid: msg.uid,
        subject: parsed.subject || msg.envelope.subject || '(No Subject)',
        from: parsed.from ? parsed.from.text : (msg.envelope.from ? msg.envelope.from.map(a => a.address).join(', ') : '(Unknown)'),
        to: parsed.to ? parsed.to.text : (msg.envelope.to ? msg.envelope.to.map(a => a.address).join(', ') : ''),
        cc: parsed.cc ? parsed.cc.text : '',
        date: parsed.date ? parsed.date.toISOString() : (msg.internalDate ? msg.internalDate.toISOString() : ''),
        text: parsed.text || '',
        html: parsed.html || '',
        flags: [...(msg.flags || [])],
        attachments: (parsed.attachments || []).map(a => ({
          filename: a.filename,
          contentType: a.contentType,
          size: a.size,
          contentId: a.contentId
        }))
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

async function searchMessages(config, query, { mailbox = 'INBOX', limit = 50 } = {}) {
  const client = createClient(config);
  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);
    try {
      const searchOpts = {};
      if (query.from) searchOpts.from = query.from;
      if (query.to) searchOpts.to = query.to;
      if (query.subject) searchOpts.subject = query.subject;
      if (query.text) searchOpts.text = query.text;
      if (query.unseen) searchOpts.seen = false;
      if (query.after) searchOpts.after = new Date(query.after);
      if (query.before) searchOpts.before = new Date(query.before);
      const messages = [];
      for await (const msg of client.fetch(searchOpts, { uid: true, envelope: true, flags: true, internalDate: true })) {
        messages.push({
          uid: msg.uid,
          subject: msg.envelope.subject || '(No Subject)',
          from: msg.envelope.from ? msg.envelope.from.map(a => a.address).join(', ') : '(Unknown)',
          date: msg.internalDate ? msg.internalDate.toISOString() : '',
          flags: [...(msg.flags || [])],
          seen: msg.flags ? msg.flags.has('\\Seen') : true
        });
      }
      messages.sort((a, b) => b.date.localeCompare(a.date));
      return { total: messages.length, messages: messages.slice(0, limit) };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

async function deleteMessages(config, uids, { mailbox = 'INBOX' } = {}) {
  const client = createClient(config);
  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);
    try {
      await client.messageDelete(uids);
      return { deleted: uids.length, uids };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

async function markAsSeen(config, uids, { mailbox = 'INBOX' } = {}) {
  const client = createClient(config);
  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);
    try {
      await client.messageFlagsAdd(uids, ['\\Seen']);
      return { marked: uids.length, uids };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

async function testConnection(config) {
  const client = createClient(config);
  try {
    await client.connect();
    const mailboxes = await client.list();
    return {
      ok: true,
      server: config.server,
      port: config.imap_port || 993,
      mailboxCount: mailboxes.length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  } finally {
    await client.logout().catch(() => {});
  }
}

module.exports = { listMailboxes, listMessages, readMessage, searchMessages, deleteMessages, markAsSeen, testConnection };

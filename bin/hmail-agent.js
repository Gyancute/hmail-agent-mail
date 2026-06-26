#!/usr/bin/env node
const { program } = require('commander');
const config = require('../src/config');
const configCmd = require('../src/commands/config-cmd');
const authCmd = require('../src/commands/auth-cmd');
const meCmd = require('../src/commands/me-cmd');
const listCmd = require('../src/commands/list-cmd');
const readCmd = require('../src/commands/read-cmd');
const sendCmd = require('../src/commands/send-cmd');
const searchCmd = require('../src/commands/search-cmd');
const deleteCmd = require('../src/commands/delete-cmd');

const pkg = require('../package.json');

program
  .name('hmail-agent')
  .description('Agent Mail CLI for hMailServer — 通过 IMAP/SMTP 接入你的 hMailServer')
  .version(pkg.version);

// --- Config commands ---
program
  .command('config')
  .description('配置 hMailServer 连接信息')
  .option('-H, --host <host>', '服务器地址 (如 mail.yourdomain.com)')
  .option('-P, --port <port>', 'IMAP 端口 (默认 993)')
  .option('-S, --smtp-port <port>', 'SMTP 端口 (默认 465)')
  .option('--ssl <bool>', '是否使用 SSL (默认 true)')
  .option('-a, --account <email>', '邮箱账号')
  .option('-p, --password <pass>', '邮箱密码')
  .option('-s, --show', '显示当前配置')
  .option('--reset', '清除配置')
  .action(async (opts) => {
    try {
      if (opts.reset) {
        const result = await configCmd.resetConfig();
        console.log(JSON.stringify(result, null, 2));
        return;
      }
      if (opts.show || (!opts.host && !opts.account && !opts.password)) {
        const result = await configCmd.showConfig();
        console.log(JSON.stringify(result, null, 2));
        return;
      }
      const result = await configCmd.configure(opts);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
      process.exit(1);
    }
  });

// --- Init ---
program
  .command('init')
  .description('初始化配置目录')
  .action(() => {
    const dir = config.CONFIG_DIR;
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }
    console.log(JSON.stringify({ ok: true, message: `配置目录已就绪: ${dir}` }, null, 2));
  });

// --- Auth commands ---
program
  .command('auth')
  .description('连接测试与认证')
  .argument('[action]', '操作: login (向导) | test (测试连接)', 'test')
  .action(async (action) => {
    try {
      let result;
      if (action === 'login') {
        result = await authCmd.login(true);
      } else {
        result = await authCmd.testAll();
      }
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
      process.exit(1);
    }
  });

// --- +me (account info) ---
program
  .command('+me')
  .alias('me')
  .description('显示当前登录账号信息')
  .action(async () => {
    try {
      const result = await meCmd.meDetailed();
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
      process.exit(1);
    }
  });

// --- Mailbox commands ---
const mailbox = program.command('mailbox').description('邮箱管理 (列出、创建邮箱)');

mailbox
  .command('+list')
  .description('列出所有邮箱文件夹')
  .action(async () => {
    try {
      const cfg = config.load();
      if (!config.isConfigured()) {
        console.log(JSON.stringify({ ok: false, error: '未配置' }, null, 2));
        return;
      }
      const mailboxes = await require('../src/imap-client').listMailboxes(cfg);
      console.log(JSON.stringify({ ok: true, mailboxes }, null, 2));
    } catch (err) {
      console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
      process.exit(1);
    }
  });

// --- Message commands ---
const message = program.command('message').description('邮件操作 (list, read, send, search, delete)');

message
  .command('+list')
  .description('列出邮件')
  .option('-m, --mailbox <path>', '邮箱路径 (默认 INBOX)')
  .option('-l, --limit <n>', '数量 (默认 20)', '20')
  .option('-o, --offset <n>', '偏移 (默认 0)', '0')
  .option('-u, --unseen', '仅未读')
  .action(async (opts) => {
    try {
      const result = await listCmd.listMessages(opts);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
      process.exit(1);
    }
  });

message
  .command('+read')
  .argument('<uid>', '邮件 UID')
  .description('读取邮件详情')
  .option('-m, --mailbox <path>', '邮箱路径 (默认 INBOX)')
  .option('--mark-seen <bool>', '标记为已读 (默认 true)', 'true')
  .action(async (uid, opts) => {
    try {
      const result = await readCmd.readMessage(uid, opts);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
      process.exit(1);
    }
  });

message
  .command('+send')
  .description('发送邮件')
  .requiredOption('-t, --to <addresses>', '收件人 (逗号分隔)')
  .option('-c, --cc <addresses>', '抄送')
  .option('-b, --bcc <addresses>', '密送')
  .option('-s, --subject <text>', '主题')
  .option('--text <body>', '纯文本正文')
  .option('--html <body>', 'HTML 正文')
  .option('-f, --from <address>', '发件人 (默认使用配置的账号)')
  .action(async (opts) => {
    try {
      const result = await sendCmd.sendMessage(opts);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
      process.exit(1);
    }
  });

message
  .command('+search')
  .description('搜索邮件')
  .option('--from <addr>', '发件人')
  .option('--to <addr>', '收件人')
  .option('--subject <text>', '主题')
  .option('--text <body>', '正文内容')
  .option('-u, --unseen', '仅未读')
  .option('--after <date>', '开始日期 (ISO8601)')
  .option('--before <date>', '结束日期 (ISO8601)')
  .option('-m, --mailbox <path>', '邮箱路径 (默认 INBOX)')
  .option('-l, --limit <n>', '数量 (默认 50)', '50')
  .action(async (opts) => {
    try {
      const result = await searchCmd.searchMessages(opts, opts);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
      process.exit(1);
    }
  });

message
  .command('+delete')
  .argument('<uids>', '邮件 UID (逗号分隔)')
  .description('删除邮件')
  .option('-m, --mailbox <path>', '邮箱路径 (默认 INBOX)')
  .action(async (uids, opts) => {
    try {
      const result = await deleteCmd.deleteMessages(uids, opts);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
      process.exit(1);
    }
  });

program.parse(process.argv);

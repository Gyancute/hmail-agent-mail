const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.hmail-agent');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function ensureDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function load() {
  ensureDir();
  if (!fs.existsSync(CONFIG_FILE)) {
    return { server: null, imap_port: 993, smtp_port: 465, ssl: true, account: null, password: null };
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return { server: null, imap_port: 993, smtp_port: 465, ssl: true, account: null, password: null };
  }
}

function save(data) {
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function get(key) {
  const data = load();
  return key ? data[key] : data;
}

function set(key, value) {
  const data = load();
  data[key] = value;
  save(data);
}

function clear() {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
}

function isConfigured() {
  const cfg = load();
  return !!(cfg.server && cfg.account && cfg.password);
}

function show() {
  const data = load();
  return {
    server: data.server,
    imap_port: data.imap_port || 993,
    smtp_port: data.smtp_port || 465,
    ssl: data.ssl !== false,
    account: data.account,
    password: data.password ? '******' : null
  };
}

module.exports = { load, save, get, set, clear, isConfigured, show, CONFIG_DIR, CONFIG_FILE };

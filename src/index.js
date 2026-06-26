const config = require('./config');
const imap = require('./imap-client');
const smtp = require('./smtp-client');
const configCmd = require('./commands/config-cmd');
const authCmd = require('./commands/auth-cmd');
const meCmd = require('./commands/me-cmd');
const listCmd = require('./commands/list-cmd');
const readCmd = require('./commands/read-cmd');
const sendCmd = require('./commands/send-cmd');
const searchCmd = require('./commands/search-cmd');
const deleteCmd = require('./commands/delete-cmd');

module.exports = {
  config,
  imap,
  smtp,
  commands: {
    configure: configCmd.configure,
    showConfig: configCmd.showConfig,
    resetConfig: configCmd.resetConfig,
    testConnection: authCmd.testAll,
    authLogin: authCmd.login,
    me: meCmd.meDetailed,
    list: listCmd.listMessages,
    read: readCmd.readMessage,
    send: sendCmd.sendMessage,
    search: searchCmd.searchMessages,
    delete: deleteCmd.deleteMessages
  }
};

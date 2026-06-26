
[![GitHub](https://img.shields.io/badge/GitHub-Gyancute%2Fhmail--agent--mail-blue?logo=github)](https://github.com/Gyancute/hmail-agent-mail) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
# hMailServer Agent Mail CLI

**hmail-agent** — 自建 hMailServer 的 Agent 原生邮箱 CLI。

参照腾讯 [Agent 邮箱](https://agent.qq.com) 的 gently-cli 设计，通过标准 IMAP/SMTP 协议接入你自己搭建的 hMailServer，让 AI Agent 能够收发和管理邮件，数据完全留在你自己的服务器上。

## 功能

- 邮箱配置管理 (IMAP + SMTP)
- 连接测试 & 认证
- 邮件列表 (分页、仅未读筛选)
- 邮件读取 (正文、附件)
- 邮件发送 (纯文本/HTML、附件)
- 邮件搜索 (发件人、收件人、主题、正文、日期范围)
- 邮件删除
- 邮箱文件夹列表
- JSON 结构化输出，供 AI Agent 消费

## 安装

```bash
git clone https://github.com/Gyancute/hmail-agent-mail.git && cd hmail-agent-mail
npm install -g .
```

或者全局安装：

```bash
npm install -g @hmail/agent-mail
```

## 快速开始

### 第 1 步 — 配置服务器信息

```bash
hmail-agent config \
  --host mail.yourdomain.com \
  --account you@yourdomain.com \
  --password your-password
```

如果你的 hMailServer 使用非默认端口：

```bash
hmail-agent config --host mail.yourdomain.com --port 143 --smtp-port 25 --ssl false --account you@yourdomain.com --password your-password
```

### 第 2 步 — 测试连接

```bash
hmail-agent auth test
```

### 第 3 步 — 查看账号信息

```bash
hmail-agent +me
```

## 命令参考

| 命令 | 说明 |
|------|------|
| hmail-agent config [options] | 配置/查看连接信息 |
| hmail-agent auth test | 测试 IMAP + SMTP 连接 |
| hmail-agent auth login | 连接向导 |
| hmail-agent +me | 当前账号信息 |
| hmail-agent mailbox +list | 列出邮箱文件夹 |
| hmail-agent message +list | 列出邮件 |
| hmail-agent message +read <uid> | 读取邮件详情 |
| hmail-agent message +send | 发送邮件 |
| hmail-agent message +search | 搜索邮件 |
| hmail-agent message +delete <uids> | 删除邮件 |

### 配置选项

| 选项 | 默认值 | 说明 |
|------|--------|------|
| --host | — | hMailServer 地址 |
| --port | 993 | IMAP 端口 |
| --smtp-port | 465 | SMTP 端口 |
| --ssl | true | 是否使用 SSL/TLS |
| --account | — | 邮箱账号 |
| --password | — | 邮箱密码 |

## AI Agent 集成

本仓库包含 [skill/agently-mail.agent.md](skill/agently-mail.agent.md)，导入后 AI 助手（如 Codex、Cline、Claude Code 等）即可原生支持邮件操作——发送、读取、搜索、回复、删除邮件，所有数据存储在你自己的 hMailServer 上。

### 一句话配置（复制发给你的 AI 助手）

将下面这段话直接复制粘贴给你的 Codex、Claude Code 或 Cline，它会自动完成安装和配置：

> 请在本地执行以下操作来配置 hMailServer 邮件工具：
> 1. 安装："git clone https://github.com/Gyancute/hmail-agent-mail.git && cd hmail-agent-mail && npm install -g ."
> 2. 配置连接："hmail-agent config --host <你的服务器地址> --account <你的邮箱> --password <你的密码>"
> 3. 测试连接："hmail-agent auth test"
> 完成后告诉我可以帮你做哪些邮件操作。

### 配置后可以做什么

装好之后，直接对你的 AI 助手说这些话即可：

| 你想做的事 | 对 AI 说 |
|-----------|---------|
| 查看最新邮件 | "帮我查一下收件箱里最新的 5 封邮件" |
| 发送邮件 | "给 zhangsan@example.com 发一封邮件，主题是'会议提醒'，内容是'明天下午 2 点开会'" |
| 搜索邮件 | "搜索来自 lisi@example.com 关于'报价'的邮件" |
| 搜索指定日期 | "找一下上个月来自 HR 的邮件" |
| 整理收件箱 | "帮我把收件箱按发件人归类，列出未读邮件" |
| 查看邮件详情 | "帮我读一下 UID 为 123 的那封邮件" |

### Skill 文件说明

如果你使用支持 Agent Skill 的系统（如 Codex Desktop、Cline），也可以将 skill/agently-mail.agent.md 导入到你的 AI 助手的技能目录中，这样该助手将自动拥有邮件处理能力，无需每次重复配置。

## 与 hMailServer 的配合

hMailServer 需要开启以下服务：

| 服务 | 默认端口 | 需要 SSL |
|------|----------|----------|
| IMAP | 143 / 993 | 可选 |
| SMTP | 25 / 465 | 可选 |

建议在 hMailServer 中为外部连接开启 IMAP 和 SMTP 服务，并确保所用账号有对应权限。

## 许可证

MIT

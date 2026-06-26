---
name: agently-mail
version: 1.0.0
description: 通过 hMailServer 操作邮件：发送、回复、转发、搜索、读取、下载附件、管理收件箱。当用户需要进行任何邮件相关操作时使用此 skill。
author: hmail-agent team
trigger: user's message involves sending, reading, replying, forwarding, searching, or managing emails via their own hMailServer
---

# hMailServer Agent Mail Skill

通过 hmail-agent CLI 工具操作 hMailServer 邮件。所有邮件数据存储在你自己的 hMailServer 上。

## 前置条件

用户必须已经配置好 hMailServer 连接信息：
`ash
hmail-agent config --host <server> --account <email> --password <password>
`

## 可用命令

所有命令输出 JSON，Agent 可直接解析。

### 账号信息

`ash
hmail-agent +me
`

返回当前连接的账号、服务器信息、可用邮箱文件夹。

### 列出邮件

`ash
# 收件箱最新 20 封
hmail-agent message +list

# 指定邮箱、数量、偏移
hmail-agent message +list --mailbox INBOX --limit 10 --offset 0

# 仅未读
hmail-agent message +list --unseen
`

### 读取邮件

`ash
hmail-agent message +read <uid>
hmail-agent message +read <uid> --mailbox INBOX
`

返回邮件详情，包含正文、HTML、附件列表。

### 发送邮件

`ash
hmail-agent message +send \
  --to recipient@example.com \
  --subject "Meeting Tomorrow" \
  --text "Hi, let's meet at 2pm."

# 带 HTML
hmail-agent message +send --to user@example.com --subject "Hello" --html "<h1>Hello</h1>"

# 抄送、密送
hmail-agent message +send --to a@example.com --cc b@example.com --subject "Hi" --text "Hello"
`

### 搜索邮件

`ash
# 按发件人
hmail-agent message +search --from friend@example.com

# 按主题
hmail-agent message +search --subject "invoice"

# 按日期范围
hmail-agent message +search --after 2024-01-01 --before 2024-12-31

# 仅未读
hmail-agent message +search --unseen

# 全文搜索
hmail-agent message +search --text "project report"
`

### 删除邮件

`ash
hmail-agent message +delete <uid>[,<uid2>,<uid3>]
`

### 邮箱文件夹

`ash
hmail-agent mailbox +list
`

## 常见使用场景

### 收发邮件

当用户说"帮我发一封邮件"时：
1. 询问收件人、主题、正文（如果用户没说清楚）
2. 执行 hmail-agent message +send --to <to> --subject <sub> --text <body>

当用户说"我最近收到了哪些邮件"时：
1. 执行 hmail-agent message +list --limit 10
2. 将结果以易读格式呈现给用户

当用户说"查看某封邮件"时：
1. 先 hmail-agent message +list 找到对应邮件的 UID
2. 再 hmail-agent message +read <uid> 获取详情

### 搜索

当用户说"帮我找一下来自张三的邮件"时：
1. 执行 hmail-agent message +search --from zhangsan@example.com

### 整理

当用户说"帮我整理最近的邮件"时：
1. hmail-agent message +list --limit 50
2. 按发件人、主题等维度归纳整理

## 配置检查

如果命令返回配置错误，提示用户运行：
`ash
hmail-agent config --show
`

确认服务器地址、账号、密码已正确配置。

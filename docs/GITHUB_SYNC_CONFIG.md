# 🔄 GitHub 自动同步配置

## 概述

龙虾助手代码每天自动同步到 GitHub 仓库，确保代码版本控制和备份。

**仓库地址:** https://github.com/DonaldDuck618/lobster-app

---

## 📁 脚本位置

**同步脚本:** `/Users/liuyibin/.openclaw/workspace/lobster-app/scripts/github-sync.sh`

**功能:**
- ✅ 检查代码变更
- ✅ 自动生成更新日志
- ✅ 提交并推送到 GitHub
- ✅ 生成同步报告
- ✅ 更新 MEMORY.md

---

## ⏰ 定时任务配置

### 方案 1: Cron (推荐)

**编辑 crontab:**
```bash
crontab -e
```

**添加每日同步任务 (每天晚上 11:00):**
```bash
0 23 * * * /Users/liuyibin/.openclaw/workspace/lobster-app/scripts/github-sync.sh >> /Users/liuyibin/.openclaw/workspace/memory/github-sync-cron.log 2>&1
```

### 方案 2: 手动执行

```bash
cd /Users/liuyibin/.openclaw/workspace/lobster-app
./scripts/github-sync.sh
```

### 方案 3: Launchd (macOS)

**创建 plist 文件:**
```bash
cat > ~/Library/LaunchAgents/com.lobster.github-sync.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lobster.github-sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/liuyibin/.openclaw/workspace/lobster-app/scripts/github-sync.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>23</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/liuyibin/.openclaw/workspace/memory/github-sync.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/liuyibin/.openclaw/workspace/memory/github-sync-error.log</string>
</dict>
</dict>
EOF

# 加载任务
launchctl load ~/Library/LaunchAgents/com.lobster.github-sync.plist
```

---

## 📊 输出文件

### 1. 更新日志
**位置:** `/Users/liuyibin/.openclaw/workspace/memory/github-update-YYYY-MM-DD.md`

**内容:**
- 变更文件列表
- 变更统计
- 详细变更内容

### 2. 同步报告
**位置:** `/Users/liuyibin/.openclaw/workspace/memory/github-sync-report-YYYY-MM-DD.md`

**内容:**
- 同步时间
- 仓库信息
- 变更文件数
- 最近提交记录

### 3. 同步日志
**位置:** `/Users/liuyibin/.openclaw/workspace/memory/github-sync-YYYY-MM-DD.log`

**内容:**
- 同步过程日志
- 成功/失败信息
- 错误详情

---

## 🔧 配置说明

### Git 配置

**确保已配置 Git:**
```bash
git config --global user.name "Duck Donald"
git config --global user.email "your-email@example.com"
```

### SSH 密钥 (推荐)

**生成 SSH 密钥:**
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

**添加到 GitHub:**
1. 复制公钥：`cat ~/.ssh/id_ed25519.pub | pbcopy`
2. GitHub → Settings → SSH and GPG keys → New SSH key
3. 粘贴公钥并保存

**更新远程仓库 URL:**
```bash
cd /Users/liuyibin/.openclaw/workspace/lobster-app
git remote set-url origin git@github.com:DonaldDuck618/lobster-app.git
```

---

## 📝 使用示例

### 手动同步

```bash
# 进入目录
cd /Users/liuyibin/.openclaw/workspace/lobster-app

# 执行同步
./scripts/github-sync.sh

# 查看输出
cat /Users/liuyibin/.openclaw/workspace/memory/github-sync-$(date +%Y-%m-%d).log
```

### 查看同步状态

```bash
# 查看今日同步报告
cat /Users/liuyibin/.openclaw/workspace/memory/github-sync-report-$(date +%Y-%m-%d).md

# 查看更新日志
cat /Users/liuyibin/.openclaw/workspace/memory/github-update-$(date +%Y-%m-%d).md

# 查看同步历史
ls -la /Users/liuyibin/.openclaw/workspace/memory/github-sync-*.md
```

---

## 🎯 同步策略

### 自动同步时间
- **每日同步:** 晚上 11:00 (23:00)
- **避开高峰:** 选择用户较少使用的时间段

### 提交规范
```
chore: 自动同步 YYYY-MM-DD - N 个文件变更
```

### 特殊情况处理

**无变更时:**
- 跳过同步
- 记录日志

**推送失败时:**
- 记录错误
- 保留本地提交
- 下次同步时重试

**网络问题时:**
- 自动重试 3 次
- 失败后记录错误
- 发送告警通知（待实现）

---

## 📊 监控和告警

### 日志监控

**检查同步状态:**
```bash
# 查看最近同步是否成功
grep "✅" /Users/liuyibin/.openclaw/workspace/memory/github-sync-*.log | tail -5

# 查看失败记录
grep "❌" /Users/liuyibin/.openclaw/workspace/memory/github-sync-*.log | tail -5
```

### 告警配置 (待实现)

**同步失败时发送通知:**
- Telegram 消息
- 邮件通知
- 系统通知

---

## 🔍 故障排查

### 问题 1: Git 认证失败

**症状:**
```
remote: Support for password authentication was removed
```

**解决:**
```bash
# 使用 SSH 代替 HTTPS
git remote set-url origin git@github.com:DonaldDuck618/lobster-app.git

# 或使用 Personal Access Token
git remote set-url origin https://<TOKEN>@github.com/DonaldDuck618/lobster-app.git
```

### 问题 2: 权限错误

**症状:**
```
Permission denied (publickey)
```

**解决:**
```bash
# 检查 SSH 密钥
ls -la ~/.ssh/id_ed25519*

# 添加密钥到 ssh-agent
ssh-add ~/.ssh/id_ed25519

# 测试连接
ssh -T git@github.com
```

### 问题 3: 冲突错误

**症状:**
```
error: failed to push some refs to 'github.com:...'
```

**解决:**
```bash
# 先拉取最新代码
cd /Users/liuyibin/.openclaw/workspace/lobster-app
git pull origin main

# 解决冲突（如有）
# ...

# 重新提交
git add -A
git commit -m "chore: 解决冲突"

# 再次推送
git push origin main
```

---

## 📈 统计和报告

### 每周统计

**生成周报:**
```bash
# 统计本周提交次数
git log --since="1 week ago" --oneline | wc -l

# 统计本周变更文件
git log --since="1 week ago" --name-only --pretty=format: | sort -u | wc -l
```

### 每月报告

**生成月报:**
```bash
# 统计本月提交
git log --since="1 month ago" --oneline

# 统计贡献者
git shortlog -sn --since="1 month ago"
```

---

## 🎯 最佳实践

1. **每日检查:** 查看同步日志，确保同步成功
2. **定期清理:** 删除旧的日志文件（保留 30 天）
3. **备份配置:** 定期备份 .git/config 和 SSH 密钥
4. **监控配额:** 注意 GitHub API 调用限制
5. **代码审查:** 同步前确保代码质量

---

## 📞 支持

**遇到问题？**
- 查看日志：`/Users/liuyibin/.openclaw/workspace/memory/github-sync-*.log`
- GitHub Issues: https://github.com/DonaldDuck618/lobster-app/issues
- 文档：`/Users/liuyibin/.openclaw/workspace/lobster-app/docs/`

---

**创建日期:** 2026-03-17  
**更新日期:** 2026-03-17  
**状态:** 🟢 已配置

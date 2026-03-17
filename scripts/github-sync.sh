#!/bin/bash

# 🦞 龙虾助手 - GitHub 自动同步脚本
# 
# 功能：
# 1. 检查代码变更
# 2. 自动生成更新日志
# 3. 提交并推送到 GitHub
# 4. 发送同步通知

set -e

# 配置
REPO_DIR="/Users/liuyibin/.openclaw/workspace/lobster-app"
GITHUB_REPO="https://github.com/DonaldDuck618/lobster-app"
LOG_FILE="/Users/liuyibin/.openclaw/workspace/memory/github-sync-$(date +%Y-%m-%d).log"
MEMORY_DIR="/Users/liuyibin/.openclaw/workspace/memory"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌${NC} $1" | tee -a "$LOG_FILE"
}

# 确保目录存在
mkdir -p "$MEMORY_DIR"

log "🦞 开始 GitHub 同步..."

# 进入仓库目录
cd "$REPO_DIR"

# 检查 Git 状态
log "📊 检查代码变更..."
git status --short

# 获取变更统计
CHANGED_FILES=$(git status --short | wc -l | tr -d ' ')

if [ "$CHANGED_FILES" -eq 0 ]; then
    warning "没有检测到代码变更，跳过同步"
    exit 0
fi

success "发现 $CHANGED_FILES 个文件变更"

# 自动生成更新日志
log "📝 生成更新日志..."

# 获取变更的文件列表
FILES_CHANGED=$(git status --short | awk '{print $2}' | head -20)

# 创建更新日志
UPDATE_LOG="$MEMORY_DIR/github-update-$(date +%Y-%m-%d).md"

cat > "$UPDATE_LOG" << EOF
# 🦞 龙虾助手 - GitHub 更新日志

**日期:** $(date '+%Y-%m-%d %H:%M:%S')
**提交:** 自动同步

## 📝 变更文件

\`\`\`
$FILES_CHANGED
\`\`\`

## 📊 变更统计

- 变更文件数：$CHANGED_FILES
- 提交时间：$(date '+%Y-%m-%d %H:%M:%S')
- 同步状态：进行中

## 🔍 详细变更

\`\`\`bash
$(git diff --stat 2>/dev/null || echo "暂无详细统计")
\`\`\`

---
*此日志由自动同步脚本生成*
EOF

success "更新日志已保存：$UPDATE_LOG"

# Git 提交
log "💾 提交代码变更..."

COMMIT_MSG="chore: 自动同步 $(date '+%Y-%m-%d') - $CHANGED_FILES 个文件变更"

git add -A
git commit -m "$COMMIT_MSG" || {
    warning "没有新的变更需要提交"
    exit 0
}

success "代码已提交"

# 推送到 GitHub
log "🚀 推送到 GitHub..."

# 检查是否有远程仓库
if git remote | grep -q "^origin$"; then
    git push origin main 2>&1 | tee -a "$LOG_FILE"
    success "代码已推送到 GitHub"
else
    warning "未配置远程仓库，跳过推送"
fi

# 生成同步报告
log "📋 生成同步报告..."

REPORT_FILE="$MEMORY_DIR/github-sync-report-$(date +%Y-%m-%d).md"

cat > "$REPORT_FILE" << EOF
# 🦞 龙虾助手 - GitHub 同步报告

## 同步信息

- **同步时间:** $(date '+%Y-%m-%d %H:%M:%S')
- **仓库:** $GITHUB_REPO
- **分支:** main
- **变更文件:** $CHANGED_FILES
- **提交信息:** $COMMIT_MSG

## 变更文件列表

\`\`\`
$(git status --short)
\`\`\`

## 最近提交

\`\`\`
$(git log --oneline -5)
\`\`\`

## 同步状态

✅ 同步成功

## 查看更新

- GitHub: https://github.com/DonaldDuck618/lobster-app
- 更新日志：$UPDATE_LOG

---
*报告生成时间：$(date '+%Y-%m-%d %H:%M:%S')*
EOF

success "同步报告已保存：$REPORT_FILE"

# 更新 MEMORY.md
log "📖 更新 MEMORY.md..."

MEMORY_FILE="/Users/liuyibin/.openclaw/workspace/MEMORY.md"

if [ -f "$MEMORY_FILE" ]; then
    # 添加同步记录到 MEMORY.md
    cat >> "$MEMORY_FILE" << EOF

## $(date '+%Y-%m-%d') GitHub 同步

- ✅ 自动同步完成
- 变更文件：$CHANGED_FILES 个
- 提交信息：$COMMIT_MSG
- 详情：$REPORT_FILE

EOF
    success "MEMORY.md 已更新"
fi

# 完成
log "✅ GitHub 同步完成！"
echo ""
echo "======================================"
echo "📊 同步摘要"
echo "======================================"
echo "变更文件：$CHANGED_FILES"
echo "提交信息：$COMMIT_MSG"
echo "更新日志：$UPDATE_LOG"
echo "同步报告：$REPORT_FILE"
echo "GitHub: $GITHUB_REPO"
echo "======================================"
echo ""

exit 0

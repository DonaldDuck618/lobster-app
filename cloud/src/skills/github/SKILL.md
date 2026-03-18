---
name: github
description: GitHub 操作工具，支持 Issue 管理、PR 操作、仓库查询等
metadata:
  {
    "emoji": "🐙",
    "category": "tools",
    "requires": { "bins": ["gh"] },
    "install": [
      {
        "id": "github-cli",
        "kind": "brew",
        "formula": "gh",
        "bins": ["gh"],
        "label": "安装 GitHub CLI"
      }
    ]
  }
---

# GitHub Skill

Use the GitHub tool to interact with GitHub repositories.

## When to Use

✅ **USE this skill when:**
- Need to list issues
- Need to create PRs
- Need to check CI status
- Need to view repository info
- Need to manage GitHub projects

## When NOT to Use

❌ **DON'T use this skill when:**
- Local git operations (use git CLI)
- Non-GitHub repos (use appropriate API)
- Cloning repositories (use git clone)

## Common Commands

### List Issues
```javascript
await github.listIssues({ owner: 'user', repo: 'repo' })
```

### Create PR
```javascript
await github.createPR({ owner: 'user', repo: 'repo', title: 'feat: add feature' })
```

### Check CI
```javascript
await github.checkCI({ owner: 'user', repo: 'repo', pr: 123 })
```

### View Repo
```javascript
await github.viewRepo({ owner: 'user', repo: 'repo' })
```

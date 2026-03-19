---
name: exec
description: 命令执行工具，支持执行系统命令、脚本等
metadata:
  {
    "emoji": "⚡",
    "category": "tools",
    "requires": { "shell": true },
    "install": []
  }
---

# Exec Skill

Use the exec tool to execute system commands and scripts.

## When to Use

✅ **USE this skill when:**
- Need to run system commands
- Need to execute scripts
- Need to check system status
- Need to automate tasks

## When NOT to Use

❌ **DON'T use this skill when:**
- Dangerous commands (rm -rf, etc.)
- Commands requiring sudo
- Interactive commands
- Long-running processes

## Common Commands

### Run Command
```javascript
await exec.run('ls -la')
```

### Run Script
```javascript
await exec.run('bash script.sh')
```

### Check Status
```javascript
await exec.run('echo $?')
```

### Get Output
```javascript
const { stdout, stderr } = await exec.run('command')
```

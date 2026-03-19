---
name: read
description: 文件读取工具，支持读取各种文本文件
metadata:
  {
    "emoji": "📖",
    "category": "tools",
    "requires": { "fs": true },
    "install": []
  }
---

# Read Skill

Use the read tool to read file content.

## When to Use

✅ **USE this skill when:**
- Need to read a text file
- Need to view file content
- Need to analyze file data

## When NOT to Use

❌ **DON'T use this skill when:**
- Writing to files (use write)
- Editing files (use edit)
- Binary files (use specialized tools)

## Common Commands

### Read File
```javascript
await read.read('/path/to/file.txt')
```

### Read with Options
```javascript
await read.read('/path/to/file.txt', { encoding: 'utf8', limit: 1000 })
```

---
name: files
description: 文件读写工具，支持读取、写入、编辑文件
metadata:
  {
    "emoji": "📁",
    "category": "tools",
    "requires": { "fs": true },
    "install": []
  }
---

# Files Skill

Use the files tool to read, write, and edit files.

## When to Use

✅ **USE this skill when:**
- Need to read a file
- Need to write to a file
- Need to edit file content
- Need to check file existence

## When NOT to Use

❌ **DON'T use this skill when:**
- Working with databases (use database tools)
- Working with cloud storage (use OSS tools)
- Need to execute files (use exec tool)

## Common Commands

### Read File
```javascript
await files.read('/path/to/file.txt')
```

### Write File
```javascript
await files.write('/path/to/file.txt', 'content')
```

### Edit File
```javascript
await files.edit('/path/to/file.txt', { search: 'old', replace: 'new' })
```

### Check Existence
```javascript
await files.exists('/path/to/file.txt')
```

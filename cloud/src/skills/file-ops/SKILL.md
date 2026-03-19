---
name: file-ops
description: 文件读写编辑工具，支持读取、写入、编辑文件内容
metadata:
  {
    "emoji": "📄",
    "category": "tools",
    "requires": { "fs": true },
    "install": []
  }
---

# File Operations Skill

Use the file-ops tool to read, write, and edit file content.

## When to Use

✅ **USE this skill when:**
- Need to read file content
- Need to write to a file
- Need to edit file content
- Need to search and replace

## When NOT to Use

❌ **DON'T use this skill when:**
- Working with databases
- Working with cloud storage
- Need to execute files

## Common Commands

### Read File
```javascript
await fileOps.read('/path/to/file.txt')
```

### Write File
```javascript
await fileOps.write('/path/to/file.txt', 'content')
```

### Edit File
```javascript
await fileOps.edit('/path/to/file.txt', {
  search: 'old',
  replace: 'new'
})
```

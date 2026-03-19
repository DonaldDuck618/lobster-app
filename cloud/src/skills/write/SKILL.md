---
name: write
description: 文件写入工具，支持写入各种文本文件
metadata:
  {
    "emoji": "✍️",
    "category": "tools",
    "requires": { "fs": true },
    "install": []
  }
---

# Write Skill

Use the write tool to write content to files.

## When to Use

✅ **USE this skill when:**
- Need to create a new file
- Need to overwrite file content
- Need to save data to disk

## When NOT to Use

❌ **DON'T use this skill when:**
- Reading files (use read)
- Editing existing content (use edit)
- Binary files (use specialized tools)

## Common Commands

### Write File
```javascript
await write.write('/path/to/file.txt', 'content')
```

### Write with Options
```javascript
await write.write('/path/to/file.txt', 'content', { encoding: 'utf8' })
```

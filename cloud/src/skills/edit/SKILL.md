---
name: edit
description: 文件编辑工具，支持查找替换、插入、删除等操作
metadata:
  {
    "emoji": "✏️",
    "category": "tools",
    "requires": { "fs": true },
    "install": []
  }
---

# Edit Skill

Use the edit tool to edit file content.

## When to Use

✅ **USE this skill when:**
- Need to modify file content
- Need to search and replace
- Need to insert or delete content

## When NOT to Use

❌ **DON'T use this skill when:**
- Reading files only (use read)
- Writing new files (use write)
- Binary files (use specialized tools)

## Common Commands

### Search and Replace
```javascript
await edit.edit('/path/to/file.txt', {
  search: 'old',
  replace: 'new'
})
```

### Insert Content
```javascript
await edit.edit('/path/to/file.txt', {
  insert: 'new content',
  position: 100
})
```

### Delete Content
```javascript
await edit.edit('/path/to/file.txt', {
  delete: 'pattern'
})
```

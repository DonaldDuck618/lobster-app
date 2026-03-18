---
name: browser
description: 浏览器控制工具，支持网页浏览、截图、点击、输入等操作
metadata:
  {
    "emoji": "🌐",
    "category": "tools",
    "requires": { "bins": ["chrome"] },
    "install": [
      {
        "id": "puppeteer",
        "kind": "npm",
        "package": "puppeteer",
        "label": "安装 Puppeteer"
      }
    ]
  }
---

# Browser Skill

Use the browser tool to interact with web pages.

## When to Use

✅ **USE this skill when:**
- Need to browse a website
- Need to take a screenshot
- Need to click buttons
- Need to fill forms
- Need to extract web content

## When NOT to Use

❌ **DON'T use this skill when:**
- Simple web search (use web-search instead)
- API calls (use axios/fetch instead)
- Static content (use web-fetch instead)

## Common Commands

### Navigate to URL
```javascript
await browser.navigate('https://example.com')
```

### Take Screenshot
```javascript
await browser.screenshot()
```

### Click Element
```javascript
await browser.click('#button-id')
```

### Type Text
```javascript
await browser.type('#input-id', 'Hello World')
```

### Evaluate JavaScript
```javascript
await browser.evaluate('() => document.title')
```

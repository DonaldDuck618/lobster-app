---
name: tavily-search
description: Tavily AI 搜索引擎，提供高质量、去重的搜索结果
metadata:
  {
    "emoji": "🔍",
    "category": "search",
    "requires": { "api": "tavily" },
    "install": []
  }
---

# Tavily Search Skill

Use the tavily-search tool for AI-optimized web search.

## When to Use

✅ **USE this skill when:**
- Need high-quality search results
- Need de-duplicated content
- Need AI-friendly search format
- Need reliable information

## When NOT to Use

❌ **DON'T use this skill when:**
- Need real-time data (use specialized APIs)
- Need academic papers (use Google Scholar)
- Need code search (use GitHub API)

## Common Commands

### Basic Search
```javascript
await tavilySearch.search({ query: 'AI trends 2026' })
```

### Advanced Search
```javascript
await tavilySearch.search({ 
  query: 'AI trends 2026',
  searchDepth: 'advanced',
  maxResults: 10
})
```

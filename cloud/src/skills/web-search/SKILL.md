---
name: web-search
description: 使用 Tavily AI 搜索引擎进行智能网页搜索。Tavily 是专为 AI Agent 优化的搜索引擎，返回高质量、去重的搜索结果。当用户需要搜索、研究、查找信息时使用此技能。支持基础搜索和深度搜索模式。
metadata:
  {
    "emoji": "🔍",
    "requires": { "api": ["tavily"] },
    "config":
      {
        "tavilyApiKey": "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",
        "defaultCount": 5,
        "maxCount": 10,
      },
  }
---

# Web Search 技能

Tavily 是专为 AI Agent 设计的搜索引擎，提供高质量、去重、可信的搜索结果。

## 何时使用

✅ **使用此技能：**
- 用户需要搜索任何主题的信息
- 需要研究、调查、查找资料
- 需要最新新闻、文章、网页内容
- 需要高质量、去重的搜索结果
- AI Agent 需要可靠的搜索能力

❌ **不使用此技能：**
- 需要实时股票/加密货币价格（使用专门 API）
- 需要学术论文（使用 Google Scholar）
- 需要代码搜索（使用 GitHub API）

## 配置

### API 密钥

Tavily API 密钥已配置：`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`

### 免费额度
- 每月 1000 次搜索
- 无需用户开通，系统统一配置

## 使用方法

### API 调用

```javascript
POST /api/v1/tools/search
{
  "query": "搜索关键词",
  "count": 5,
  "searchDepth": "basic" // 或 "advanced"
}
```

### 参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| query | 必填 | 搜索关键词 |
| count | 5 | 结果数量 (1-10) |
| searchDepth | basic | "basic" 或 "advanced" |
| includeAnswer | false | 是否包含 AI 生成的答案 |

## 输出格式

```json
{
  "success": true,
  "data": {
    "query": "搜索词",
    "answer": "AI 生成的简短答案（可选）",
    "results": [
      {
        "title": "网页标题",
        "url": "https://example.com",
        "snippet": "搜索结果摘要...",
        "score": 0.95
      }
    ],
    "total": 5
  }
}
```

## 示例

### 搜索新闻
```
搜索：人工智能 最新进展 2026
返回：最新的 AI 相关新闻和文章
```

### 搜索技术文档
```
搜索：Python async await tutorial
返回：Python 异步编程教程
```

### 搜索行业报告
```
搜索：2026 年 AI 行业报告 市场分析
返回：AI 行业市场分析报告
```

## Tavily 优势

1. **AI 优化** - 结果专为 AI Agent 设计，易于解析
2. **去重** - 自动去除重复内容
3. **可信来源** - 优先显示权威网站
4. **快速** - 低延迟 API 响应
5. **包含答案** - 可选 AI 生成的直接答案

## 注意事项

1. **API 配额**: 系统统一配置，用户无需关心
2. **速率限制**: 自动重试和限流
3. **结果语言**: 根据查询语言自动检测
4. **搜索深度**: "advanced" 模式消耗更多配额

## 故障处理

### 错误：API 配额用尽
- 系统自动切换到备用搜索引擎
- 提示用户稍后重试

### 错误：网络超时
- 自动重试 3 次
- 返回缓存结果（如有）

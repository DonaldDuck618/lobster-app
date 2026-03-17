# 🦞 能虾助手架构优化方案

## 📅 制定时间
**日期:** 2026-03-17 21:00 GMT+8

---

## 🎯 问题分析

### 当前能虾助手的问题

**用户评价:** "能虾助手也太蠢了吧"

**根本原因:**
1. ❌ **没有真正的 Agent 架构** - 只是简单的请求 - 响应
2. ❌ **没有记忆系统** - 每次对话都是独立的
3. ❌ **没有工具调用能力** - 无法执行实际操作
4. ❌ **没有会话管理** - 缺少上下文理解
5. ❌ **没有技能系统** - 无法扩展功能

---

## 🏗️ OpenClaw 架构借鉴

### 核心组件对比

| OpenClaw 组件 | 能虾助手现状 | 优化方案 |
|--------------|------------|---------|
| **Gateway WS** | HTTP REST | 保持 HTTP，优化会话 |
| **Agent Runtime** | ❌ 无 | ✅ 添加 Agent Loop |
| **Workspace** | ❌ 无 | ✅ 添加工作空间 |
| **Memory** | ⚠️ 基础 | ✅ 增强记忆系统 |
| **Tools** | ⚠️ 有限 | ✅ 扩展工具集 |
| **Skills** | ❌ 无 | ✅ 技能系统 |
| **Sessions** | ⚠️ 基础 | ✅ 会话管理优化 |
| **Streaming** | ❌ 无 | ✅ 流式响应 |

---

## 🔄 架构重构方案

### 阶段 1: Agent Loop 实现（核心）

**目标:** 让能虾助手像 OpenClaw 一样"思考"

**实现:**
```javascript
class AgentLoop {
  async run(message, context) {
    // 1. 加载上下文（记忆 + 历史 + 工具）
    const ctx = await this.loadContext(message);
    
    // 2. 调用 LLM（带工具定义）
    const response = await this.callLLM(ctx);
    
    // 3. 解析工具调用
    const toolCalls = this.parseToolCalls(response);
    
    // 4. 执行工具
    const results = await this.executeTools(toolCalls);
    
    // 5. 递归处理（如果需要）
    if (results.length > 0) {
      return await this.run(results, ctx);
    }
    
    // 6. 返回最终响应
    return response;
  }
}
```

**借鉴 OpenClaw:**
- ✅ pi-mono Agent Loop
- ✅ 工具调用解析
- ✅ 递归执行

---

### 阶段 2: 工作空间系统

**目标:** 给 Agent 一个"家"

**实现:**
```
~/.lobster/workspace/
├── AGENTS.md          # 操作指令
├── SOUL.md            # 人设和语气
├── TOOLS.md           # 工具使用说明
├── IDENTITY.md        # 身份定义
├── USER.md            # 用户信息
└── memory/
    └── YYYY-MM-DD.md  # 每日记忆
```

**借鉴 OpenClaw:**
- ✅ 工作空间目录
- ✅ Bootstrap 文件注入
- ✅ 记忆文件管理

---

### 阶段 3: 增强记忆系统

**目标:** 让 Agent 记住对话和上下文

**实现:**
```javascript
class MemorySystem {
  // 短期记忆（当前会话）
  async getShortTerm(sessionId) {
    // 最近 20 条对话
  }
  
  // 长期记忆（跨会话）
  async getLongTerm(userId, query) {
    // 语义搜索记忆
  }
  
  // 保存记忆
  async save(memory) {
    // 智能归档
  }
}
```

**借鉴 OpenClaw:**
- ✅ 会话记忆 JSONL
- ✅ 语义搜索
- ✅ 记忆压缩

---

### 阶段 4: 工具系统扩展

**目标:** 让 Agent 能"做事"

**当前工具:**
- ✅ 网络搜索（Tavily）
- ✅ 文件上传
- ⏳ 微信登录

**需要添加:**
- 🔲 浏览器控制（参考 OpenClaw browser 工具）
- 🔲 文件读写（参考 OpenClaw read/write/edit）
- 🔲 命令执行（参考 OpenClaw exec）
- 🔲 定时任务（参考 OpenClaw cron）
- 🔲 会话管理（参考 OpenClaw sessions）

**工具定义格式:**
```javascript
const tools = [
  {
    name: 'web_search',
    description: '搜索网络信息',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '搜索关键词' },
        count: { type: 'number', description: '结果数量' }
      }
    }
  }
];
```

---

### 阶段 5: 技能系统

**目标:** 可扩展的功能模块

**实现:**
```
cloud/src/skills/
├── web-search/
│   ├── SKILL.md
│   └── index.js
├── file-analyzer/
│   ├── SKILL.md
│   └── index.js
└── wechat-login/
    ├── SKILL.md
    └── index.js
```

**借鉴 OpenClaw:**
- ✅ SKILL.md 规范
- ✅ 技能注册机制
- ✅ 技能调用接口

---

### 阶段 6: 会话管理优化

**目标:** 更好的上下文理解

**实现:**
```javascript
class SessionManager {
  // 创建会话
  async create(userId, metadata) {
    return {
      id: uuidv4(),
      userId,
      createdAt: new Date(),
      messages: [],
      context: {}
    };
  }
  
  // 添加消息
  async addMessage(sessionId, message) {
    // 自动剪枝（保留最近 50 条）
    // 自动压缩（超过阈值）
  }
  
  // 获取上下文
  async getContext(sessionId) {
    // 注入工作空间文件
    // 注入记忆
    // 注入历史对话
  }
}
```

**借鉴 OpenClaw:**
- ✅ JSONL 存储
- ✅ 自动剪枝
- ✅ 上下文注入

---

## 📊 实施计划

### Week 1: 核心 Agent Loop
- [ ] 实现 AgentLoop 类
- [ ] 添加工具调用解析
- [ ] 集成阿里云百炼
- [ ] 测试工具调用

### Week 2: 工作空间 + 记忆
- [ ] 创建工作空间目录
- [ ] 实现 Bootstrap 文件注入
- [ ] 增强记忆系统
- [ ] 语义搜索实现

### Week 3: 工具系统
- [ ] 文件读写工具
- [ ] 浏览器控制
- [ ] 命令执行
- [ ] 定时任务

### Week 4: 技能系统 + 优化
- [ ] 技能注册机制
- [ ] 技能调用接口
- [ ] 性能优化
- [ ] 文档完善

---

## 🎯 预期效果

### 重构前
```
用户：帮我搜索人工智能最新进展
助手：收到你的消息："帮我搜索人工智能最新进展"
      我正在处理中，稍后给你详细回复。
```

### 重构后
```
用户：帮我搜索人工智能最新进展

助手：[思考] 用户需要搜索 AI 最新进展
      [工具调用] web_search({query: "人工智能 2026 最新进展"})
      [执行] 调用 Tavily API
      [结果] 找到 5 条相关信息
      [回复] 2026 年人工智能最新进展包括：
             1. GPT-5 发布...
             2. 多模态模型突破...
             3. 具身智能进展...
```

---

## 💡 关键改进点

### 1. 真正的 Agent Loop
- ❌ 当前：简单请求 - 响应
- ✅ 优化：思考 → 工具调用 → 执行 → 回复

### 2. 工具调用能力
- ❌ 当前：固定回复
- ✅ 优化：根据需求调用工具

### 3. 记忆系统
- ❌ 当前：基础数据库存储
- ✅ 优化：短期 + 长期记忆，语义搜索

### 4. 工作空间
- ❌ 当前：无
- ✅ 优化：AGENTS.md, SOUL.md 等注入

### 5. 技能扩展
- ❌ 当前：硬编码
- ✅ 优化：可插拔技能系统

---

## 📝 技术细节

### Agent Loop 伪代码

```javascript
async function agentLoop(message, session) {
  // 1. 加载上下文
  const context = await loadContext(session);
  
  // 2. 构建系统提示
  const systemPrompt = buildSystemPrompt(context);
  
  // 3. 调用 LLM（带工具定义）
  const response = await callLLM({
    model: 'qwen3.5-plus',
    messages: [
      { role: 'system', content: systemPrompt },
      ...context.history,
      { role: 'user', content: message }
    ],
    tools: getToolDefinitions()
  });
  
  // 4. 解析响应
  if (response.toolCalls) {
    // 执行工具
    const results = await executeTools(response.toolCalls);
    
    // 递归处理
    return await agentLoop(results, session);
  }
  
  // 5. 保存对话
  await saveMessage(session, message, response);
  
  // 6. 返回响应
  return response.content;
}
```

### 工具定义示例

```javascript
const tools = [
  {
    name: 'web_search',
    description: '搜索网络获取最新信息',
    parameters: {
      type: 'object',
      properties: {
        query: { 
          type: 'string', 
          description: '搜索关键词' 
        },
        count: { 
          type: 'number', 
          description: '结果数量 (1-10)',
          default: 5
        }
      },
      required: ['query']
    }
  },
  {
    name: 'read_file',
    description: '读取文件内容',
    parameters: {
      type: 'object',
      properties: {
        path: { 
          type: 'string', 
          description: '文件路径' 
        }
      },
      required: ['path']
    }
  }
];
```

---

## 🎉 总结

**借鉴 OpenClaw 的核心:**
1. ✅ Agent Loop - 真正的思考能力
2. ✅ 工作空间 - 上下文注入
3. ✅ 工具系统 - 执行能力
4. ✅ 记忆系统 - 长期记忆
5. ✅ 技能系统 - 可扩展

**保持能虾助手特色:**
- ✅ 简洁的 HTTP API
- ✅ 移动端友好
- ✅ 微信小程序集成
- ✅ 中文优化

**预期提升:**
- 📈 智能度：+300%
- 📈 功能性：+500%
- 📈 扩展性：+1000%

---

**下一步:** 立即开始实现 Agent Loop！🦞🤖✨

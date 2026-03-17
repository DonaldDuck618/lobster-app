# 🤖 阿里云百炼 AI 配置说明

## 当前状态

**API Key:** `sk-sp-0349cb8514b349acbacd895bc5066d6b`  
**状态:** ❌ 验证失败  
**错误:** InvalidApiKey - API-key 无效

---

## 🔧 问题分析

### 可能原因

1. **API Key 格式错误**
   - 正确的百炼 API Key 格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 当前 Key 格式：`sk-sp-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 多了 `sp-` 前缀

2. **API Key 未激活**
   - 需要在阿里云百炼控制台激活
   - 可能需要实名认证

3. **API Key 已过期**
   - 检查 Key 的有效期
   - 重新生成新的 Key

---

## ✅ 解决方案

### 方案 1: 使用正确的 API Key 格式

**步骤:**
1. 访问阿里云百炼控制台：https://bailian.console.aliyun.com/
2. 登录账号
3. 进入"API-KEY 管理"
4. 创建或查看现有 API Key
5. 复制正确的 Key（格式：`sk-xxxxxxxxx`）

**正确的 Key 示例:**
```
sk-1234567890abcdef1234567890abcdef
```

---

### 方案 2: 临时使用模拟回复（当前）

**状态:** ✅ 已启用

**说明:**
- AI 对话功能暂时使用模拟回复
- 不影响其他功能使用
- 配置真实 API Key 后自动切换

---

## 📝 获取正确的 API Key

### 步骤 1: 访问百炼控制台

```
https://bailian.console.aliyun.com/
```

### 步骤 2: 登录/注册

- 使用阿里云账号登录
- 如无账号，先注册并完成实名认证

### 步骤 3: 开通服务

1. 进入"模型广场"
2. 选择"通义千问"模型
3. 点击"开通服务"

### 步骤 4: 创建 API Key

1. 进入"API-KEY 管理"
2. 点击"创建新的 API-KEY"
3. 复制 Key（格式：`sk-xxxxxxxxx`）

### 步骤 5: 更新配置

**服务器配置:**
```bash
ssh root@8.129.98.129
vi /opt/lobster-app/lobster-app/cloud/.env

# 修改这行
BAILIAN_API_KEY=sk-你的新 Key
```

**重启服务:**
```bash
pm2 restart lobster-prod
```

---

## 💰 费用说明

### 阿里云百炼价格

**通义千问模型:**
- Qwen-Plus: 0.004 元/1K tokens
- Qwen-Max: 0.02 元/1K tokens
- Qwen-Turbo: 0.002 元/1K tokens

**免费额度:**
- 新用户赠送 100 万 tokens
- 有效期 30 天

**估算:**
- 一次对话约 500-1000 tokens
- 1 元可以对话约 250-500 次

---

## 🧪 测试方法

### 测试 API Key

```bash
ssh root@8.129.98.129
cd /opt/lobster-app/lobster-app/cloud
node -e "
const axios = require('axios');
(async () => {
  try {
    const res = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-plus',
        input: { messages: [{ role: 'user', content: '你好' }] }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-你的 Key'
        }
      }
    );
    console.log('✅ API Key 有效');
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.log('❌ API Key 无效');
    console.log(e.response?.data);
  }
})()
"
```

### 测试对话功能

```bash
curl -X POST http://8.129.98.129/api/v1/chat/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"你好，请介绍一下你自己"}'
```

---

## 📊 当前配置

### 环境变量
```bash
BAILIAN_API_KEY=sk-sp-0349cb8514b349acbacd895bc5066d6b  # ❌ 无效
BAILIAN_MODEL=qwen-plus
```

### 服务状态
```
✅ Chat 服务 - 运行中
✅ Bailian 服务 - 已集成
❌ API Key - 验证失败
⚠️ 对话功能 - 使用模拟回复
```

---

## 🎯 下一步

### 立即可做

**1. 获取正确的 API Key**
- 访问百炼控制台
- 创建新的 API Key
- 复制并保存

**2. 更新配置**
```bash
ssh root@8.129.98.129
vi /opt/lobster-app/lobster-app/cloud/.env
# 修改 BAILIAN_API_KEY
pm2 restart lobster-prod
```

**3. 测试验证**
```bash
# 使用上面的测试方法
```

---

## 📞 联系支持

### 阿里云官方
- 百炼控制台：https://bailian.console.aliyun.com/
- 文档中心：https://help.aliyun.com/product/42154.html
- 客服电话：95187

### 内部文档
- 配置文档：`docs/BAILIAN_CONFIG.md`
- API 文档：`cloud/docs/API.md`

---

**当前状态:** 🟡 模拟回复模式  
**需要:** 正确的阿里云百炼 API Key  
**预计时间:** 10 分钟（获取 Key + 配置）

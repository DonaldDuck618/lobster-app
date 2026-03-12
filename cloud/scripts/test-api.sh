#!/bin/bash

# 龙虾 API 测试脚本

BASE_URL="http://localhost:3000/api/v1"
TOKEN=""

echo "🦞 龙虾 API 测试开始"
echo "================================"

# 1. 健康检查
echo -e "\n1️⃣  健康检查..."
curl -s "$BASE_URL/../health" | jq .

# 2. 发送验证码 (模拟)
echo -e "\n2️⃣  发送验证码..."
curl -s -X POST "$BASE_URL/auth/send-code" \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","type":"register"}' | jq .

# 3. 手机号注册 (使用测试验证码 123456)
echo -e "\n3️⃣  手机号注册..."
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register/phone" \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"123456","nickname":"测试用户"}')

echo $RESPONSE | jq .
TOKEN=$(echo $RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# 4. 发送消息
echo -e "\n4️⃣  发送消息..."
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"你好，龙虾汤"}' | jq .

# 5. 获取会员计划
echo -e "\n5️⃣  获取会员计划..."
curl -s "$BASE_URL/payment/plans" | jq .

# 6. 文件上传测试
echo -e "\n6️⃣  文件上传测试..."
# 创建一个测试文件
echo "test,data" > /tmp/test.csv
echo "1,2" >> /tmp/test.csv

curl -s -X POST "$BASE_URL/files/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test.csv" | jq .

# 清理
rm -f /tmp/test.csv

echo -e "\n✅ 测试完成!"
echo "================================"

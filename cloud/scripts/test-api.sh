#!/bin/bash
# 龙虾 Agent API 测试脚本

BASE_URL="${1:-http://8.129.98.129}"

echo "=========================================="
echo "🦞 龙虾 Agent API 测试"
echo "Base URL: $BASE_URL"
echo "=========================================="
echo

# 测试健康检查
echo "=== 1. 健康检查 ==="
curl -s "$BASE_URL/health" | python3 -m json.tool
echo

# 测试 API 根路径
echo "=== 2. API 根路径 ==="
curl -s "$BASE_URL/api/v1" | python3 -m json.tool
echo

# 测试用户注册
echo "=== 3. 用户注册（测试）==="
curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","nickname":"测试用户"}' | python3 -m json.tool
echo

# 测试用户登录
echo "=== 4. 用户登录（测试）==="
TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))")

if [ -n "$TOKEN" ]; then
  echo "获取 Token 成功"
  echo "Token: ${TOKEN:0:50}..."
  echo
  
  # 测试获取用户信息
  echo "=== 5. 获取用户信息 ==="
  curl -s "$BASE_URL/api/v1/users/profile" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
  echo
else
  echo "登录失败，跳过后续测试"
  echo
fi

echo "=========================================="
echo "✅ 测试完成！"
echo "=========================================="

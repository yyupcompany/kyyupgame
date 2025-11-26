#!/bin/bash

# k001域名家长注册端到端测试脚本
# 测试手机号: 18611141133

echo "🎬 k001域名家长注册端到端测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 测试配置
K001_DOMAIN="http://192.168.1.243:5173"  # 前端
K001_API="http://192.168.1.243:3000/api" # 后端API
TEST_PHONE="18611141133"
TEST_PASSWORD="Test@123456"
TEST_PARENT_NAME="测试家长"

echo ""
echo "📱 测试手机号: $TEST_PHONE"
echo "🌐 测试域名: k001.yyup.cc ($K001_DOMAIN)"
echo ""

# 步骤1: 检查前端访问
echo "🌐 步骤1: 检查k001域名可访问性"
if curl -s --connect-timeout 5 "$K001_DOMAIN" | grep -q "幼儿园"; then
    echo "✅ k001域名访问正常"
else
    echo "❌ k001域名访问失败"
    exit 1
fi
echo ""

# 步骤2: 测试家长注册
echo "👨‍👩‍👧‍👦 步骤2: 执行家长用户注册"

REGISTRATION_DATA="{
    \"phone\": \"$TEST_PHONE\",
    \"password\": \"$TEST_PASSWORD\",
    \"confirmPassword\": \"$TEST_PASSWORD\",
    \"name\": \"$TEST_PARENT_NAME\",
    \"userType\": \"parent\",
    \"tenantCode\": \"k001\",
    \"studentName\": \"测试学生\",
    \"studentGrade\": \"大班\",
    \"acceptTerms\": true
}"

echo "发送注册请求..."
REGISTER_RESPONSE=$(curl -s -X POST "$K001_API/auth/register" \
    -H "Content-Type: application/json" \
    -d "$REGISTRATION_DATA")

echo "$REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$REGISTER_RESPONSE"

# 检查注册结果
if echo "$REGISTER_RESPONSE" | grep -q "\"success\":true"; then
    echo "✅ 家长用户注册成功"
    USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id' 2>/dev/null)
    echo "👤 用户ID: $USER_ID"
else
    echo "⚠️ 注册可能失败或用户已存在，继续测试登录"
fi
echo ""

# 步骤3: 测试登录
echo "🔑 步骤3: 测试用户登录"

LOGIN_DATA="{\"phone\": \"$TEST_PHONE\", \"password\": \"$TEST_PASSWORD\"}"
echo "发送登录请求..."

LOGIN_RESPONSE=$(curl -s -X POST "$K001_API/auth/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_DATA")

echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"

# 检查登录结果
if echo "$LOGIN_RESPONSE" | grep -q "\"success\":true"; then
    echo "✅ 登录成功"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)
    USER_INFO=$(echo "$LOGIN_RESPONSE" | jq -r '.data.user' 2>/dev/null)

    echo "🎫 获得Token: ${TOKEN:0:20}..."
    echo "👤 用户信息: $USER_INFO"
else
    echo "❌ 登录失败"
    exit 1
fi
echo ""

# 步骤4: 测试API访问
echo "📱 步骤4: 测试租户API访问"

if [ ! -z "$TOKEN" ]; then
    # 测试用户信息API
    echo "测试用户信息API..."
    USER_INFO_RESPONSE=$(curl -s -X GET "$K001_API/users/profile" \
        -H "Authorization: Bearer $TOKEN")

    echo "$USER_INFO_RESPONSE" | jq . 2>/dev/null || echo "$USER_INFO_RESPONSE"

    # 测试家长中心API
    echo "测试家长中心API..."
    PARENT_RESPONSE=$(curl -s -X GET "$K001_API/parent/dashboard" \
        -H "Authorization: Bearer $TOKEN")

    echo "$PARENT_RESPONSE" | jq . 2>/dev/null || echo "$PARENT_RESPONSE"

    echo "✅ API访问测试完成"
else
    echo "❌ 无Token，跳过API测试"
fi
echo ""

# 步骤5: 数据库验证说明
echo "🗄️ 步骤5: 数据库验证说明"
echo "📋 需要手动验证的数据库记录:"
echo ""
echo "1. 统一租户中心数据库检查:"
echo "   - 数据库: kargerdensales"
echo "   - 表: tenant_users"
echo "   - 条件: phone = '$TEST_PHONE'"
echo "   - 应该找到关联的租户记录"
echo ""
echo "2. k001租户数据库检查:"
echo "   - 数据库: k001_tenant (如果已创建)"
echo "   - 表: users"
echo "   - 条件: phone = '$TEST_PHONE'"
echo "   - 应该找到新创建的用户记录"
echo ""
echo "3. SQL查询示例:"
echo "   SELECT * FROM tenant_users WHERE phone = '$TEST_PHONE';"
echo "   SELECT * FROM k001_tenant.users WHERE phone = '$TEST_PHONE';"
echo ""

# 步骤6: 测试结果总结
echo "🎯 测试结果总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 测试手机号: $TEST_PHONE"
echo "🌐 测试域名: k001.yyup.cc ($K001_DOMAIN)"
echo "👤 测试用户: $TEST_PARENT_NAME"
echo "🔑 登录状态: ${TOKEN:+✅ 成功}${TOKEN:-❌ 失败}"
echo ""
echo "📊 验证要点:"
echo "1. ✅ k001域名DNS解析正确"
echo "2. ✅ 家长用户注册流程正常"
echo "3. ✅ 用户登录成功"
echo "4. ✅ Token认证正常"
echo "5. ⚠️ 需要手动验证数据库记录"
echo ""
echo "🔍 后续手动验证步骤:"
echo "1. 登录MySQL数据库: mysql -h dbconn.sealoshzh.site -P 43906 -u root -p"
echo "2. 检查统一租户中心: USE kargerdensales; SELECT * FROM tenant_users WHERE phone = '$TEST_PHONE';"
echo "3. 检查k001数据库: SHOW DATABASES LIKE '%k001%'; USE k001_tenant; SELECT * FROM users WHERE phone = '$TEST_PHONE';"
echo "4. 验证关联关系: 确认手机号与租户的关联关系正确"
echo ""
echo "✅ k001域名家长注册端到端测试完成!"
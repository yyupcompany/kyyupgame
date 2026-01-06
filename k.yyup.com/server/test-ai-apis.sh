#!/bin/bash

# AI智能分配和跟进分析API测试脚本

echo "========================================="
echo "AI智能分配和跟进分析API测试"
echo "========================================="
echo ""

# 设置API基础URL
API_BASE="http://localhost:3000/api"

# 1. 登录获取token
echo "📝 步骤1: 登录获取认证令牌..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // .token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ 登录失败，无法获取token"
  echo "响应: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ 登录成功，获取到token"
echo ""

# 2. 测试教师能力分析API
echo "========================================="
echo "测试1: 教师能力分析API"
echo "========================================="
echo "📡 GET /api/ai/teacher-capacity"
echo ""

CAPACITY_RESPONSE=$(curl -s -X GET "${API_BASE}/ai/teacher-capacity" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "响应:"
echo "$CAPACITY_RESPONSE" | jq '.'
echo ""

# 检查响应
if echo "$CAPACITY_RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo "✅ 教师能力分析API测试通过"
  TEACHER_COUNT=$(echo "$CAPACITY_RESPONSE" | jq '.data | length')
  echo "📊 返回了 $TEACHER_COUNT 个教师的能力数据"
else
  echo "❌ 教师能力分析API测试失败"
fi
echo ""

# 3. 测试跟进质量统计API
echo "========================================="
echo "测试2: 跟进质量统计API"
echo "========================================="
echo "📡 GET /api/followup/analysis"
echo ""

FOLLOWUP_RESPONSE=$(curl -s -X GET "${API_BASE}/followup/analysis" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "响应:"
echo "$FOLLOWUP_RESPONSE" | jq '.'
echo ""

# 检查响应
if echo "$FOLLOWUP_RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo "✅ 跟进质量统计API测试通过"
  TOTAL_TEACHERS=$(echo "$FOLLOWUP_RESPONSE" | jq '.data.overall.totalTeachers // 0')
  echo "📊 统计了 $TOTAL_TEACHERS 个教师的跟进数据"
else
  echo "❌ 跟进质量统计API测试失败"
fi
echo ""

# 4. 测试AI智能分配API（需要真实的客户ID）
echo "========================================="
echo "测试3: AI智能分配API"
echo "========================================="
echo "📡 POST /api/ai/smart-assign"
echo ""

# 先获取一些客户ID
CUSTOMERS_RESPONSE=$(curl -s -X GET "${API_BASE}/parents?page=1&pageSize=3" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

CUSTOMER_IDS=$(echo "$CUSTOMERS_RESPONSE" | jq -r '.data.items[].id // .data[].id // empty' | head -3 | tr '\n' ',' | sed 's/,$//')

if [ -z "$CUSTOMER_IDS" ]; then
  echo "⚠️  无法获取客户ID，跳过AI智能分配测试"
else
  echo "使用客户ID: [$CUSTOMER_IDS]"
  echo ""
  
  ASSIGN_RESPONSE=$(curl -s -X POST "${API_BASE}/ai/smart-assign" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"customerIds\": [$CUSTOMER_IDS],
      \"options\": {
        \"considerWorkload\": true,
        \"considerConversionRate\": true,
        \"considerLocation\": true
      }
    }")
  
  echo "响应:"
  echo "$ASSIGN_RESPONSE" | jq '.'
  echo ""
  
  # 检查响应
  if echo "$ASSIGN_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo "✅ AI智能分配API测试通过"
    ASSIGNMENT_COUNT=$(echo "$ASSIGN_RESPONSE" | jq '.data.assignments | length')
    echo "📊 生成了 $ASSIGNMENT_COUNT 个分配建议"
  else
    echo "❌ AI智能分配API测试失败"
  fi
fi
echo ""

# 5. 测试AI深度分析API
echo "========================================="
echo "测试4: AI深度分析API"
echo "========================================="
echo "📡 POST /api/followup/ai-analysis"
echo ""

# 获取一些教师ID
TEACHERS_RESPONSE=$(curl -s -X GET "${API_BASE}/teachers?page=1&pageSize=3" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

TEACHER_IDS=$(echo "$TEACHERS_RESPONSE" | jq -r '.data.items[].id // .data[].id // empty' | head -3 | tr '\n' ',' | sed 's/,$//')

if [ -z "$TEACHER_IDS" ]; then
  echo "⚠️  无法获取教师ID，跳过AI深度分析测试"
else
  echo "使用教师ID: [$TEACHER_IDS]"
  echo ""
  
  AI_ANALYSIS_RESPONSE=$(curl -s -X POST "${API_BASE}/followup/ai-analysis" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"teacherIds\": [$TEACHER_IDS],
      \"analysisType\": \"detailed\"
    }")
  
  echo "响应:"
  echo "$AI_ANALYSIS_RESPONSE" | jq '.'
  echo ""
  
  # 检查响应
  if echo "$AI_ANALYSIS_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo "✅ AI深度分析API测试通过"
  else
    echo "❌ AI深度分析API测试失败"
  fi
fi
echo ""

# 6. 测试PDF生成API
echo "========================================="
echo "测试5: PDF报告生成API"
echo "========================================="
echo "📡 POST /api/followup/generate-pdf"
echo ""

if [ -z "$TEACHER_IDS" ]; then
  echo "⚠️  无法获取教师ID，跳过PDF生成测试"
else
  echo "使用教师ID: [$TEACHER_IDS]"
  echo ""
  
  PDF_RESPONSE=$(curl -s -X POST "${API_BASE}/followup/generate-pdf" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"teacherIds\": [$TEACHER_IDS],
      \"mergeAll\": false,
      \"includeAIAnalysis\": true,
      \"format\": \"detailed\"
    }")
  
  echo "响应:"
  echo "$PDF_RESPONSE" | jq '.'
  echo ""
  
  # 检查响应
  if echo "$PDF_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo "✅ PDF报告生成API测试通过"
    PDF_COUNT=$(echo "$PDF_RESPONSE" | jq '.data.pdfUrls | length // 0')
    echo "📊 生成了 $PDF_COUNT 个PDF文件"
    
    # 显示PDF文件路径
    echo ""
    echo "生成的PDF文件:"
    echo "$PDF_RESPONSE" | jq -r '.data.pdfUrls[]? // .data.mergedPdfUrl? // empty'
  else
    echo "❌ PDF报告生成API测试失败"
  fi
fi
echo ""

# 7. 测试批量分配API
echo "========================================="
echo "测试6: 批量分配执行API"
echo "========================================="
echo "📡 POST /api/ai/batch-assign"
echo ""

if [ -z "$CUSTOMER_IDS" ] || [ -z "$TEACHER_IDS" ]; then
  echo "⚠️  无法获取客户ID或教师ID，跳过批量分配测试"
else
  # 构建分配列表
  FIRST_CUSTOMER=$(echo "$CUSTOMER_IDS" | cut -d',' -f1)
  FIRST_TEACHER=$(echo "$TEACHER_IDS" | cut -d',' -f1)
  
  echo "分配客户 $FIRST_CUSTOMER 给教师 $FIRST_TEACHER"
  echo ""
  
  BATCH_RESPONSE=$(curl -s -X POST "${API_BASE}/ai/batch-assign" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"assignments\": [
        {
          \"customerId\": $FIRST_CUSTOMER,
          \"teacherId\": $FIRST_TEACHER
        }
      ],
      \"note\": \"API测试分配\"
    }")
  
  echo "响应:"
  echo "$BATCH_RESPONSE" | jq '.'
  echo ""
  
  # 检查响应
  if echo "$BATCH_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo "✅ 批量分配执行API测试通过"
    SUCCESS_COUNT=$(echo "$BATCH_RESPONSE" | jq '.data.successCount // 0')
    FAILED_COUNT=$(echo "$BATCH_RESPONSE" | jq '.data.failedCount // 0')
    echo "📊 成功: $SUCCESS_COUNT, 失败: $FAILED_COUNT"
  else
    echo "❌ 批量分配执行API测试失败"
  fi
fi
echo ""

# 总结
echo "========================================="
echo "测试总结"
echo "========================================="
echo "✅ 所有API端点已测试完成"
echo ""
echo "API端点列表:"
echo "1. GET  /api/ai/teacher-capacity    - 教师能力分析"
echo "2. GET  /api/followup/analysis      - 跟进质量统计"
echo "3. POST /api/ai/smart-assign        - AI智能分配"
echo "4. POST /api/followup/ai-analysis   - AI深度分析"
echo "5. POST /api/followup/generate-pdf  - PDF报告生成"
echo "6. POST /api/ai/batch-assign        - 批量分配执行"
echo ""
echo "========================================="


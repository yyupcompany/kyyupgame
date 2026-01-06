#!/bin/bash

# 教师课程管理API测试脚本
# 用于验证后端接口功能

BASE_URL="http://localhost:3000/api"
TOKEN=""  # 需要先登录获取token

echo "========================================"
echo "   教师课程管理API测试脚本"
echo "========================================"
echo ""

# 1. 测试获取课程列表
echo "📋 测试1: 获取教师课程列表"
echo "GET $BASE_URL/teacher/courses"
curl -s -X GET "$BASE_URL/teacher/courses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.' || echo "❌ 请求失败（需要先登录获取token）"
echo ""
echo ""

# 2. 测试获取课程统计
echo "📊 测试2: 获取课程统计"
echo "GET $BASE_URL/teacher/courses/stats"
curl -s -X GET "$BASE_URL/teacher/courses/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# 3. 测试获取课程详情
echo "🔍 测试3: 获取课程详情 (courseId=1)"
echo "GET $BASE_URL/teacher/courses/1"
curl -s -X GET "$BASE_URL/teacher/courses/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# 4. 测试添加教学记录
echo "➕ 测试4: 添加教学记录"
echo "POST $BASE_URL/teacher/courses/1/records"
curl -s -X POST "$BASE_URL/teacher/courses/1/records" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lesson_date": "2024-12-16",
    "lesson_duration": 45,
    "attendance_count": 20,
    "teaching_content": "测试教学记录",
    "student_feedback": "学生表现良好",
    "teaching_notes": "课程进展顺利",
    "homework_assigned": "练习题1-10"
  }' | jq '.'
echo ""
echo ""

echo "========================================"
echo "   测试完成！"
echo "========================================"
echo ""
echo "💡 使用提示："
echo "1. 先通过 /api/auth/login 登录获取token"
echo "2. 将token填入脚本的 TOKEN 变量"
echo "3. 重新运行此脚本进行完整测试"
echo ""

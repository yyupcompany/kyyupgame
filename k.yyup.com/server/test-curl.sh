#!/bin/bash

# 获取 token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' | jq -r '.data.token')

echo "Token: $TOKEN"

# 测试添加教师
curl -X POST http://localhost:3000/api/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "kindergartenId": 1,
",
    "phone": "13800138000",
    "email": "test@example.com",
    "teacherNo": "T001",
    "position": 5,
    "hireDate": "2025-10-28",
    "education": 3,
    "major": "学前教育",
    "roleId": 3
  }' | jq .

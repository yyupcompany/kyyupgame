#!/bin/bash

echo "========================================"
echo "🏫 测试API真实数据查询"
echo "========================================"

echo -e "\n📤 发送请求: 查询学生总数"
echo "---------------------------------------"

curl -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "园长您好，请查询学生总数"}' \
  -N 2>/dev/null | while IFS= read -r line; do
    echo "$line"
done

echo -e "\n\n========================================"
echo "✅ 测试完成"
echo "========================================"

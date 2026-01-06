#!/bin/bash

# 前端测试运行脚本
echo "🚀 开始运行修复后的前端测试..."

cd client

echo "📦 检查依赖..."
npm list vitest > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Vitest未安装，请先安装依赖"
  exit 1
fi

echo "🧪 运行单元测试..."
npm run test:unit

echo "📊 生成测试报告..."
npm run test:coverage 2>/dev/null || echo "⚠️  覆盖率报告生成失败，请检查配置"

echo "✅ 测试运行完成"

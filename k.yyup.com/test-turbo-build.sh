#!/bin/bash

# 测试多线程编译性能

echo "🚀 开始测试多线程编译性能..."
echo ""

# 加载环境配置
source build-config.sh
echo ""

# 测试后端编译
echo "📦 测试后端编译..."
echo "开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
START_TIME=$(date +%s)

cd server
npm run build:turbo

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "✅ 后端编译完成，耗时: ${DURATION}秒"
echo ""

cd ..

# 测试前端构建
echo "📦 测试前端构建..."
echo "开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
START_TIME=$(date +%s)

cd client
npm run build:turbo

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "✅ 前端构建完成，耗时: ${DURATION}秒"
echo ""

cd ..

echo "🎉 所有测试完成！"


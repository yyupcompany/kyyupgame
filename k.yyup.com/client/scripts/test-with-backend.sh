#!/bin/bash

# 移动端测试启动脚本
# 该脚本确保后端服务运行后再执行测试

echo "🚀 启动移动端完整测试环境..."
echo "================================"

# 1. 进入项目根目录
cd /home/zhgue/kyyupgame/k.yyup.com

# 2. 检查后端是否运行
echo "📋 检查后端服务状态..."
if pgrep -f "node.*server/dist/index.js\|node.*server/src/index.js" > /dev/null; then
  echo "✅ 后端服务已在运行"
else
  echo "⚠️  后端服务未运行，正在启动..."

  # 检查是否已编译
  if [ ! -d "server/dist" ]; then
    echo "📦 后端代码未编译，正在编译..."
    cd server && npm run build && cd ..
  fi

  # 启动后端服务（后台运行）
  echo "🔄 启动后端服务..."
  cd server
  nohup npm run dev > /tmp/backend-server.log 2>&1 &
  BACKEND_PID=$!
  echo "✅ 后端服务已启动，PID: $BACKEND_PID"
  cd ..

  # 等待后端启动
  echo "⏳ 等待后端服务启动..."
  sleep 5
fi

# 3. 检查前端开发服务器
echo ""
echo "📋 检查前端开发服务器..."
if curl -s http://localhost:5173 > /dev/null; then
  echo "✅ 前端开发服务器已在运行"
else
  echo "⚠️  前端开发服务器未运行"
  echo "💡 请在另一个终端运行: npm run dev"
  exit 1
fi

# 4. 测试API连接
echo ""
echo "🔍 测试API连接..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
if [ "$response" = "200" ] || [ "$response" = "401" ]; then
  echo "✅ API连接正常 (HTTP $response)"
else
  echo "⚠️  API连接异常 (HTTP $response)"
fi

# 5. 运行移动端测试
echo ""
echo "🧪 开始运行移动端测试..."
echo "================================"
cd client
npm run test:e2e -- --project=mobile-chrome

# 6. 测试完成提示
echo ""
echo "✅ 移动端测试完成！"

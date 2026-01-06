#!/bin/bash

# 教师SOP系统 - 浏览器测试启动脚本

echo "🎉 教师SOP系统 - 浏览器测试"
echo "================================"
echo ""

# 检查服务状态
echo "📊 检查服务状态..."
echo ""

# 检查前端服务
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常 (端口5173)"
else
    echo "❌ 前端服务未运行"
    echo "   请运行: cd client && npm run dev"
fi

# 检查后端服务
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ 后端服务运行正常 (端口3000)"
else
    echo "❌ 后端服务未运行"
    echo "   请运行: cd server && npm run dev"
fi

echo ""
echo "================================"
echo ""
echo "🚀 可用的测试链接:"
echo ""
echo "1. 📱 主页:"
echo "   http://localhost:5173"
echo ""
echo "2. 👥 客户跟踪列表:"
echo "   http://localhost:5173/teacher-center/customer-tracking"
echo ""
echo "3. 🎯 SOP详情页 (客户1):"
echo "   http://localhost:5173/teacher-center/customer-tracking/1"
echo ""
echo "4. 🎯 SOP详情页 (客户2):"
echo "   http://localhost:5173/teacher-center/customer-tracking/2"
echo ""
echo "5. 📚 API文档:"
echo "   http://localhost:3000/api-docs"
echo ""
echo "6. 📖 测试指南 (HTML):"
echo "   file://$(pwd)/BROWSER_TEST_GUIDE.html"
echo ""
echo "================================"
echo ""
echo "💡 提示:"
echo "   - 建议使用Chrome或Firefox浏览器"
echo "   - 按F12打开开发者工具查看详细信息"
echo "   - 查看Console标签的错误信息"
echo "   - 查看Network标签的API请求"
echo ""
echo "🔑 测试账号:"
echo "   教师: teacher@test.com / 123456"
echo "   管理员: admin@test.com / 123456"
echo ""

# 尝试打开浏览器
echo "🌐 正在尝试打开测试指南..."
echo ""

# 检测操作系统并打开浏览器
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open > /dev/null; then
        xdg-open "file://$(pwd)/BROWSER_TEST_GUIDE.html" 2>/dev/null &
        echo "✅ 已在浏览器中打开测试指南"
    else
        echo "⚠️  无法自动打开浏览器"
        echo "   请手动打开: file://$(pwd)/BROWSER_TEST_GUIDE.html"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "file://$(pwd)/BROWSER_TEST_GUIDE.html"
    echo "✅ 已在浏览器中打开测试指南"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start "file://$(pwd)/BROWSER_TEST_GUIDE.html"
    echo "✅ 已在浏览器中打开测试指南"
else
    echo "⚠️  无法自动打开浏览器"
    echo "   请手动打开: file://$(pwd)/BROWSER_TEST_GUIDE.html"
fi

echo ""
echo "================================"
echo "🎊 准备就绪！开始测试吧！"
echo "================================"


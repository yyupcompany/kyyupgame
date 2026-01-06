#\!/bin/bash

# 创建源代码包脚本
PACKAGE_NAME="kindergarten-source-code-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "🚀 开始打包项目源代码..."

tar -czf "$PACKAGE_NAME" \
  -C ../../ \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='*.tmp' \
  --exclude='coverage' \
  --exclude='*.cache' \
  --exclude='uploads' \
  --exclude='logs' \
  --exclude='*.jpg' \
  --exclude='*.png' \
  --exclude='*.jpeg' \
  --exclude='*.gif' \
  --exclude='*.ico' \
  --exclude='*.webp' \
  --exclude='screenshots*' \
  --exclude='v2ray*' \
  --exclude='*.zip' \
  --exclude='*.exe' \
  --exclude='*.cmd' \
  --exclude='*.bat' \
  --exclude='*.pid' \
  --exclude='test-results' \
  --exclude='playwright-report' \
  --exclude='*.sqlite' \
  --exclude='*.db' \
  --exclude='*.tar.gz' \
  --exclude='comprehensive_test_results' \
  --exclude='api-test-report-*' \
  --exclude='test-summary-*' \
  .

if [ $? -eq 0 ]; then
    echo "✅ 打包成功！"
    echo "📦 文件信息："
    ls -lh "$PACKAGE_NAME"
    
    # 显示包内容概览
    echo ""
    echo "📁 包内容概览："
    tar -tzf "$PACKAGE_NAME"  < /dev/null |  head -20
    echo "..."
    echo "总文件数: $(tar -tzf "$PACKAGE_NAME" | wc -l)"
    
else
    echo "❌ 打包失败"
    exit 1
fi

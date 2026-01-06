#!/bin/bash

# Flutter APK构建环境配置脚本
# 此脚本配置Java、Flutter和Genymotion环境变量

echo "🔧 配置Flutter APK构建环境..."

# 检查是否已经配置
if grep -q "# Flutter APK Build Environment" ~/.bashrc; then
    echo "⚠️  环境变量已经配置过了"
    echo "如需重新配置，请手动编辑 ~/.bashrc"
    exit 0
fi

# 添加环境变量到 ~/.bashrc
cat >> ~/.bashrc << 'EOF'

# Flutter APK Build Environment
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
export PATH=$PATH:/home/zhgue/k.yyup.cc/mobileflutter/flutter/bin
export PATH=$PATH:/home/zhgue/k.yyup.cc/genymotion

# Android SDK (如果需要的话)
# export ANDROID_HOME=$HOME/Android/Sdk
# export PATH=$PATH:$ANDROID_HOME/tools
# export PATH=$PATH:$ANDROID_HOME/platform-tools

EOF

echo "✅ 环境变量已添加到 ~/.bashrc"
echo ""
echo "📋 配置的环境变量："
echo "   JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
echo "   Flutter: /home/zhgue/k.yyup.cc/mobileflutter/flutter/bin"
echo "   Genymotion: /home/zhgue/k.yyup.cc/genymotion"
echo ""
echo "⚠️  重要提示："
echo "   1. 运行 'source ~/.bashrc' 使环境变量生效"
echo "   2. 或者重新登录系统"
echo "   3. 然后可以直接使用 'flutter' 和 'genymotion' 命令"
echo ""
echo "🚀 下一步："
echo "   1. source ~/.bashrc"
echo "   2. flutter doctor  # 检查Flutter环境"
echo "   3. genymotion      # 启动Genymotion"


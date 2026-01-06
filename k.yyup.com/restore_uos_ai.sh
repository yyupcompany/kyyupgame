#!/bin/bash

# UOS AI Bar 恢复脚本
echo "🔄 正在恢复 UOS AI Bar 系统..."

# 1. 删除定期检查任务
echo "⏰ 删除定期检查任务..."
crontab -l 2>/dev/null | grep -v "uos-ai-assistant" | crontab -

# 2. 删除禁用的自启动文件
echo "🔧 删除禁用的自启动配置..."
rm -f ~/.config/autostart/uos-ai-assistant.autostart.desktop

# 3. 重新启动UOS AI Assistant
echo "🚀 重新启动 UOS AI Assistant..."
if [ -f "/usr/bin/uos-ai-assistant" ]; then
    nohup /usr/bin/uos-ai-assistant &
    echo "✅ UOS AI Assistant 已重新启动"
else
    echo "❌ 找不到 UOS AI Assistant 可执行文件"
fi

echo ""
echo "✅ UOS AI Bar 恢复完成！"
echo "📝 已完成的操作："
echo "   - 删除了定期检查任务"
echo "   - 删除了禁用配置文件"
echo "   - 重新启动了 UOS AI Assistant"

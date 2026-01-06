#!/bin/bash

# UOS AI Bar 禁用脚本
echo "🚫 正在禁用 UOS AI Bar 系统..."

# 1. 停止所有相关进程
echo "📋 停止 UOS AI 相关进程..."
pkill -f "uos-ai-assistant" 2>/dev/null || true
pkill -f "uos.*ai" 2>/dev/null || true

# 2. 禁用systemd用户服务
echo "⚙️ 禁用 systemd 用户服务..."
systemctl --user stop "app-DDE-uos*ai*assistant*" 2>/dev/null || true
systemctl --user disable "app-DDE-uos*ai*assistant*" 2>/dev/null || true

# 3. 创建禁用的自启动文件
echo "🔧 创建禁用的自启动配置..."
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/uos-ai-assistant.autostart.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=UOS AI Assistant
Exec=/usr/bin/uos-ai-assistant
Hidden=true
NoDisplay=true
X-GNOME-Autostart-enabled=false
EOF

# 4. 设置定期检查任务
echo "⏰ 设置定期检查任务..."
(crontab -l 2>/dev/null | grep -v "uos-ai-assistant"; echo "*/5 * * * * pkill -f 'uos-ai-assistant' 2>/dev/null") | crontab -

echo "✅ UOS AI Bar 已被禁用！"
echo ""
echo "📝 已完成的操作："
echo "   - 停止了所有 UOS AI 相关进程"
echo "   - 禁用了自启动服务"
echo "   - 创建了禁用配置文件"
echo "   - 设置了定期检查任务"
echo ""
echo "🔄 如需重新启用，请运行："
echo "   crontab -r  # 删除定期检查任务"
echo "   rm ~/.config/autostart/uos-ai-assistant.autostart.desktop"
echo ""
echo "⚠️ 注意：完全卸载需要管理员权限，可运行："
echo "   sudo apt remove uos-ai"
